<script setup>
/** Адрес только для чтения с кнопкой копирования. */
import { nextTick, onBeforeUnmount, ref } from 'vue'
import UiButton from './UiButton.vue'

const props = defineProps({
  value: { type: String, required: true },
  label: { type: String, default: 'Адрес' },
  variant: { type: String, default: 'field', validator: (value) => ['field', 'link'].includes(value) },
})
const field = ref(null)
const copied = ref(false)
const manual = ref(false)
let timer

async function copy() {
  try {
    await navigator.clipboard.writeText(props.value)
    manual.value = false
    copied.value = true
    clearTimeout(timer)
    timer = setTimeout(() => (copied.value = false), 2000)
  } catch {
    // Без доступа к буферу выделяем адрес для ручного копирования.
    manual.value = true
    await nextTick()
    field.value?.focus()
    field.value?.select()
  }
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div v-if="variant === 'link'" class="min-w-0">
    <div class="flex items-center gap-1">
      <a
        :href="value"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex min-h-9 min-w-0 max-w-full items-center gap-1.5 rounded-control px-2 text-sm font-medium text-brand-700 no-underline hover:bg-brand-50"
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="size-4 shrink-0">
          <path d="M11 3.5h5.5V9m0-5.5-8 8m0-7H4a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-4.5" />
        </svg>
        <span class="min-w-0 wrap-anywhere">{{ label }}</span>
      </a>
      <button
        type="button"
        aria-label="Скопировать ссылку"
        :title="copied ? 'Скопировано' : 'Скопировать ссылку'"
        class="grid size-9 shrink-0 place-items-center rounded-control border border-line text-ink-muted hover:bg-brand-50 hover:text-brand-700"
        @click="copy"
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="size-4">
          <path v-if="copied" d="m4 10 4 4 8-8" />
          <path v-else d="M7 13H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3M8 7h8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z" />
        </svg>
      </button>
      <span role="status" class="sr-only">{{ copied ? 'Ссылка скопирована' : '' }}</span>
    </div>
    <input v-if="manual" ref="field" :value="value" readonly :aria-label="label" class="mt-1 h-8 w-full rounded-control border border-line bg-canvas px-2 text-sm" @focus="$event.target.select()" />
  </div>
  <div v-else class="flex items-center gap-2">
    <input ref="field" :value="value" readonly :aria-label="label" class="h-10 min-w-0 flex-1 rounded-control border border-line bg-canvas px-3 text-sm" @focus="$event.target.select()" />
    <UiButton size="sm" @click="copy">{{ copied ? 'Скопировано' : 'Скопировать' }}</UiButton>
  </div>
</template>
