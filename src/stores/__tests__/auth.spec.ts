import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { vi } from 'vitest'
import { beforeEach } from 'vitest'
import { createPinia } from 'pinia'
import { setActivePinia } from 'pinia'
import { authStore } from '../auth'
import api from '@/api/client'

vi.mock('@/api/client', () => {
  return {
    default: {
      get: vi.fn()
    }
  }
})

describe('authStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('initializes with default values', () => {
    const store = authStore()
    expect(store.userData).toBeNull()
    expect(store.isLoaded).toBe(false)
    expect(store.timestamp).toBe(0)
  })

  it('setUserData sets userData and isLoaded', () => {
    const store = authStore()
    const data = {
      id: 'user1',
      admin: false,
      permissions: []
    }
    store.setUserData(data)
    expect(store.userData).toEqual(data)
    expect(store.isLoaded).toBe(true)
  })

  it('getUserDataId returns id when user is set', () => {
    const store = authStore()
    store.setUserData({
      id: 'user1',
      admin: false,
      permissions: []
    })
    expect(store.getUserDataId).toBe('user1')
  })

  it('getUserDataId returns empty string when user is not set', () => {
    const store = authStore()
    expect(store.getUserDataId).toBe('')
  })

  it('getUserDataIsAdmin returns true for admin', () => {
    const store = authStore()
    store.setUserData({
      id: 'user1',
      admin: true,
      permissions: []
    })
    expect(store.getUserDataIsAdmin).toBe(true)
  })

  it('hasPermission returns true if admin', () => {
    const store = authStore()
    store.setUserData({
      id: 'user1',
      admin: true,
      permissions: []
    })
    expect(store.hasPermission('perm1')).toBe(true)
  })

  it('hasPermission returns true if permission is in list', () => {
    const store = authStore()
    store.setUserData({
      id: 'user1',
      admin: false,
      permissions: ['perm1']
    })
    expect(store.hasPermission('perm1')).toBe(true)
  })

  it('hasPermission returns false if permission is not in list', () => {
    const store = authStore()
    store.setUserData({
      id: 'user1',
      admin: false,
      permissions: ['perm1']
    })
    expect(store.hasPermission('perm2')).toBe(false)
  })

  it('hasPermissionPattern returns true if admin', () => {
    const store = authStore()
    store.setUserData({
      id: 'user1',
      admin: true,
      permissions: []
    })
    expect(store.hasPermissionPattern('perm.*')).toBe(true)
  })

  it('hasPermissionPattern returns true if regex matches', () => {
    const store = authStore()
    store.setUserData({
      id: 'user1',
      admin: false,
      permissions: ['perm1']
    })
    expect(store.hasPermissionPattern('perm.*')).toBe(true)
  })

  it('getPermissionMatches returns capture groups', () => {
    const store = authStore()
    store.setUserData({
      id: 'user1',
      admin: false,
      permissions: ['node:read:env1', 'node:read:env2']
    })
    expect(store.getPermissionMatches('node:read:(.*)')).toEqual([
      'env1',
      'env2'
    ])
  })

  it('isTimestampOlderThan returns correct boolean', () => {
    const store = authStore()
    store.setTimestamp()
    expect(store.isTimestampOlderThan(60)).toBe(false)
  })

  it('reset clears all state', () => {
    const store = authStore()
    store.setUserData({
      id: 'user1',
      admin: false,
      permissions: []
    })
    store.setTimestamp()
    store.reset()
    expect(store.userData).toBeNull()
    expect(store.isLoaded).toBe(false)
    expect(store.timestamp).toBe(0)
  })

  it('fetchUserData API integration', async () => {
    const store = authStore()
    const mockData = {
      id: 'user1',
      admin: false,
      permissions: []
    }
    vi.mocked(api.get).mockResolvedValueOnce(mockData)
    const result = await store.fetchUserData()
    expect(result).toEqual(mockData)
    expect(store.userData).toEqual(mockData)
    expect(store.isLoaded).toBe(true)
  })

  it(
    'fetchUserData handles API error',
    async () => {
      const store = authStore()
      vi.mocked(api.get).mockRejectedValueOnce(
        new Error('API error')
      )
      await expect(
        store.fetchUserData()
      ).rejects.toThrow('API error')
      expect(
        store.isLoaded
      ).toBe(false)
    }
  )
})
