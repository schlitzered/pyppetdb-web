import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { syncPaginationToUrl } from '../useUrlStateSync'
import { syncSortToUrl } from '../useUrlStateSync'
import { syncSearchByToUrl } from '../useUrlStateSync'
import { syncExpPanelToUrl } from '../useUrlStateSync'
import { syncSimpleStringToUrl } from '../useUrlStateSync'
import type { SortByItem } from '../useUrlStateSync'
import type { SearchByItem } from '../useUrlStateSync'

describe('syncPaginationToUrl', () => {
  it('adds page>1 and perPage!==10 to query', () => {
    const query: Record<string, unknown> = {}
    syncPaginationToUrl(query, 2, 20)
    expect(query).toEqual({ page: 2, limit: 20 })
  })

  it('excludes page=1 and perPage=10 from query', () => {
    const query: Record<string, unknown> = {}
    syncPaginationToUrl(query, 1, 10)
    expect(query).toEqual({})
  })

  it('uses suffix when provided', () => {
    const query: Record<string, unknown> = {}
    syncPaginationToUrl(query, 3, 50, 'test')
    expect(query).toEqual({ page_test: 3, limit_test: 50 })
  })
})

describe('syncSortToUrl', () => {
  it('adds asc sort to query', () => {
    const query: Record<string, unknown> = {}
    const sortBy: SortByItem[] = [{ key: 'name', order: 'asc' }]
    syncSortToUrl(query, sortBy, [])
    expect(query).toEqual({ sort: 'name', sort_order: 'ascending' })
  })

  it('adds desc sort to query', () => {
    const query: Record<string, unknown> = {}
    const sortBy: SortByItem[] = [{ key: 'name', order: 'desc' }]
    syncSortToUrl(query, sortBy, [])
    expect(query).toEqual({ sort: 'name', sort_order: 'descending' })
  })

  it('adds sort with suffix to query', () => {
    const query: Record<string, unknown> = {}
    const sortBy: SortByItem[] = [{ key: 'name', order: 'asc' }]
    syncSortToUrl(query, sortBy, [], 'test')
    expect(query).toEqual({ sort_test: 'name', sort_order_test: 'ascending' })
  })

  it('clears tableSortBy if sortBy is empty', () => {
    const query: Record<string, unknown> = {}
    const tableSortBy: SortByItem[] = [{ key: 'name', order: 'asc' }]
    syncSortToUrl(query, [], tableSortBy)
    expect(query).toEqual({})
    expect(tableSortBy).toEqual([])
  })
})

describe('syncSearchByToUrl', () => {
  it('adds searchBy items to query', () => {
    const query: Record<string, unknown> = {}
    const searchBy: SearchByItem[] = [
      { key: 'q', value: 'hello' },
      { key: 'status', value: 'active' }
    ]
    syncSearchByToUrl(query, searchBy)
    expect(query).toEqual({ q: 'hello', status: 'active' })
  })

  it('does nothing if searchBy is empty', () => {
    const query: Record<string, unknown> = {}
    syncSearchByToUrl(query, [])
    expect(query).toEqual({})
  })
})

describe('syncExpPanelToUrl', () => {
  it('adds comma separated string for array panel', () => {
    const query: Record<string, unknown> = {}
    syncExpPanelToUrl(query, 'main', ['panel1', 'panel2'])
    expect(query).toEqual({ exp_pan_main: 'panel1,panel2' })
  })

  it('adds string for string panel', () => {
    const query: Record<string, unknown> = {}
    syncExpPanelToUrl(query, 'main', 'panel1')
    expect(query).toEqual({ exp_pan_main: 'panel1' })
  })

  it('deletes from query if panel is null/undefined/empty array', () => {
    const query: Record<string, unknown> = { exp_pan_main: 'panel1' }
    syncExpPanelToUrl(query, 'main', null)
    expect(query).toEqual({})

    query['exp_pan_main'] = 'panel1'
    syncExpPanelToUrl(query, 'main', [])
    expect(query).toEqual({})

    query['exp_pan_main'] = 'panel1'
    syncExpPanelToUrl(query, 'main', '')
    expect(query).toEqual({})
  })
})

describe('syncSimpleStringToUrl', () => {
  it('adds key/value to query if value exists', () => {
    const query: Record<string, unknown> = {}
    syncSimpleStringToUrl(query, 'test', 'value')
    expect(query).toEqual({ test: 'value' })
  })

  it('does not add to query if value is empty', () => {
    const query: Record<string, unknown> = {}
    syncSimpleStringToUrl(query, 'test', '')
    expect(query).toEqual({})
  })
})
