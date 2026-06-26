import { vi } from 'vitest'

export function createMockRoute() {
  return {
    name: '',
    params: {
      id: '_new'
    },
    query: {},
    meta: {
      resource: createMockResourceDef()
    }
  }
}

export function createMockRouter() {
  return {
    push: vi.fn(),
    replace: vi.fn(),
    resolve: () => {
      return {
        href: ''
      }
    }
  }
}

export function createMockResourceDef() {
  return {
    routeParam: 'id',
    label: 'Resource',
    labelPlural: 'Resources',
    name: 'resources',
    fields: [],
    searchFilters: [],
    apiBase: 'resources',
    defaultSort: {
      field: 'id',
      order: 'asc'
    },
    permissions: {
      create: () => {
        return true
      }
    },
    toolbar: {
      crud: {
        title: 'Resource CRUD',
        items: []
      }
    },
    routeNames: {
      search: 'resources-search'
    }
  }
}

export const primeVueStubs = {
  'v-card': true,
  'v-card-title': true,
  'v-card-text': true,
  'v-card-actions': true,
  'v-form': true,
  'v-switch': true,
  'v-text-field': true,
  'v-textarea': true,
  'v-expansion-panels': true,
  'v-expansion-panel': true,
  'v-expansion-panel-title': true,
  'v-expansion-panel-text': true,
  'v-data-table': true,
  'v-data-table-server': {
    template: '<div><slot name="top" /><slot /></div>'
  },
  'v-toolbar': true,
  'v-toolbar-title': true,
  'v-spacer': true,
  'v-btn': true,
  'v-divider': true,
  'v-icon': true,
  'v-row': true,
  'v-col': true,
  'v-select': true,
  'v-chip': true,
  'v-menu': true,
  'v-list': true,
  'v-list-group': true,
  'v-list-item': true,
  'v-list-item-title': true,
  'v-list-item-subtitle': true,
  'v-list-subheader': true,
  'v-container': true,
  'v-tooltip': true,
  'v-app-bar': true,
  'v-app-bar-title': true,
  'v-app-bar-nav-icon': true,
  'v-dialog': true,
  'v-main': true,
  'v-app': true,
  'v-navigation-drawer': true,
  'router-view': true,
  'router-link': true,
  'v-alert': true,
  'v-progress-linear': true,
  'v-progress-circular': true,
  'v-footer': true,
  'v-breadcrumbs': true,
  'v-breadcrumbs-item': true,
  'v-breadcrumbs-divider': true,
  'v-infinite-scroll': true,
  ComponentDialogWarning: true,
  ComponentGenericToolBar: true,
  ComponentNodesSearch: true,
  ComponentNodesCrud: true,
  ComponentUsersSearch: true,
  ComponentUsersCrud: true
}
