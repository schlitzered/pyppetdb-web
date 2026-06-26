export interface SortByItem {
  key: string
  order: 'asc' | 'desc'
}

export interface SearchByItem {
  key: string
  value: unknown
}

export function syncPaginationToUrl(
  query: Record<string, unknown>,
  page: number,
  perPage: number,
  suffix: string = ''
): void {
  if (page !== 1) {
    if (suffix) {
      query['page_' + suffix] = page
    } else {
      query.page = page
    }
  }
  if (perPage !== 10) {
    if (suffix) {
      query['limit_' + suffix] = perPage
    } else {
      query.limit = perPage
    }
  }
}

export function syncSortToUrl(
  query: Record<string, unknown>,
  sortBy: SortByItem[],
  tableSortBy: SortByItem[],
  suffix: string = ''
): void {
  if (sortBy.length) {
    if (suffix) {
      query['sort_' + suffix] = sortBy[0].key
    } else {
      query.sort = sortBy[0].key
    }
    if (sortBy[0].order === 'asc') {
      if (suffix) {
        query['sort_order_' + suffix] = 'ascending'
      } else {
        query.sort_order = 'ascending'
      }
    } else {
      if (suffix) {
        query['sort_order_' + suffix] = 'descending'
      } else {
        query.sort_order = 'descending'
      }
    }
  } else {
    tableSortBy.length = 0
  }
}

export function syncSearchByToUrl(
  query: Record<string, unknown>,
  searchBy: SearchByItem[]
): void {
  if (searchBy.length) {
    searchBy.forEach((item) => {
      query[item.key] = item.value
    })
  }
}

export function syncExpPanelToUrl(
  query: Record<string, unknown>,
  name: string,
  panel: string[] | string | null | undefined
): void {
  if (panel) {
    if (Array.isArray(panel) && panel.length > 0) {
      query['exp_pan_' + name] = panel.join(',')
      return
    }
    if (typeof panel === 'string' && panel.trim() !== '') {
      query['exp_pan_' + name] = panel
      return
    }
  }
  delete query['exp_pan_' + name]
}

export function syncSimpleStringToUrl(
  query: Record<string, unknown>,
  key: string,
  value: string
): void {
  if (value) {
    query[key] = value
  }
}
