<script setup>
import { provide, useId } from 'vue'
import { disclosureKey } from './disclosureContext.js'

const open = defineModel('open', { type: Boolean, default: false })
provide(disclosureKey, { open, panelId: `${useId()}-disclosure` })
</script>

<template>
  <slot :open="open" />
</template>
