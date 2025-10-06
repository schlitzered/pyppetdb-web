function syncPaginationToUrl(query, page, perPage) {
    if (page !== 1) {
        query.page = page
    }
    if (perPage !== 10) {
        query.limit = perPage
    }
}

function syncSeachByToUrl(query, searchBy) {
    if (searchBy.length) {
        searchBy.forEach((item) => {
            query[item.key] = item.value
        })
    }
}

function syncSortToUrl(query, sortBy, tableSortBy) {
    if (sortBy.length) {
        query.sort = sortBy[0].key
        if (sortBy[0].order === 'asc') {
            query.sort_order = 'ascending'
        } else {
            query.sort_order = 'descending'
        }
    } else {
        tableSortBy.length = 0
    }
}

function syncExpPanelToUrl(query, exp_panel_name, expansionModeled) {
    let panels = []
    expansionModeled.forEach((item) => {
        panels.push(item)
    })
    console.log(panels)
    if (panels.length) {
        query["exp_pan_" + exp_panel_name] = panels
    }
}


export {
    syncExpPanelToUrl,
    syncPaginationToUrl,
    syncSeachByToUrl,
    syncSortToUrl,
}