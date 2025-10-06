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
  const tableItemsPerPage = ref(Number(route.query.limit) || defaultItemsPerPage)
  const tableItemsPerPageOptions = [10, 25, 50, 100]
  const tableTotalItems = ref(0)
  const tableSortBy = reactive([])
  const tableExpPan = ref(route.query["exp_pan_" + tableExpPanName] ? route.query["exp_pan_" + tableExpPanName].split(',') : [])

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

  function getNodes(event) {
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

  function getSearchData() {
    let _event = {
      page: tablePage.value,
      itemsPerPage: tableItemsPerPage.value,
      sortBy: [...tableSortBy],
      searchBy: getParamsSearchBy()
    }
    tablePage.value = 1
    getNodes(_event)
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
    getNodes(event)
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
    
    getSearchData,
    getSearchDataTableEvent,
    getParamsSearchBy
  }
}

function createSearchForm(schema) {
  const form = {}
  schema.forEach(field => {
    if (field.type === 'nested') {
      form[field.key] = {}
      field.children.forEach(child => {
        form[field.key][child.key] = child.default || ''
      })
    } else if (field.type === 'array') {
      form[field.key] = []
    } else {
      form[field.key] = field.default || ''
    }
  })
  return form
}

function initializeFormFromUrl(form, schema, query) {
  schema.forEach(field => {
    if (field.type === 'nested') {
      field.children.forEach(child => {
        const queryKey = `${field.key}_${child.key}`
        if (query[queryKey]) {
          form[field.key][child.key] = query[queryKey]
        }
      })
    } else if (field.type === 'array') {
      if (query[field.key]) {
        if (field.fromUrl) {
          form[field.key] = field.fromUrl(query[field.key])
        } else {
          form[field.key] = Array.isArray(query[field.key]) ? query[field.key] : [query[field.key]]
        }
      }
    } else if (query[field.key]) {
      if (field.fromUrl) {
        form[field.key] = field.fromUrl(query[field.key])
      } else {
        form[field.key] = query[field.key]
      }
    }
  })
}

function buildSearchParams(form, schema) {
  const items = []
  
  schema.forEach(field => {
    if (field.type === 'nested') {
      field.children.forEach(child => {
        const value = form[field.key][child.key]
        if (value) {
          items.push({ key: `${field.key}_${child.key}`, value })
        }
      })
    } else if (field.type === 'array') {
      if (form[field.key].length > 0) {
        if (field.toUrl) {
          const urlValue = field.toUrl(form[field.key])
          if (urlValue) {
            items.push({ key: field.key, value: urlValue })
          }
        } else {
          items.push({ key: field.key, value: form[field.key] })
        }
      }
    } else if (form[field.key]) {
      if (field.toUrl) {
        const urlValue = field.toUrl(form[field.key])
        if (urlValue) {
          items.push({ key: field.key, value: urlValue })
        }
      } else {
        items.push({ key: field.key, value: form[field.key] })
      }
    }
  })
  
  return items
}
