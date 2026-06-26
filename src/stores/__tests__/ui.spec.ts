import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { beforeEach } from 'vitest'
import { createPinia } from 'pinia'
import { setActivePinia } from 'pinia'
import { uiStore } from '../ui'

describe('uiStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('initializes with default values', () => {
    const store = uiStore()
    expect(store.drawerOpen).toBe(true)
  })

  it('toggleTheme switches theme and saves to localStorage', () => {
    const store = uiStore()
    const initialTheme = store.theme
    const expectedTheme = initialTheme === 'light' ? 'dark' : 'light'

    store.toggleTheme()

    expect(store.theme).toBe(expectedTheme)
    expect(localStorage.getItem('theme')).toBe(expectedTheme)
  })

  it('toggleDrawer flips drawerOpen boolean', () => {
    const store = uiStore()
    expect(store.drawerOpen).toBe(true)

    store.toggleDrawer()

    expect(store.drawerOpen).toBe(false)
  })
})
