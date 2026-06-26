import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { vi } from 'vitest'
import { hieraKeys } from '../hiera'
import { hieraLevels } from '../hiera'
import { hieraLevelData } from '../hiera'
import { hieraKeyModelsStatic } from '../hiera'
import { hieraKeyModelsDynamic } from '../hiera'
import { hieraLookup } from '../hiera'

describe(
  'hiera resources',
  () => {
    it(
      'hieraKeys static and dynamic models endpoint',
      () => {
        const urlStatic = hieraKeys.fields[2].autocomplete.endpoint({
          model_type: 'static'
        })
        expect(
          urlStatic
        ).toBe('/api/v1/hiera/key_models/static')

        const urlDynamic = hieraKeys.fields[2].autocomplete.endpoint({
          model_type: 'dynamic'
        })
        expect(
          urlDynamic
        ).toBe('/api/v1/hiera/key_models/dynamic')

        const urlDefault = hieraKeys.fields[2].autocomplete.endpoint({})
        expect(
          urlDefault
        ).toBe('/api/v1/hiera/key_models/static')

        const route = {
          params: {
            key_id: 'key1'
          }
        }
        expect(
          hieraKeys.breadcrumbs.crud(route).length
        ).toBe(4)

        expect(
          hieraKeys.toolbar.crud.title(route)
        ).toBe('Hiera Key key1')

        const hasPerm = vi.fn().mockReturnValue(true)
        expect(
          hieraKeys.permissions.create(hasPerm)
        ).toBe(true)
        expect(
          hieraKeys.permissions.edit(hasPerm)
        ).toBe(true)
        expect(
          hieraKeys.permissions.delete(hasPerm)
        ).toBe(true)
      }
    )

    it(
      'hieraLevels permissions',
      () => {
        const hasPerm = vi.fn().mockReturnValue(true)
        expect(
          hieraLevels.permissions.create(hasPerm)
        ).toBe(true)
        expect(
          hieraLevels.permissions.edit(hasPerm)
        ).toBe(true)
        expect(
          hieraLevels.permissions.delete(hasPerm)
        ).toBe(true)

        const route = {
          params: {
            level_id: 'level1'
          }
        }
        expect(
          hieraLevels.breadcrumbs.crud(route).length
        ).toBe(4)
        expect(
          hieraLevels.toolbar.crud.title(route)
        ).toBe('Hiera Level level1')
      }
    )

    it(
      'hieraLevelData logic',
      () => {
        const route = {
          params: {
            level_id: 'level1',
            data_id: 'data1',
            key_id: 'key1'
          }
        }
        expect(
          hieraLevelData.breadcrumbs.crud(route).length
        ).toBe(4)

        expect(
          hieraLevelData.toolbar.crud.title(route)
        ).toBe('Level Data level1/data1/key1')

        const hasPerm = vi.fn().mockReturnValue(true)
        expect(
          hieraLevelData.permissions.create(hasPerm)
        ).toBe(true)
        expect(
          hieraLevelData.permissions.edit(hasPerm)
        ).toBe(true)
        expect(
          hieraLevelData.permissions.delete(hasPerm)
        ).toBe(true)
      }
    )

    it(
      'hieraKeyModelsStatic logic',
      () => {
        const route = {
          params: {
            key_model_id: 'static1'
          }
        }
        expect(
          hieraKeyModelsStatic.breadcrumbs.crud(route).length
        ).toBe(4)

        expect(
          hieraKeyModelsStatic.toolbar.crud.title(route)
        ).toBe('Key Model static1')

        const hasPerm = vi.fn().mockReturnValue(true)
        expect(
          hieraKeyModelsStatic.permissions.create(hasPerm)
        ).toBe(true)
        expect(
          hieraKeyModelsStatic.permissions.edit(hasPerm)
        ).toBe(true)
        expect(
          hieraKeyModelsStatic.permissions.delete(hasPerm)
        ).toBe(true)
      }
    )

    it(
      'hieraKeyModelsDynamic logic',
      () => {
        const route = {
          params: {
            key_model_id: 'dynamic1'
          }
        }
        expect(
          hieraKeyModelsDynamic.breadcrumbs.crud(route).length
        ).toBe(4)

        expect(
          hieraKeyModelsDynamic.toolbar.crud.title(route)
        ).toBe('Key Model dynamic1')

        const hasPerm = vi.fn().mockReturnValue(true)
        expect(
          hieraKeyModelsDynamic.permissions.create(hasPerm)
        ).toBe(true)
        expect(
          hieraKeyModelsDynamic.permissions.edit()
        ).toBe(false)
        expect(
          hieraKeyModelsDynamic.permissions.delete(hasPerm)
        ).toBe(true)
      }
    )

    it(
      'hieraLookup logic',
      () => {
        expect(
          hieraLookup.breadcrumbs.crud().length
        ).toBe(0)
      }
    )
  }
)
