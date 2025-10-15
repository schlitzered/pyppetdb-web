import { ref, reactive, nextTick } from 'vue'
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
    tableExpPanName = 'default',
    dataTransformers = {},
    dataTableType = 'server' // 'server', 'client', 'virtual', etc.
  } = config

  const route = useRoute()
  const router = useRouter()

  const tableItems = ref([])
  const tableItemsMeta = ref({})
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

    if (dataTableType === 'server') {
      _params.fields = fields
      if (_params.page) {
        _params.page = _params.page - 1
      }
    } else {
      delete _params.page
      delete _params.limit
      delete _params.sort
      delete _params.sort_order
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
        if (dataTableType === 'server' && data.meta) {
          tableTotalItems.value = data.meta['result_size']
          tableItemsMeta.value = data.meta
        }
        tableItems.value = applyDataTransformers(data.result, dataTransformers)
        tableLoading.value = false
      }
    })
  }

  function getSearchDataInputEvent() {
    let _event = {
      page: 1, // Reset to page 1 for search operations
      itemsPerPage: tableItemsPerPage.value,
      sortBy: [...tableSortBy],
      searchBy: getParamsSearchBy()
    }
    tablePage.value = 1
    getSearchData(_event)
  }

  function getSearchDataExpPanelEvent() {
    let _event = {
      page: tablePage.value, // Keep current page for ExpPanel operations
      itemsPerPage: tableItemsPerPage.value,
      sortBy: [...tableSortBy],
      searchBy: getParamsSearchBy()
    }
    getSearchData(_event)
  }

  function getSearchDataTableEvent(event) {
    event.searchBy = getParamsSearchBy()
    event.sortBy = [...event.sortBy]
    
    const sortByChanged = !areArraysEqual(tableSortBy, event.sortBy)
    
    if (sortByChanged) {
      nextTick(() => {
        tableSortBy.length = 0
        if (event.sortBy.length) {
          for (let item of event.sortBy) {
            tableSortBy.push(item)
          }
        }
      })
    }
    
    getSearchData(event)
  }

  return {
    tableItems,
    tableItemsMeta,
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
    getSearchDataExpPanelEvent, // Add this new function
    getParamsSearchBy
  }
}

function applyDataTransformers(items, transformers) {
  if (!transformers || Object.keys(transformers).length === 0) {
    return items
  }

  return items.map((item) => {
    const transformedItem = { ...item }

    Object.entries(transformers).forEach(([fieldPath, transformer]) => {
      const fieldValue = getNestedValue(item, fieldPath)
      if (fieldValue !== undefined && typeof transformer === 'function') {
        setNestedValue(
          transformedItem,
          fieldPath,
          transformer(fieldValue, item)
        )
      }
    })

    return transformedItem
  })
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined
  }, obj)
}

function setNestedValue(obj, path, value) {
  const keys = path.split('.')
  const lastKey = keys.pop()
  const target = keys.reduce((current, key) => {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {}
    }
    return current[key]
  }, obj)
  target[lastKey] = value
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
      if (field.processor && field.processor.fromUrl) {
        form[field.key] = field.processor.fromUrl(query[field.key])
      } else if (field.fromUrl) {
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

      if (field.processor && field.processor.toUrl) {
        const urlValue = field.processor.toUrl(value)
        if (urlValue) {
          items.push({ key: apiKey, value: urlValue })
        }
      } else if (field.toUrl) {
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

// Add this helper function at the end of the file
function areArraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false
  
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i].key !== arr2[i].key || arr1[i].order !== arr2[i].order) {
      return false
    }
  }
  
  return true
}
