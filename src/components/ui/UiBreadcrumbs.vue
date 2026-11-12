<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  items: { type: Array, required: true },
  label: { type: String, default: 'Хлебные крошки' },
})
</script>

<template>
  <nav :aria-label="label" class="min-w-0">
    <ol class="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm text-ink-muted">
      <li v-for="(item, index) in items" :key="index" class="flex min-w-0 items-baseline gap-2">
        <span v-if="index" class="shrink-0" aria-hidden="true">›</span>
        <RouterLink
          v-if="item.to && index < items.length - 1"
          :to="item.to"
          class="rounded-sm wrap-anywhere hover:text-brand-700 hover:underline"
        >
          {{ item.label }}
        </RouterLink>
        <span v-else :aria-current="index === items.length - 1 ? 'page' : undefined" class="wrap-anywhere">
          {{ item.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>
