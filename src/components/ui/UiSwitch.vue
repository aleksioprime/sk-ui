<script setup>
import { useId } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  hint: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})
const model = defineModel({ type: Boolean, default: false })
const id = useId()

function toggle() {
  if (!props.disabled && !props.loading) model.value = !model.value
}
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="model"
    :aria-labelledby="`${id}-label`"
    :aria-describedby="hint ? `${id}-hint` : undefined"
    :aria-busy="loading || undefined"
    :aria-disabled="loading || undefined"
    :disabled="disabled"
    class="group inline-flex min-h-11 max-w-full items-center gap-3 rounded-control text-start disabled:opacity-60"
    @click="toggle"
  >
    <span
      aria-hidden="true"
      class="relative flex h-7 w-12 shrink-0 items-center rounded-full border px-0.5 motion-safe:transition-colors"
      :class="model ? 'border-brand-600 bg-brand-600 group-hover:border-brand-700 group-hover:bg-brand-700' : 'border-ink-muted/60 bg-line group-hover:border-ink-muted'"
    >
      <span
        class="grid size-5 shrink-0 place-items-center rounded-full bg-white shadow-sm motion-safe:transition-transform"
        :class="model ? 'ltr:translate-x-5 rtl:-translate-x-5' : ''"
      >
        <span v-if="loading" class="size-3 animate-spin rounded-full border-2 border-brand-600 border-r-transparent motion-reduce:animate-none" />
      </span>
    </span>
    <span class="grid min-w-0 gap-0.5">
      <span :id="`${id}-label`" class="text-sm font-medium text-ink">{{ label }}</span>
      <span v-if="hint" :id="`${id}-hint`" class="text-xs text-ink-muted">{{ hint }}</span>
    </span>
  </button>
</template>
