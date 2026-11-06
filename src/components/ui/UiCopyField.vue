<script setup>
/** Адрес только для чтения с кнопкой копирования. */
import { onBeforeUnmount, ref } from 'vue'
import UiButton from './UiButton.vue'

const props = defineProps({
  value: { type: String, required: true },
  label: { type: String, default: 'Адрес' },
})
const field = ref(null)
const copied = ref(false)
let timer

async function copy() {
  if (!navigator.clipboard) {
    // Без Clipboard API (http без TLS) выделяем текст, чтобы скопировать вручную
    field.value?.select()
    return
  }
  await navigator.clipboard.writeText(props.value)
  copied.value = true
  clearTimeout(timer)
  timer = setTimeout(() => (copied.value = false), 2000)
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div class="flex items-center gap-2">
    <input ref="field" :value="value" readonly :aria-label="label" class="h-10 min-w-0 flex-1 rounded-control border border-line bg-canvas px-3 text-sm" @focus="$event.target.select()" />
    <UiButton size="sm" @click="copy">{{ copied ? 'Скопировано' : 'Скопировать' }}</UiButton>
  </div>
</template>
