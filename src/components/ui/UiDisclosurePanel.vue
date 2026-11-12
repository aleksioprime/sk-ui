<script setup>
import { inject } from 'vue'
import { disclosureKey } from './disclosureContext.js'

const { open, panelId } = inject(disclosureKey)
</script>

<template>
  <div :id="panelId" class="disclosure" :class="{ 'is-open': open }" :inert="!open" :aria-hidden="!open || undefined">
    <div class="disclosure-body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.disclosure {
  display: grid;
  grid-template-rows: 0fr;
}

.disclosure.is-open {
  grid-template-rows: 1fr;
}

.disclosure-body {
  min-height: 0;
  overflow: hidden;
}

@media (prefers-reduced-motion: no-preference) {
  .disclosure {
    transition: grid-template-rows 220ms ease-in-out;
  }
}
</style>
