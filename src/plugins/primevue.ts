import type { App } from 'vue'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

const CustomAura = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{zinc.50}',
      100: '{zinc.100}',
      200: '{zinc.200}',
      300: '{zinc.300}',
      400: '{zinc.400}',
      500: '{zinc.500}',
      600: '{zinc.600}',
      700: '{zinc.700}',
      800: '{zinc.800}',
      900: '{zinc.900}',
      950: '{zinc.950}'
    }
  }
})

export function setupPrimeVue(app: App): void {
  app.use(PrimeVue, {
    theme: {
      preset: CustomAura,
      options: {
        darkModeSelector: '.dark',
        cssLayer: false
      }
    }
  })
  app.use(ToastService)
  app.use(ConfirmationService)
}
