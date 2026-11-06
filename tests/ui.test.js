import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { BrandMark, OverflowNav, SchoolFooter, UiButton, UiConfirm, UiInput, UiSelect, createBrand, skUi } from '../src/index.js'

describe('UiButton', () => {
  it('показывает индикатор загрузки', () => {
    const wrapper = mount(UiButton, { props: { loading: true }, slots: { default: 'Сохранить' } })
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toBe('Сохранить')
  })

  it('отправляет форму по type="submit"', () => {
    const wrapper = mount(UiButton, { props: { type: 'submit' } })
    expect(wrapper.attributes('type')).toBe('submit')
    expect(wrapper.attributes('disabled')).toBeUndefined()
  })
})

describe('UiInput', () => {
  it('связывает подпись и поле, показывает ошибку', () => {
    const wrapper = mount(UiInput, { props: { label: 'Название', error: 'Заполните поле' } })
    const input = wrapper.get('input')
    expect(wrapper.get('label').attributes('for')).toBe(input.attributes('id'))
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(wrapper.text()).toContain('Заполните поле')
  })

  it('обновляет v-model', async () => {
    const wrapper = mount(UiInput, { props: { modelValue: '', 'onUpdate:modelValue': (v) => wrapper.setProps({ modelValue: v }) } })
    await wrapper.get('input').setValue('SkolStart')
    expect(wrapper.props('modelValue')).toBe('SkolStart')
  })
})

describe('UiSelect', () => {
  const OPTIONS = '<option :value="null">Без этапа</option><option :value="1">Финал</option><option :value="2">Отбор</option>'
  const mountSelect = ({ modelValue = null, ...attrs } = {}, options = OPTIONS) =>
    mount(
      { components: { UiSelect }, props: ['attrs'], emits: ['pick'], data: () => ({ value: modelValue }), template: `<UiSelect v-model="value" v-bind="attrs" @update:model-value="$emit('pick', $event)">${options}</UiSelect>` },
      { props: { attrs }, attachTo: document.body },
    )
  const items = () => [...document.body.querySelectorAll('[role="option"]')]
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('показывает выбранный вариант и отдаёт значение с его типом', async () => {
    const wrapper = mountSelect({ modelValue: 1 })
    const trigger = wrapper.get('[role="combobox"]')
    expect(trigger.text()).toContain('Финал')
    await trigger.trigger('click')
    expect(items().map((li) => li.textContent.trim())).toEqual(['Без этапа', 'Финал', 'Отбор'])
    items()[2].click()
    await nextTick()
    expect(wrapper.emitted('pick')[0]).toEqual([2])
    expect(items()).toHaveLength(0)
    expect(trigger.text()).toContain('Отбор')
    wrapper.unmount()
  })

  it('выбирает с клавиатуры и закрывается по Escape', async () => {
    const wrapper = mountSelect()
    const trigger = wrapper.get('[role="combobox"]')
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    expect(trigger.attributes('aria-expanded')).toBe('true')
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('pick')[0]).toEqual([1])
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'Escape' })
    expect(trigger.attributes('aria-expanded')).toBe('false')
    wrapper.unmount()
  })

  it('выбор нескольких не закрывает список и хранит массив', async () => {
    const wrapper = mountSelect({ multiple: true, modelValue: [1] }, '<option :value="1">Финал</option><option :value="2">Отбор</option>')
    const trigger = wrapper.get('[role="combobox"]')
    await trigger.trigger('click')
    items()[1].click()
    await nextTick()
    expect(wrapper.emitted('pick')[0]).toEqual([[1, 2]])
    items()[0].click()
    await nextTick()
    expect(wrapper.emitted('pick')[1]).toEqual([[2]])
    expect(items()).toHaveLength(2)
    wrapper.unmount()
  })

  it('поиск включается на длинном списке и фильтрует варианты', async () => {
    const long = Array.from({ length: 12 }, (_, i) => `<option :value="${i}">Вариант ${i}</option>`).join('')
    const wrapper = mountSelect({}, long)
    await wrapper.get('[role="combobox"]').trigger('click')
    await nextTick()
    const search = document.body.querySelector('input[type="search"]')
    search.value = 'т 11'
    search.dispatchEvent(new Event('input'))
    await nextTick()
    expect(items().map((li) => li.textContent.trim())).toEqual(['Вариант 11'])
    wrapper.unmount()
  })

  it('короткий список без поиска, значение подсвечено как ошибка', async () => {
    const wrapper = mountSelect({ invalid: true })
    const trigger = wrapper.get('[role="combobox"]')
    expect(trigger.attributes('aria-invalid')).toBe('true')
    await trigger.trigger('click')
    await nextTick()
    expect(document.body.querySelector('input[type="search"]')).toBeNull()
    wrapper.unmount()
  })
})

describe('UiConfirm', () => {
  const mountConfirm = (props = {}) =>
    mount(UiConfirm, {
      props: { title: 'Удалить?', confirmLabel: 'Удалить', open: true, 'onUpdate:open': (v) => wrapper.setProps({ open: v }), ...props },
      slots: { default: 'Без восстановления' },
      attachTo: document.body,
    })
  let wrapper
  const dialog = () => document.body.querySelector('dialog')
  const button = (text) => [...dialog().querySelectorAll('button')].find((b) => b.textContent.trim() === text)
  afterEach(() => {
    wrapper.unmount()
    document.body.innerHTML = ''
  })

  it('показывает текст и сообщает о подтверждении', async () => {
    wrapper = mountConfirm()
    await nextTick()
    expect(dialog().textContent).toContain('Без восстановления')
    button('Удалить').click()
    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })

  it('закрывается отменой, по Esc и по фону', async () => {
    for (const close of [() => button('Отмена').click(), () => dialog().dispatchEvent(new Event('cancel')), () => dialog().click()]) {
      wrapper = mountConfirm()
      await nextTick()
      close()
      await nextTick()
      expect(dialog()).toBeNull()
      expect(wrapper.emitted('confirm')).toBeUndefined()
      wrapper.unmount()
    }
    wrapper = mountConfirm({ open: false })
  })

  it('не закрывается, пока идёт действие', async () => {
    wrapper = mountConfirm({ loading: true })
    await nextTick()
    dialog().dispatchEvent(new Event('cancel'))
    await nextTick()
    expect(dialog()).not.toBeNull()
  })
})

describe('бренд', () => {
  it('собирает заголовок вкладки', () => {
    const brand = createBrand('Конкурсы')
    expect(brand.pageTitle()).toBe('Конкурсы · Гимназия Сколково')
    expect(brand.pageTitle('Мероприятия')).toBe('Мероприятия - Конкурсы · Гимназия Сколково')
  })

  it('BrandMark берёт название сервиса из плагина', () => {
    const wrapper = mount(BrandMark, { global: { plugins: [[skUi, { serviceName: 'Опросы' }]] } })
    expect(wrapper.text()).toContain('Опросы')
    expect(wrapper.text()).toContain('Гимназия Сколково')
    expect(wrapper.get('img').attributes('src')).toBe('/favicon.svg')
  })

  it('SchoolFooter ведёт на хаб и сайт гимназии без плагина', () => {
    const wrapper = mount(SchoolFooter)
    const links = wrapper.findAll('a').map((a) => a.attributes('href'))
    expect(links).toEqual(['https://skolhub.ru/', 'https://gymnasium.sk.ru/'])
  })
})

describe('OverflowNav', () => {
  const ITEM_WIDTH = 100
  const LINKS = ['Первый', 'Второй', 'Третий', 'Четвёртый', 'Пятый'].map((label) => ({ label, to: { name: 'home' } }))
  let navWidth
  let resize

  const mountNav = async (width) => {
    navWidth = width
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback) {
          resize = callback
        }
        observe() {}
        disconnect() {}
      },
    )
    // В jsdom нет раскладки: ширины задаём сами, как их дал бы браузер
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(() => ITEM_WIDTH)
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => navWidth)
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', name: 'home', component: { template: '<div />' } }],
    })
    const wrapper = mount(OverflowNav, { props: { links: LINKS }, global: { plugins: [router] } })
    await nextTick()
    await nextTick()
    return wrapper
  }

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('скрытый ряд измерения не расширяет страницу', async () => {
    const wrapper = await mountNav(1000)
    const row = wrapper.get('[aria-hidden="true"]')
    expect(row.classes()).toEqual(expect.arrayContaining(['invisible', 'absolute', 'w-0', 'overflow-hidden']))
    expect(row.findAll('span').map((item) => item.text())).toEqual(LINKS.map((link) => link.label))
    // Без whitespace-nowrap пункты сжались бы в ряду нулевой ширины и измерялись бы неверно
    for (const item of row.findAll('span')) expect(item.classes()).toContain('whitespace-nowrap')
  })

  it('показывает все пункты, когда они помещаются', async () => {
    const wrapper = await mountNav(1000)
    expect(wrapper.findAll('a')).toHaveLength(LINKS.length)
    expect(wrapper.find('[data-overflow-more]').exists()).toBe(false)
  })

  it('уносит непоместившиеся пункты в «Ещё» и возвращает при расширении', async () => {
    const wrapper = await mountNav(350)
    expect(wrapper.findAll('a').map((a) => a.text())).toEqual(['Первый', 'Второй'])

    await wrapper.get('[data-overflow-more] button').trigger('click')
    expect(wrapper.findAll('[role="menuitem"]').map((a) => a.text())).toEqual(['Третий', 'Четвёртый', 'Пятый'])

    navWidth = 1000
    resize()
    await nextTick()
    expect(wrapper.find('[data-overflow-more]').exists()).toBe(false)
    expect(wrapper.findAll('a')).toHaveLength(LINKS.length)
  })
})
