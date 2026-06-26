import { ref } from 'vue'
import { defineStore } from 'pinia'

export const uiStore = defineStore('ui', () => {
  const storedTheme = localStorage.getItem('theme')
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const defaultTheme = storedTheme ?? (systemDark ? 'dark' : 'light')

  const theme = ref<'light' | 'dark'>(defaultTheme as 'light' | 'dark')
  const drawerOpen = ref(true)

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    localStorage.setItem('theme', theme.value)
  }

  function toggleDrawer() {
    drawerOpen.value = !drawerOpen.value
  }

  // ponytail: removed unused drawerRail and toggleRail to keep the store minimal

  return {
    theme,
    drawerOpen,
    toggleTheme,
    toggleDrawer
  }
})
