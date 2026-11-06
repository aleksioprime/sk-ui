<script setup>
/**
 * Меню без прокрутки: пункты, которые не помещаются по ширине, уходят в выпадающее «Ещё».
 * Ширины пунктов измеряются в скрытом ряду, раскладка пересчитывается при изменении размера.
 * На узких экранах (меньше брейкпоинта sm) вместо ряда пунктов показывается бургер со всеми пунктами.
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const props = defineProps({ links: { type: Array, required: true } })
const route = useRoute()

const nav = ref(null)
const measure = ref(null)
const moreButton = ref(null)
const burger = ref(null)
const visibleCount = ref(props.links.length)
const open = ref(false)
const moreAlignRight = ref(false)
const burgerOpen = ref(false)
const burgerPanelStyle = ref({})
const GAP = 4
const SCREEN_EDGE = 8

const visible = computed(() => props.links.slice(0, visibleCount.value))
const hidden = computed(() => props.links.slice(visibleCount.value))
const hiddenActive = computed(() => hidden.value.some((link) => route.matched.some((r) => r.name === link.to.name)))

function layout() {
  if (!nav.value || !measure.value) return
  const widths = [...measure.value.children].map((el) => el.offsetWidth)
  const available = nav.value.clientWidth
  const total = widths.reduce((sum, w) => sum + w + GAP, 0)
  if (total <= available) {
    visibleCount.value = widths.length
    return
  }
  const moreWidth = (moreButton.value?.offsetWidth || 72) + GAP
  let used = 0
  let count = 0
  for (const width of widths) {
    if (used + width + GAP + moreWidth > available) break
    used += width + GAP
    count += 1
  }
  visibleCount.value = count
}

function viewportWidth() {
  return document.documentElement.clientWidth
}

function toggleMore() {
  // Кнопка в правой половине экрана: список раскрывается влево, иначе вышел бы за край
  moreAlignRight.value = moreButton.value.getBoundingClientRect().left > viewportWidth() / 2
  open.value = !open.value
}

// Панель на всю ширину экрана. Не fixed: backdrop-blur шапки сделал бы её отсчёт от шапки, а не от экрана
function placeBurgerPanel() {
  burgerPanelStyle.value = {
    left: `${SCREEN_EDGE - burger.value.getBoundingClientRect().left}px`,
    width: `${viewportWidth() - SCREEN_EDGE * 2}px`,
  }
}

function toggleBurger() {
  if (!burgerOpen.value) placeBurgerPanel()
  burgerOpen.value = !burgerOpen.value
}

function onResize() {
  layout()
  if (burgerOpen.value) placeBurgerPanel()
}

function onDocumentClick(event) {
  if (open.value && !event.target.closest('[data-overflow-more]')) open.value = false
  if (burgerOpen.value && !event.target.closest('[data-overflow-burger]')) burgerOpen.value = false
}

function onKey(event) {
  if (event.key !== 'Escape') return
  open.value = false
  burgerOpen.value = false
}

let observer
onMounted(() => {
  observer = new ResizeObserver(onResize)
  observer.observe(nav.value)
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKey)
  nextTick(layout)
})
onBeforeUnmount(() => {
  observer?.disconnect()
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKey)
})
watch(() => props.links.map((l) => l.label).join(), () => nextTick(layout))
watch(() => route.fullPath, () => {
  open.value = false
  burgerOpen.value = false
})

const linkClass = 'whitespace-nowrap rounded-control px-3 py-1.5 text-ink-muted hover:bg-brand-50 hover:text-ink'
</script>

<template>
  <nav ref="nav" class="relative flex min-w-0 flex-1 items-center gap-1 text-sm" aria-label="Основное меню">
    <div ref="burger" class="relative sm:hidden" data-overflow-burger>
      <button
        type="button"
        class="flex size-9 items-center justify-center rounded-control text-ink-muted hover:bg-brand-50 hover:text-ink"
        :aria-label="burgerOpen ? 'Закрыть меню' : 'Открыть меню'"
        :aria-expanded="burgerOpen"
        @click="toggleBurger"
      >
        <svg class="size-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true">
          <path v-if="burgerOpen" d="M5 5l10 10M15 5L5 15" />
          <path v-else d="M3 5.5h14M3 10h14M3 14.5h14" />
        </svg>
      </button>
      <div
        v-if="burgerOpen"
        class="absolute top-full z-20 mt-1 grid max-h-[calc(100dvh-5rem)] gap-0.5 overflow-y-auto rounded-card border border-line bg-surface p-1 shadow-lg"
        :style="burgerPanelStyle"
      >
        <RouterLink
          v-for="link in links"
          :key="link.label"
          :to="link.to"
          class="rounded-control px-3 py-2.5 text-ink hover:bg-brand-50"
          active-class="bg-brand-100! text-brand-700!"
          @click="burgerOpen = false"
        >
          {{ link.label }}
        </RouterLink>
      </div>
    </div>

    <RouterLink v-for="link in visible" :key="link.label" :to="link.to" :class="[linkClass, 'hidden sm:block']" active-class="bg-brand-100! text-brand-700!">
      {{ link.label }}
    </RouterLink>

    <div v-if="hidden.length" class="relative hidden sm:block" data-overflow-more>
      <button
        ref="moreButton"
        type="button"
        :class="[linkClass, { 'bg-brand-100! text-brand-700!': hiddenActive }]"
        aria-haspopup="menu"
        :aria-expanded="open"
        @click="toggleMore"
      >
        Ещё ▾
      </button>
      <div v-if="open" role="menu" :class="moreAlignRight ? 'right-0' : 'left-0'" class="absolute top-full z-20 mt-1 grid min-w-48 gap-0.5 rounded-card border border-line bg-surface p-1 shadow-lg">
        <RouterLink
          v-for="link in hidden"
          :key="link.label"
          :to="link.to"
          role="menuitem"
          class="rounded-control px-3 py-2 text-ink hover:bg-brand-50"
          active-class="bg-brand-100! text-brand-700!"
        >
          {{ link.label }}
        </RouterLink>
      </div>
    </div>

    <!-- Скрытый ряд для измерения ширины пунктов. Нулевая ширина с обрезкой не даёт ему расширять страницу,
         а пункты не сжимаются из-за whitespace-nowrap, поэтому их ширина остаётся настоящей. -->
    <div ref="measure" class="pointer-events-none invisible absolute left-0 top-0 flex w-0 gap-1 overflow-hidden" aria-hidden="true">
      <span v-for="link in links" :key="link.label" :class="linkClass">{{ link.label }}</span>
    </div>
  </nav>
</template>
