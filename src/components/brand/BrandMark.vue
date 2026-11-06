<script setup>
/** Логотип и название сервиса с подписью гимназии. Логотип сервиса задаёт бренд, логотип гимназии - в футере. */
import { useBrand } from '../../brand.js'

defineProps({
  size: { type: String, default: 'md' }, // md - шапка, lg - страница входа
})

const { SERVICE_NAME, SERVICE_LOGO, SCHOOL } = useBrand()
</script>

<template>
  <span class="flex items-center gap-2.5">
    <img :src="SERVICE_LOGO" alt="" :class="size === 'lg' ? 'size-11' : 'size-8'" />
    <span class="grid leading-tight">
      <span class="font-bold" :class="size === 'lg' ? 'text-xl' : 'text-base'">{{ SERVICE_NAME }}</span>
      <span class="text-xs text-ink-muted">{{ SCHOOL.name }}</span>
    </span>
  </span>
</template>
