import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { vi } from 'vitest'
import api from '@/api/client'
import { teams } from '../admin'
import { users } from '../admin'
import { usersCredentials } from '../admin'
import { pyppetdbNodes } from '../admin'

vi.mock(
  '@/api/client',
  () => {
    return {
      default: {
        get: vi.fn()
      }
    }
  }
)

describe(
  'admin resources',
  () => {
    it(
      'teams autocomplete endpoint filters permissions',
      async () => {
        api.get.mockResolvedValueOnce({
          static: ['PERM_A', 'PERM_B'],
          dynamic: ['PERM_C']
        })
        const res = await teams.fields[3].autocomplete.endpoint(
          {},
          'perm_a'
        )
        expect(
          res
        ).toEqual(['PERM_A'])
      }
    )

    it(
      'teams autocomplete endpoint handles error',
      async () => {
        api.get.mockRejectedValueOnce(
          new Error('API Error')
        )
        const res = await teams.fields[3].autocomplete.endpoint(
          {},
          ''
        )
        expect(
          res.length
        ).toBeGreaterThan(0)
      }
    )

    it(
      'teams autocomplete endpoint handles empty query',
      async () => {
        api.get.mockResolvedValueOnce({
          static: ['PERM_A'],
          dynamic: []
        })
        const res = await teams.fields[3].autocomplete.endpoint(
          {},
          ''
        )
        expect(
          res
        ).toContain('PERM_A')
      }
    )

    it(
      'teams permissions',
      () => {
        const hasPerm = vi.fn().mockReturnValue(true)
        expect(
          teams.permissions.create(hasPerm)
        ).toBe(true)
        expect(
          teams.permissions.edit(hasPerm)
        ).toBe(true)
        expect(
          teams.permissions.delete(hasPerm)
        ).toBe(true)
      }
    )

    it(
      'users hide credential action logic',
      () => {
        const hasPerm = vi.fn().mockReturnValue(true)
        const res1 = users.toolbar.crud.items[0].hide(
          {
            params: {
              user: '_new'
            }
          },
          hasPerm
        )
        expect(
          res1
        ).toBe(true)

        const res2 = users.toolbar.crud.items[0].hide(
          {
            params: {
              user: 'some_user'
            }
          },
          hasPerm
        )
        expect(
          res2
        ).toBe(false)

        const hasNoPerm = vi.fn().mockReturnValue(false)
        const res3 = users.toolbar.crud.items[0].hide(
          {
            params: {
              user: 'some_user'
            }
          },
          hasNoPerm
        )
        expect(
          res3
        ).toBe(true)
      }
    )

    it(
      'usersCredentials apiBase and breadcrumbs',
      () => {
        const route = {
          params: {
            user: 'john',
            credential: '123'
          }
        }
        expect(
          usersCredentials.apiBase(route)
        ).toBe('/api/v1/users/john/credentials')

        expect(
          usersCredentials.breadcrumbs.search(route).length
        ).toBe(5)

        expect(
          usersCredentials.breadcrumbs.crud(route).length
        ).toBe(6)

        expect(
          usersCredentials.toolbar.crud.title(route)
        ).toBe('Credential 123')

        const formatter = usersCredentials.tableColumns[2].formatter
        expect(
          formatter(null)
        ).toBe('')
        expect(
          formatter('2026-06-26T12:00:00Z')
        ).toContain('2026')

        const hasPerm = vi.fn().mockReturnValue(true)
        expect(
          usersCredentials.permissions.create(hasPerm)
        ).toBe(true)
        expect(
          usersCredentials.permissions.edit(hasPerm)
        ).toBe(true)
        expect(
          usersCredentials.permissions.delete(hasPerm)
        ).toBe(true)
      }
    )

    it(
      'pyppetdbNodes formatter and permissions',
      () => {
        const route = {
          params: {
            node_id: 'node1'
          }
        }
        expect(
          pyppetdbNodes.breadcrumbs.crud(route).length
        ).toBe(4)

        expect(
          pyppetdbNodes.toolbar.crud.title(route)
        ).toBe('PyppetDB Node node1')

        const formatter1 = pyppetdbNodes.tableColumns[1].formatter
        const formatter2 = pyppetdbNodes.tableColumns[2].formatter
        expect(
          formatter1(null)
        ).toBe('')
        expect(
          formatter1('2026-06-26T12:00:00Z')
        ).toContain('2026')
        expect(
          formatter2(null)
        ).toBe('')
        expect(
          formatter2('2026-06-26T12:00:00Z')
        ).toContain('2026')

        expect(
          pyppetdbNodes.permissions.create()
        ).toBe(false)
        expect(
          pyppetdbNodes.permissions.edit()
        ).toBe(false)
        expect(
          pyppetdbNodes.permissions.delete(
            () => true
          )
        ).toBe(true)
      }
    )

    it(
      'teams and users helper functions',
      () => {
        const route = {
          params: {
            team: 'team1',
            user: 'user1'
          }
        }
        expect(
          teams.breadcrumbs.crud(route).length
        ).toBe(4)
        expect(
          teams.toolbar.crud.title(route)
        ).toBe('Team team1')

        expect(
          users.breadcrumbs.crud(route).length
        ).toBe(4)
        expect(
          users.toolbar.crud.title(route)
        ).toBe('User user1')

        const hasPerm = vi.fn().mockReturnValue(true)
        expect(
          users.permissions.create(hasPerm)
        ).toBe(true)
        expect(
          users.permissions.edit(hasPerm)
        ).toBe(true)
        expect(
          users.permissions.delete(hasPerm)
        ).toBe(true)
      }
    )
  }
)
