<script setup>
import UiButton from './UiButton.vue'

defineProps({
  saveLabel: { type: String, default: 'Сохранить' },
  message: { type: String, default: 'Есть несохранённые изменения' },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})
defineEmits(['cancel'])
</script>

<template>
  <div class="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-control border border-line bg-surface px-3 py-2.5 shadow-sm">
    <span v-if="message" role="status" class="min-w-0 text-sm font-medium text-ink-muted">{{ message }}</span>
    <div class="ms-auto flex flex-wrap gap-2">
      <UiButton size="sm" :disabled="loading" @click="$emit('cancel')">Отменить</UiButton>
      <UiButton size="sm" variant="primary" type="submit" :loading="loading" :disabled="disabled">{{ saveLabel }}</UiButton>
    </div>
  </div>
</template>
