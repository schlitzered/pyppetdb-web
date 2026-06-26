import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { vi } from 'vitest'
import { caAuthorities } from '../ca'
import { caAuthoritiesCerts } from '../ca'
import { caSpaces } from '../ca'
import { caSpacesCerts } from '../ca'

vi.mock(
  '@/router',
  () => {
    return {
      default: {
        currentRoute: {
          value: {
            params: {
              ca_id: 'my-ca',
              space_id: 'my-space'
            }
          }
        }
      }
    }
  }
)

describe(
  'ca resources',
  () => {
    it(
      'caAuthorities logic',
      () => {
        const route = {
          params: {
            ca_id: 'ca1'
          }
        }
        expect(
          caAuthorities.breadcrumbs.crud(route).length
        ).toBe(4)

        expect(
          caAuthorities.toolbar.crud.title(route)
        ).toBe('CA Authority ca1')

        expect(
          caAuthorities.toolbar.crud.items[0].to(route)
        ).toEqual({
          name: 'CAAuthoritiesCertsSearch',
          params: {
            ca_id: 'ca1'
          }
        })

        const hasPerm = vi.fn().mockReturnValue(true)
        expect(
          caAuthorities.permissions.create(hasPerm)
        ).toBe(true)
        expect(
          caAuthorities.permissions.edit(hasPerm)
        ).toBe(true)
        expect(
          caAuthorities.permissions.delete(hasPerm)
        ).toBe(true)
      }
    )

    it(
      'caAuthoritiesCerts logic',
      () => {
        const route = {
          params: {
            ca_id: 'ca1',
            cert_id: 'cert1'
          }
        }
        expect(
          caAuthoritiesCerts.apiBase(route)
        ).toBe('/api/v1/ca/authorities/ca1/certs')

        expect(
          caAuthoritiesCerts.breadcrumbs.search(route).length
        ).toBe(5)

        expect(
          caAuthoritiesCerts.breadcrumbs.crud(route).length
        ).toBe(6)

        expect(
          caAuthoritiesCerts.toolbar.crud.title(route)
        ).toBe('Certificate cert1')

        const hasPerm = vi.fn().mockReturnValue(true)
        expect(
          caAuthoritiesCerts.permissions.create(hasPerm)
        ).toBe(true)
        expect(
          caAuthoritiesCerts.permissions.edit(hasPerm)
        ).toBe(true)
        expect(
          caAuthoritiesCerts.permissions.delete(hasPerm)
        ).toBe(true)
      }
    )

    it(
      'caSpaces logic',
      () => {
        const route = {
          params: {
            space_id: 'space1'
          }
        }
        expect(
          caSpaces.breadcrumbs.crud(route).length
        ).toBe(4)

        expect(
          caSpaces.toolbar.crud.title(route)
        ).toBe('CA Space space1')

        expect(
          caSpaces.toolbar.crud.items[0].to(route)
        ).toEqual({
          name: 'CASpacesCertsSearch',
          params: {
            space_id: 'space1'
          }
        })

        const hasPerm = vi.fn().mockReturnValue(true)
        expect(
          caSpaces.permissions.create(hasPerm)
        ).toBe(true)
        expect(
          caSpaces.permissions.edit(hasPerm)
        ).toBe(true)
        expect(
          caSpaces.permissions.delete(hasPerm)
        ).toBe(true)
      }
    )

    it(
      'caSpacesCerts logic',
      () => {
        const route = {
          params: {
            space_id: 'space1',
            cert_id: 'cert1'
          }
        }
        expect(
          caSpacesCerts.apiBase(route)
        ).toBe('/api/v1/ca/spaces/space1/certs')

        expect(
          caSpacesCerts.breadcrumbs.search(route).length
        ).toBe(5)

        expect(
          caSpacesCerts.breadcrumbs.crud(route).length
        ).toBe(6)

        expect(
          caSpacesCerts.toolbar.crud.title(route)
        ).toBe('Certificate cert1')

        const hasPerm = vi.fn().mockReturnValue(true)
        expect(
          caSpacesCerts.permissions.create(hasPerm)
        ).toBe(true)
        expect(
          caSpacesCerts.permissions.edit(hasPerm)
        ).toBe(true)
        expect(
          caSpacesCerts.permissions.delete(hasPerm)
        ).toBe(true)
      }
    )
  }
)
