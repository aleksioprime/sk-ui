import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// Конфигурация только для vitest: пакет не собирается, сервисы берут исходники.
export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
  },
})
