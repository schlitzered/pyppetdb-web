import { ref } from 'vue'
import { reactive } from 'vue'
import { nextTick } from 'vue'
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import api from '@/api/client'
import type { ResourceDefinition } from '@/types/resources'
import type { RouteLocationNormalized } from 'vue-router'
import { syncPaginationToUrl } from '@/composables/useUrlStateSync'
import { syncSortToUrl } from '@/composables/useUrlStateSync'
import { syncSearchByToUrl } from '@/composables/useUrlStateSync'
import { syncExpPanelToUrl } from '@/composables/useUrlStateSync'
import type { SortByItem } from '@/composables/useUrlStateSync'
import type { SearchByItem } from '@/composables/useUrlStateSync'
import type { SearchFormField } from '@/composables/useResourceListQueryUtils'
import { createSearchForm } from '@/composables/useResourceListQueryUtils'
import { initializeFormFromUrl } from '@/composables/useResourceListQueryUtils'
import { buildSearchParams } from '@/composables/useResourceListQueryUtils'
import { applyDataTransformers } from '@/composables/useResourceListQueryUtils'
import { areArraysEqual } from '@/composables/useResourceListQueryUtils'

interface TableEvent {
  page: number
  itemsPerPage: number
  sortBy: SortByItem[]
  searchBy: SearchByItem[]
}

interface ListApiResponse {
  result: Record<string, unknown>[]
  meta: Record<string, unknown>
}

interface ResourceListQueryConfig {
  resourceDef: ResourceDefinition
  dataTableType?: 'server' | 'client'
  defaultItemsPerPage?: number
  tableExpPanName?: string
}

export function useResourceListQuery(config: ResourceListQueryConfig) {
  const {
    resourceDef,
    dataTableType = 'server',
    defaultItemsPerPage = 10,
    tableExpPanName = 'default'
  } = config

  const route = useRoute()
  const router = useRouter()

  const tableItems = ref<Record<string, unknown>[]>([])
  const tableItemsMeta = ref<Record<string, unknown>>({})
  const tableLoading = ref(true)
  const tablePage = ref(Number(route.query.page) || 1)
  const tableItemsPerPage = ref(
    Number(route.query.limit) || defaultItemsPerPage
  )
  const tableItemsPerPageOptions = [10, 25, 50, 100]
  const tableTotalItems = ref(0)
  const tableSortBy = reactive<SortByItem[]>([])
  const tableExpPan = ref<string[]>(
    route.query['exp_pan_' + tableExpPanName]
      ? String(route.query['exp_pan_' + tableExpPanName]).split(',')
      : []
  )

  let oldUrlParams: Record<string, unknown> | null = null

  if (route.query.sort) {
    tableSortBy.push({
      key: String(route.query.sort),
      order: route.query.sort_order === 'ascending' ? 'asc' : 'desc'
    })
  } else if (resourceDef.defaultSort) {
    tableSortBy.push({
      key: resourceDef.defaultSort.field,
      order: resourceDef.defaultSort.order
    })
  }

  const searchFormSchema =
    resourceDef.searchFilters as unknown as SearchFormField[]
  const formSearchBy = reactive(createSearchForm(searchFormSchema))
  initializeFormFromUrl({
    form: formSearchBy,
    schema: searchFormSchema,
    query: route.query as Record<string, string>
  })

  function getApiEndpoint(currentRoute: RouteLocationNormalized): string {
    if (typeof resourceDef.apiBase === 'function') {
      return resourceDef.apiBase(currentRoute)
    }
    return resourceDef.apiBase
  }

  function getParamsSearchBy(): SearchByItem[] {
    return buildSearchParams({
      form: formSearchBy,
      schema: searchFormSchema
    })
  }

  function getSearchData(event: TableEvent, force: boolean = false): void {
    const query: Record<string, unknown> = {}

    if (event.itemsPerPage === -1) {
      tableItemsPerPage.value = 100
      event.itemsPerPage = 100
    }

    syncPaginationToUrl(query, event.page, event.itemsPerPage)
    syncSortToUrl(query, event.sortBy, tableSortBy)
    syncSearchByToUrl(query, event.searchBy)

    const _params: Record<string, unknown> = { ...query }

    if (dataTableType === 'server') {
      if (resourceDef.apiFields) {
        _params.fields = resourceDef.apiFields
      }
      if (_params.page) {
        _params.page = Number(_params.page) - 1
      }
    } else {
      delete _params.page
      delete _params.limit
      delete _params.sort
      delete _params.sort_order
    }

    syncExpPanelToUrl(query, tableExpPanName, tableExpPan.value)

    router.replace({
      name: resourceDef.routeNames.search,
      query: query as Record<string, string>
    })

    if (
      !force &&
      oldUrlParams !== null &&
      JSON.stringify(_params) === JSON.stringify(oldUrlParams)
    ) {
      return
    }
    oldUrlParams = { ..._params }
    tableLoading.value = true

    const endpoint = getApiEndpoint(route)

    api
      .get<ListApiResponse>(endpoint, _params)
      .then((data) => {
        if (data) {
          if (dataTableType === 'server' && data.meta) {
            tableTotalItems.value = data.meta['result_size'] as number
            tableItemsMeta.value = data.meta
          }
          tableItems.value = applyDataTransformers({
            items: data.result,
            transformers: resourceDef.dataTransformers ?? {}
          })
        } else {
          tableItems.value = []
          tableTotalItems.value = 0
        }
      })
      .catch(() => {
        tableItems.value = []
        tableTotalItems.value = 0
      })
      .finally(() => {
        tableLoading.value = false
      })
  }

  function getSearchDataInputEvent(force: boolean = false): void {
    const _event: TableEvent = {
      page: 1,
      itemsPerPage: tableItemsPerPage.value,
      sortBy: [...tableSortBy],
      searchBy: getParamsSearchBy()
    }
    tablePage.value = 1
    getSearchData(_event, force)
  }

  function getSearchDataExpPanelEvent(): void {
    const _event: TableEvent = {
      page: tablePage.value,
      itemsPerPage: tableItemsPerPage.value,
      sortBy: [...tableSortBy],
      searchBy: getParamsSearchBy()
    }
    getSearchData(_event)
  }

  function getSearchDataTableEvent(event: TableEvent): void {
    event.searchBy = getParamsSearchBy()
    event.sortBy = [...event.sortBy]

    const sortByChanged = !areArraysEqual({
      arr1: tableSortBy,
      arr2: event.sortBy
    })

    if (sortByChanged) {
      nextTick(() => {
        tableSortBy.length = 0
        if (event.sortBy.length) {
          for (const item of event.sortBy) {
            tableSortBy.push(item)
          }
        }
      })
    }

    getSearchData(event)
  }

  watch(
    () => route.path,
    () => {
      tablePage.value = Number(route.query.page) || 1
      tableItemsPerPage.value = Number(route.query.limit) || defaultItemsPerPage
      tableSortBy.length = 0
      if (route.query.sort) {
        tableSortBy.push({
          key: String(route.query.sort),
          order: route.query.sort_order === 'ascending' ? 'asc' : 'desc'
        })
      } else if (resourceDef.defaultSort) {
        tableSortBy.push({
          key: resourceDef.defaultSort.field,
          order: resourceDef.defaultSort.order
        })
      }
      for (const k of Object.keys(formSearchBy)) {
        delete formSearchBy[k]
      }
      Object.assign(formSearchBy, createSearchForm(searchFormSchema))
      initializeFormFromUrl({
        form: formSearchBy,
        schema: searchFormSchema,
        query: route.query as Record<string, string>
      })
      oldUrlParams = null
      getSearchDataInputEvent(true)
    }
  )

  watch(
    () => tableExpPan.value,
    () => {
      getSearchDataExpPanelEvent()
    },
    { deep: true }
  )

  return {
    tableItems,
    tableItemsMeta,
    tableLoading,
    tablePage,
    tableItemsPerPage,
    tableItemsPerPageOptions,
    tableTotalItems,
    tableSortBy,
    tableExpPan,
    formSearchBy,
    getSearchData: getSearchDataInputEvent,
    getSearchDataTableEvent,
    getSearchDataExpPanelEvent,
    getParamsSearchBy,
    reload: () => getSearchDataInputEvent(true)
  }
}
