import type { App } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import router from '@/router'
import { setupPrimeVue } from '@/plugins/primevue'

export function registerPlugins(app: App): void {
  const pinia = createPinia()
  app.use(pinia)
  app.use(VueQueryPlugin)
  setupPrimeVue(app)
  app.use(router)
}
