import { ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api/common'
import {
  syncExpPanelToUrl,
  syncPaginationToUrl,
  syncSeachByToUrl,
  syncSortToUrl
} from '@/common/url_state_sync'

export function useDataTable(config) {
  const {
    apiEndpoint,
    routeName,
    fields,
    searchFormSchema,
    defaultItemsPerPage = 10,
    tableExpPanName = 'default'
  } = config

  const route = useRoute()
  const router = useRouter()

  const tableItems = ref([])
  const tableLoading = ref(true)
  const tablePage = ref(Number(route.query.page) || 1)
  const tableItemsPerPage = ref(
    Number(route.query.limit) || defaultItemsPerPage
  )
  const tableItemsPerPageOptions = [10, 25, 50, 100]
  const tableTotalItems = ref(0)
  const tableSortBy = reactive([])
  const tableExpPan = ref(
    route.query['exp_pan_' + tableExpPanName]
      ? route.query['exp_pan_' + tableExpPanName].split(',')
      : []
  )

  let oldUrlParams = {}

  if (route.query.sort) {
    tableSortBy.push({
      key: route.query.sort,
      order: route.query.sort_order === 'ascending' ? 'asc' : 'desc'
    })
  }

  const formSearchBy = reactive(createSearchForm(searchFormSchema))
  initializeFormFromUrl(formSearchBy, searchFormSchema, route.query)

  function getParamsSearchBy() {
    return buildSearchParams(formSearchBy, searchFormSchema)
  }

  function getSearchData(event) {
    let query = {}

    if (event.itemsPerPage === -1) {
      tableItemsPerPage.value = 100
      event.itemsPerPage = 100
    }

    syncPaginationToUrl(query, event.page, event.itemsPerPage)
    syncSortToUrl(query, event.sortBy, tableSortBy)
    syncSeachByToUrl(query, event.searchBy)

    let _params = { ...query }
    _params.fields = fields
    if (_params.page) {
      _params.page = _params.page - 1
    }

    syncExpPanelToUrl(query, tableExpPanName, tableExpPan.value)

    router.replace({
      name: routeName,
      query: query
    })

    if (JSON.stringify(_params) === JSON.stringify(oldUrlParams)) {
      return
    }
    oldUrlParams = _params
    tableLoading.value = true

    api.get(apiEndpoint, _params).then((data) => {
      if (data) {
        tableTotalItems.value = data.meta['result_size']
        tableItems.value = data.result
        tableLoading.value = false
      }
    })
  }

  function getSearchDataInputEvent() {
    let _event = {
      page: tablePage.value,
      itemsPerPage: tableItemsPerPage.value,
      sortBy: [...tableSortBy],
      searchBy: getParamsSearchBy()
    }
    tablePage.value = 1
    getSearchData(_event)
  }

  function getSearchDataTableEvent(event) {
    event.searchBy = getParamsSearchBy()
    event.sortBy = [...event.sortBy]
    tableSortBy.length = 0
    if (event.sortBy.length) {
      for (let item of event.sortBy) {
        tableSortBy.push(item)
      }
    }
    getSearchData(event)
  }

  return {
    tableItems,
    tableLoading,
    tablePage,
    tableItemsPerPage,
    tableItemsPerPageOptions,
    tableTotalItems,
    tableSortBy,
    tableExpPan: tableExpPan,
    formSearchBy,

    getSearchData: getSearchDataInputEvent,
    getSearchDataTableEvent,
    getParamsSearchBy
  }
}

function createSearchForm(schema) {
  const form = {}
  schema.forEach((field) => {
    if (field.type === 'array') {
      form[field.key] = field.default || []
    } else {
      form[field.key] = field.default || ''
    }
  })
  return form
}

function initializeFormFromUrl(form, schema, query) {
  schema.forEach((field) => {
    if (query[field.key]) {
      if (field.fromUrl) {
        form[field.key] = field.fromUrl(query[field.key])
      } else if (field.type === 'array') {
        form[field.key] = Array.isArray(query[field.key])
          ? query[field.key]
          : [query[field.key]]
      } else {
        form[field.key] = query[field.key]
      }
    }
  })
}

function buildSearchParams(form, schema) {
  const items = []

  schema.forEach((field) => {
    const value = form[field.key]
    const hasValue = field.type === 'array' ? value.length > 0 : value

    if (hasValue) {
      const apiKey = field.apiKey || field.key

      if (field.toUrl) {
        const urlValue = field.toUrl(value)
        if (urlValue) {
          items.push({ key: apiKey, value: urlValue })
        }
      } else {
        items.push({ key: apiKey, value })
      }
    }
  })

  return items
}
