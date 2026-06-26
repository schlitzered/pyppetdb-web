import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss()
  ],
  define: { 'process.env': {} },
  resolve: {
    alias: [
      {
        find: '@',
        replacement: fileURLToPath(new URL('./src', import.meta.url)),
      },
    ],
    extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: ['tests/e2e/**', 'node_modules/**'],
    setupFiles: ['./src/vitest.setup.ts'],
  },
  server: {
    port: 3000,
    proxy: {
      '/api/': {
        target: 'https://127.0.0.1:8000',
        changeOrigin: true,
        autoRewrite: true,
        secure: false,
        ws: true,
      },
      '/docs': {
        target: 'https://127.0.0.1:8000',
        changeOrigin: true,
        autoRewrite: true,
        secure: false,
        ws: true,
      },
      '/oauth': {
        target: 'https://127.0.0.1:8000',
        changeOrigin: true,
        autoRewrite: true,
        secure: false,
        ws: true,
      },
      '/openapi.json': {
        target: 'https://127.0.0.1:8000',
        changeOrigin: true,
        autoRewrite: true,
        secure: false,
        ws: true,
      },
      '/versions': {
        target: 'https://127.0.0.1:8000',
        changeOrigin: true,
        autoRewrite: true,
        secure: false,
        ws: true,
      },
    },
  },
})
