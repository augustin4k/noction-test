import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { configDefaults } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  test: {
    globals: true, // You can use globals like `describe`, `it`, `expect`
    environment: 'jsdom', // This simulates a browser environment
    exclude: [...configDefaults.exclude, '**/node_modules/**'], // Exclude node_modules
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
