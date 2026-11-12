<script setup>
import { computed } from 'vue'
import UiButton from './UiButton.vue'
import UiDisclosure from './UiDisclosure.vue'
import UiDisclosureButton from './UiDisclosureButton.vue'
import UiDisclosurePanel from './UiDisclosurePanel.vue'

const props = defineProps({
  label: { type: String, required: true },
  columns: { type: Array, required: true },
  rows: { type: Array, required: true },
  rowKey: { type: String, default: 'id' },
})
const sort = defineModel('sort', { type: Object, default: () => ({ key: '', direction: 'ascending' }) })
const sortColumns = computed(() => props.columns.filter(column => column.sortable))

function changeSort(key) {
  sort.value = { key, direction: sort.value.key === key && sort.value.direction === 'ascending' ? 'descending' : 'ascending' }
}
</script>

<template>
  <div class="min-w-0 overflow-hidden rounded-card border border-line bg-surface">
    <div v-if="sortColumns.length" class="flex flex-wrap items-center gap-2 border-b border-line bg-canvas px-3 py-2 text-sm md:hidden">
      <span class="text-ink-muted">Сортировка</span>
      <UiButton
        v-for="column in sortColumns"
        :key="column.key"
        size="sm"
        :aria-pressed="sort.key === column.key"
        @click="changeSort(column.key)"
      >
        {{ column.label }}<span v-if="sort.key === column.key" :aria-label="sort.direction === 'ascending' ? 'по возрастанию' : 'по убыванию'">{{ sort.direction === 'ascending' ? '↑' : '↓' }}</span>
      </UiButton>
    </div>
    <table role="table" :aria-label="label" class="block w-full text-left text-sm md:table">
      <thead role="rowgroup" class="sr-only bg-canvas md:not-sr-only md:table-header-group">
        <tr role="row">
          <th
            v-for="column in columns"
            :key="column.key"
            scope="col"
            class="px-4 py-3 font-medium text-ink-muted"
            :aria-sort="sort.key === column.key ? sort.direction : undefined"
          >
            <button v-if="column.sortable" type="button" class="hidden rounded-control text-start hover:text-ink md:inline-block" @click="changeSort(column.key)">
              {{ column.label }}<span v-if="sort.key === column.key" aria-hidden="true" class="ms-1">{{ sort.direction === 'ascending' ? '↑' : '↓' }}</span>
            </button>
            <span :class="{ 'md:hidden': column.sortable }">{{ column.label }}</span>
          </th>
        </tr>
      </thead>
      <tbody role="rowgroup" class="block md:table-row-group">
        <UiDisclosure v-for="row in rows" :key="row[rowKey]" v-slot="{ open }">
          <tr role="row" class="grid min-w-0 grid-cols-2 gap-x-3 gap-y-2 border-t border-line p-3 first:border-t-0 md:table-row md:border-t md:p-0">
            <td
              v-for="column in columns"
              :key="column.key"
              role="cell"
              class="min-w-0 align-top wrap-anywhere md:table-cell md:px-4 md:py-3"
              :class="[{ 'col-span-full': column.fullWidth || column.primary, 'hidden': column.desktopOnly }]"
            >
              <span v-if="!column.primary && column.mobileLabel !== false" class="mb-0.5 block text-xs text-ink-muted md:hidden">{{ column.label }}</span>
              <slot :name="`cell-${column.key}`" :row="row">{{ row[column.key] }}</slot>
              <UiDisclosureButton v-if="column.primary && $slots.details" class="mt-1 -ms-2">Предпросмотр</UiDisclosureButton>
            </td>
          </tr>
          <tr v-if="$slots.details" role="row" class="block bg-canvas md:table-row" :aria-hidden="!open || undefined">
            <td role="cell" :colspan="columns.length" class="block p-0 md:table-cell">
              <UiDisclosurePanel>
                <div class="border-t border-line px-4 py-3">
                  <slot name="details" :row="row" />
                </div>
              </UiDisclosurePanel>
            </td>
          </tr>
        </UiDisclosure>
      </tbody>
    </table>
  </div>
</template>
