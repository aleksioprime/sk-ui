<script setup>
import { inject } from 'vue'
import { disclosureKey } from './disclosureContext.js'

const { open, panelId } = inject(disclosureKey)
</script>

<template>
  <button
    type="button"
    class="inline-flex min-h-8 max-w-full items-center gap-1.5 rounded-control px-2 text-start text-sm font-medium text-brand-700 no-underline hover:bg-brand-50 hover:text-brand-800"
    :aria-expanded="open"
    :aria-controls="panelId"
    @click="open = !open"
  >
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="size-4 shrink-0 motion-safe:transition-transform motion-safe:duration-200"
      :class="open ? 'rotate-90' : 'rtl:rotate-180'"
    >
      <path d="m6 3.5 4.5 4.5L6 12.5" />
    </svg>
    <span class="min-w-0"><slot /></span>
  </button>
</template>
