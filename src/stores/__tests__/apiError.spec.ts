import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { beforeEach } from 'vitest'
import { createPinia } from 'pinia'
import { setActivePinia } from 'pinia'
import { apiErrorStore } from '../apiError'

describe('apiErrorStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with default values', () => {
    const store = apiErrorStore()
    expect(store.dialogShow).toBe(false)
    expect(store.dialogError).toBeNull()
    expect(store.dialogHTTPStatus).toBeNull()
    expect(store.redirect).toEqual({ name: 'Home' })
  })

  it('set with axios error sets data and status', () => {
    const store = apiErrorStore()
    const error = {
      response: {
        data: 'Server Error',
        status: 500
      }
    }
    store.set(error)
    expect(store.dialogError).toBe('Server Error')
    expect(store.dialogHTTPStatus).toBe(500)
    expect(store.dialogShow).toBe(true)
  })

  it('set with non-axios error only shows dialog', () => {
    const store = apiErrorStore()
    const error = new Error('Client Error')
    store.set(error)
    expect(store.dialogError).toBeNull()
    expect(store.dialogHTTPStatus).toBeNull()
    expect(store.dialogShow).toBe(true)
  })

  it('clear resets state', () => {
    const store = apiErrorStore()
    const error = {
      response: {
        data: 'Server Error',
        status: 500
      }
    }
    store.set(error)
    store.setRedirect({ name: 'Login' })
    store.clear()
    expect(store.dialogShow).toBe(false)
    expect(store.dialogError).toBeNull()
    expect(store.dialogHTTPStatus).toBeNull()
    expect(store.redirect).toEqual({ name: 'Home' })
  })

  it('setRedirect updates redirect state', () => {
    const store = apiErrorStore()
    store.setRedirect({ name: 'Login' })
    expect(store.redirect).toEqual({ name: 'Login' })
  })

  it(
    'set with axios error but response is undefined',
    () => {
      const store = apiErrorStore()
      const error = {
        response: undefined
      }
      store.set(error)
      expect(
        store.dialogError
      ).toBeNull()
      expect(
        store.dialogHTTPStatus
      ).toBeNull()
      expect(
        store.dialogShow
      ).toBe(true)
    }
  )
})
