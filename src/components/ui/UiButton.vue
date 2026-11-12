<script setup>
const variants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700',
  secondary: 'bg-surface text-ink border border-line hover:bg-brand-50',
  ghost: 'text-ink hover:bg-brand-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  'danger-outline': 'border border-red-300 bg-red-50 text-red-800 enabled:hover:border-red-400 enabled:hover:bg-red-100',
}
const sizes = { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4' }

const props = defineProps({
  variant: { type: String, default: 'secondary', validator: (value) => ['primary', 'secondary', 'ghost', 'danger', 'danger-outline'].includes(value) },
  size: { type: String, default: 'md', validator: (value) => ['sm', 'md'].includes(value) },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  /** Пока идёт запрос: индикатор, кнопка недоступна, повторный клик невозможен */
  loading: { type: Boolean, default: false },
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
    class="inline-flex items-center justify-center gap-2 rounded-control font-medium transition-colors disabled:opacity-60"
    :class="[variants[props.variant], sizes[props.size]]"
  >
    <span v-if="loading" class="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />
    <slot />
  </button>
</template>
