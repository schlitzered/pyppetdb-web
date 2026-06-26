import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { vi } from 'vitest'
import { factFieldProcessor } from '../nodes'
import { nodes } from '../nodes'
import { nodesGroups } from '../nodes'
import { nodesReports } from '../nodes'
import { nodesSecretsRedactor } from '../nodes'
import { nodesDistinctFactValues } from '../nodes'

describe(
  'nodes resources',
  () => {
    it(
      'factFieldProcessor logic',
      () => {
        const fromSingle = factFieldProcessor.fromUrl('cpu:eq:string:4')
        expect(
          fromSingle
        ).toEqual([
          {
            fact_name: 'cpu',
            operator: 'eq',
            type: 'string',
            value: '4'
          }
        ])

        const fromEmptyParts = factFieldProcessor.fromUrl(':::')
        expect(
          fromEmptyParts
        ).toEqual([
          {
            fact_name: '',
            operator: '',
            type: '',
            value: ''
          }
        ])

        const fromArray = factFieldProcessor.fromUrl([
          'cpu:eq:string:4',
          'ram:gt:int:8'
        ])
        expect(
          fromArray
        ).toEqual([
          {
            fact_name: 'cpu',
            operator: 'eq',
            type: 'string',
            value: '4'
          },
          {
            fact_name: 'ram',
            operator: 'gt',
            type: 'int',
            value: '8'
          }
        ])

        expect(
          factFieldProcessor.toUrl('not-array')
        ).toBeUndefined()

        const emptyArrayResult = factFieldProcessor.toUrl([])
        expect(
          emptyArrayResult
        ).toBeUndefined()

        const validToUrl = factFieldProcessor.toUrl([
          {
            fact_name: 'cpu',
            operator: 'eq',
            type: 'string',
            value: '4'
          },
          {
            fact_name: 'incomplete'
          }
        ])
        expect(
          validToUrl
        ).toEqual([
          'cpu:eq:string:4'
        ])
      }
    )

    it(
      'nodes logic',
      () => {
        const route = {
          params: {
            node: 'node1'
          }
        }
        expect(
          nodes.breadcrumbs.crud(route).length
        ).toBe(4)

        expect(
          nodes.toolbar.crud.title(route)
        ).toBe('Node node1')

        expect(
          nodes.toolbar.crud.items[0].to(route)
        ).toEqual({
          name: 'NodesReportsSearch',
          params: {
            node: 'node1'
          }
        })

        expect(
          nodes.toolbar.crud.items[1].to(route)
        ).toEqual({
          name: 'CASpacesCertsSearch',
          params: {
            space_id: 'puppet-ca'
          },
          query: {
            cn: 'node1'
          }
        })

        const hasPerm = vi.fn().mockReturnValue(true)
        expect(
          nodes.permissions.create(hasPerm)
        ).toBe(true)
        expect(
          nodes.permissions.edit(hasPerm)
        ).toBe(true)
        expect(
          nodes.permissions.delete(hasPerm)
        ).toBe(true)
      }
    )

    it(
      'nodesGroups logic',
      () => {
        const route = {
          params: {
            node_group: 'group1'
          }
        }
        expect(
          nodesGroups.breadcrumbs.crud(route).length
        ).toBe(4)

        expect(
          nodesGroups.toolbar.crud.title(route)
        ).toBe('Node Group group1')

        const hasPerm = vi.fn().mockReturnValue(true)
        expect(
          nodesGroups.permissions.create(hasPerm)
        ).toBe(true)
        expect(
          nodesGroups.permissions.edit(hasPerm)
        ).toBe(true)
        expect(
          nodesGroups.permissions.delete(hasPerm)
        ).toBe(true)
      }
    )

    it(
      'nodesReports logic',
      () => {
        const route = {
          params: {
            node: 'node1',
            report: 'report1'
          }
        }
        expect(
          nodesReports.apiBase(route)
        ).toBe('/api/v1/nodes/node1/reports')

        expect(
          nodesReports.breadcrumbs.search(route).length
        ).toBe(5)

        expect(
          nodesReports.breadcrumbs.crud(route).length
        ).toBe(6)

        expect(
          nodesReports.toolbar.crud.title(route)
        ).toBe('Report report1')

        const formatter = nodesReports.tableColumns[2].formatter
        expect(
          formatter(null)
        ).toBe('')
        expect(
          formatter('2026-06-26T12:00:00Z')
        ).toContain('2026')
      }
    )

    it(
      'nodesSecretsRedactor logic',
      () => {
        const route = {
          params: {
            secret_id: 'secret1'
          }
        }
        expect(
          nodesSecretsRedactor.breadcrumbs.crud(route).length
        ).toBe(4)

        expect(
          nodesSecretsRedactor.toolbar.crud.title(route)
        ).toBe('Secrets Redactor secret1')

        expect(
          nodesSecretsRedactor.searchFilters[1].processor.toUrl()
        ).toBeUndefined()

        expect(
          nodesSecretsRedactor.searchFilters[1].processor.fromUrl()
        ).toBe('')

        const hasPerm = vi.fn().mockReturnValue(true)
        expect(
          nodesSecretsRedactor.permissions.create(hasPerm)
        ).toBe(true)
        expect(
          nodesSecretsRedactor.permissions.edit()
        ).toBe(false)
        expect(
          nodesSecretsRedactor.permissions.delete(hasPerm)
        ).toBe(true)
      }
    )

    it(
      'nodesDistinctFactValues logic',
      () => {
        expect(
          nodesDistinctFactValues.breadcrumbs.crud().length
        ).toBe(0)
      }
    )
  }
)
