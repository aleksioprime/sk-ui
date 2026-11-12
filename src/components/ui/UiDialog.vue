<script setup>
import { onBeforeUnmount, ref, useId, watchPostEffect } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  busy: { type: Boolean, default: false },
})
const open = defineModel('open', { type: Boolean, default: false })
const titleId = useId()
const dialog = ref(null)

function cancel() {
  if (!props.busy) open.value = false
}

function close() {
  if (dialog.value?.open) dialog.value.close()
}

watchPostEffect(() => {
  if (!open.value) close()
  else if (dialog.value && !dialog.value.open) dialog.value.showModal()
})
onBeforeUnmount(close)
</script>

<template>
  <Teleport to="body">
    <dialog
      ref="dialog"
      data-ui-dialog
      :aria-labelledby="titleId"
      :aria-busy="busy || undefined"
      class="m-auto max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-lg overflow-y-auto overscroll-contain rounded-card border border-line bg-surface p-0 text-ink shadow-xl backdrop:bg-ink/40 sm:max-h-[calc(100dvh-3rem)]"
      @cancel.prevent="cancel"
      @close="!dialog?.open && (open = false)"
    >
      <div v-if="open" class="grid gap-4 p-4 sm:p-6">
        <h2 :id="titleId" class="text-lg font-semibold">{{ title }}</h2>
        <slot />
      </div>
    </dialog>
  </Teleport>
</template>

<style scoped>
:global(html:has(dialog[data-ui-dialog]:modal)) {
  overflow: hidden;
}
</style>
