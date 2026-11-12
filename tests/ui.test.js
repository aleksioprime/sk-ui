import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { BrandMark, OverflowNav, SchoolFooter, UiButton, UiConfirm, UiDialog, UiInput, UiSelect, UiSwitch, createBrand, skUi } from '../src/index.js'

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

describe('UiSwitch', () => {
  it('передаёт новое состояние и связывает подпись с переключателем', async () => {
    const wrapper = mount(UiSwitch, { props: { label: 'Опрос доступен', hint: 'Вступает в силу сразу', modelValue: true } })
    expect(wrapper.attributes('role')).toBe('switch')
    expect(wrapper.attributes('aria-checked')).toBe('true')
    expect(wrapper.get('[id="' + wrapper.attributes('aria-labelledby') + '"]').text()).toBe('Опрос доступен')
    expect(wrapper.get('[id="' + wrapper.attributes('aria-describedby') + '"]').text()).toBe('Вступает в силу сразу')
    await wrapper.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
    await wrapper.setProps({ modelValue: false })
    expect(wrapper.attributes('aria-checked')).toBe('false')
  })

  it('игнорирует повторное действие во время запроса', async () => {
    const wrapper = mount(UiSwitch, { props: { label: 'Опрос доступен', loading: true } })
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.attributes('aria-disabled')).toBe('true')
    await wrapper.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
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

describe('UiDialog', () => {
  it('связывает заголовок с окном и блокирует отмену во время сохранения', async () => {
    const wrapper = mount(UiDialog, { props: { title: 'Новая запись' }, attachTo: document.body })
    try {
      const dialog = document.body.querySelector('dialog[data-ui-dialog]')
      dialog.showModal = vi.fn(() => { dialog.open = true })
      dialog.close = vi.fn(() => { dialog.open = false })

      await wrapper.setProps({ open: true, busy: true })
      expect(dialog.showModal).toHaveBeenCalledOnce()
      expect(document.getElementById(dialog.getAttribute('aria-labelledby')).textContent).toBe('Новая запись')
      dialog.dispatchEvent(new Event('cancel', { cancelable: true }))
      expect(wrapper.emitted('update:open')).toBeUndefined()

      await wrapper.setProps({ busy: false })
      dialog.dispatchEvent(new Event('cancel', { cancelable: true }))
      expect(wrapper.emitted('update:open')).toEqual([[false]])
      await wrapper.setProps({ open: false })
      expect(dialog.close).toHaveBeenCalledOnce()
    } finally {
      wrapper.unmount()
    }
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

  const mountNav = async (width, options = {}) => {
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
    const wrapper = mount(OverflowNav, { props: { links: LINKS }, global: { plugins: [router] }, ...options })
    await nextTick()
    await nextTick()
    return wrapper
  }

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('бургер открывается кликом по значку, который при открытии сменяется', async () => {
    const wrapper = await mountNav(300)
    const button = wrapper.find('[data-overflow-burger] button')
    document.body.append(wrapper.element)
    // В браузере значок перерисовывается до обработчика на документе: нажатый элемент уже вне документа
    const icon = document.createElement('span')
    button.element.append(icon)
    button.element.addEventListener('click', () => icon.remove())
    icon.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()
    expect(button.attributes('aria-expanded')).toBe('true')
    wrapper.element.remove()
    wrapper.unmount()
  })

  it('скрытый ряд измерения не расширяет страницу', async () => {
    const wrapper = await mountNav(1000)
    const row = wrapper.get('div[aria-hidden="true"]')
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

  it('на узком экране прячет ряд пунктов и показывает бургер', async () => {
    const wrapper = await mountNav(350)
    expect(wrapper.get('[data-overflow-burger]').classes()).toContain('sm:hidden')
    expect(wrapper.get('[data-overflow-more]').classes()).toEqual(expect.arrayContaining(['hidden', 'sm:block']))
    for (const link of wrapper.findAll('a')) expect(link.classes()).toEqual(expect.arrayContaining(['hidden', 'sm:block']))
  })

  it('бургер раскрывает все пункты на ширину экрана', async () => {
    const wrapper = await mountNav(350)
    const button = wrapper.get('[data-overflow-burger] button')
    expect(button.attributes('aria-expanded')).toBe('false')
    expect(wrapper.findAll('[data-overflow-burger] a')).toHaveLength(0)

    await button.trigger('click')
    expect(button.attributes('aria-expanded')).toBe('true')
    expect(wrapper.findAll('[data-overflow-burger] a').map((a) => a.text())).toEqual(LINKS.map((link) => link.label))
    const panel = wrapper.get('[data-overflow-burger] div')
    expect(panel.attributes('style')).toContain('width: 334px')
    expect(panel.attributes('style')).toContain('left: 8px')
  })

  it('бургер закрывается по выбору пункта, Escape и клику мимо', async () => {
    const wrapper = await mountNav(350)
    const button = wrapper.get('[data-overflow-burger] button')
    const isOpen = () => button.attributes('aria-expanded') === 'true'

    await button.trigger('click')
    await wrapper.get('[data-overflow-burger] a').trigger('click')
    expect(isOpen()).toBe(false)

    await button.trigger('click')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(isOpen()).toBe(false)

    await button.trigger('click')
    document.body.click()
    await nextTick()
    expect(isOpen()).toBe(false)
  })

  it('бургер стоит у правого края', async () => {
    const wrapper = await mountNav(350)
    expect(wrapper.get('[data-overflow-burger]').classes()).toContain('ml-auto')
  })

  it('показывает блок пользователя под пунктами и закрывается по нажатию в нём', async () => {
    const wrapper = await mountNav(350, { slots: { 'burger-footer': '<button class="logout">Выйти</button>' } })
    const button = wrapper.get('[data-overflow-burger] button')
    expect(wrapper.find('.logout').exists()).toBe(false)

    await button.trigger('click')
    const panel = wrapper.get('[data-overflow-burger] > div')
    expect(panel.element.lastElementChild.querySelector('.logout')).not.toBeNull()
    await wrapper.get('.logout').trigger('click')
    expect(button.attributes('aria-expanded')).toBe('false')
  })

  it('без слота панель не показывает разделитель', async () => {
    const wrapper = await mountNav(350)
    await wrapper.get('[data-overflow-burger] button').trigger('click')
    expect(wrapper.find('[data-overflow-burger] .border-t').exists()).toBe(false)
  })

  it('Escape возвращает фокус на кнопку бургера', async () => {
    const wrapper = await mountNav(350, { attachTo: document.body })
    const button = wrapper.get('[data-overflow-burger] button')
    await button.trigger('click')
    wrapper.get('[data-overflow-burger] a').element.focus()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(document.activeElement).toBe(button.element)
    wrapper.unmount()
  })

  it('«Ещё» в правой половине экрана раскрывается влево', async () => {
    const wrapper = await mountNav(350)
    const more = wrapper.get('[data-overflow-more] button')
    vi.spyOn(more.element, 'getBoundingClientRect').mockReturnValue({ left: 300 })
    await more.trigger('click')
    expect(wrapper.get('[role="menu"]').classes()).toContain('right-0')
  })
})
