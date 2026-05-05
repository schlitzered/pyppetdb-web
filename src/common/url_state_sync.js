/*
 * Copyright 2026 Stephan Schultchen
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function syncPaginationToUrl(query, page, perPage, suffix = '') {
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

function syncSeachByToUrl(query, searchBy) {
  if (searchBy.length) {
    searchBy.forEach((item) => {
      query[item.key] = item.value
    })
  }
}

function syncSimpleStringToUrl(query, key, value) {
  if (value) {
    query[key] = value
  }
}

function syncSortToUrl(query, sortBy, tableSortBy, suffix = '') {
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

function syncExpPanelToUrl(query, exp_panel_name, expansionPanel) {
  if (expansionPanel.length) {
    query['exp_pan_' + exp_panel_name] = expansionPanel.join(',')
  }
}

export {
  syncExpPanelToUrl,
  syncPaginationToUrl,
  syncSeachByToUrl,
  syncSimpleStringToUrl,
  syncSortToUrl
}
