import type { ResourceDefinition } from '@/types/resources'
import type { SearchFilterType } from '@/types/resources'
import { PERMISSIONS } from '@/constants/permissions'
import { AUDIT_MODULES } from '@/utils/audit'
import { AUDIT_ACTOR_KINDS } from '@/utils/audit'
import { AUDIT_OBJECT_KINDS } from '@/utils/audit'
import AuditSearch from '@/components/special/AuditSearch.vue'
import AuditConfig from '@/components/special/AuditConfig.vue'

const toOptions = (values: string[]) =>
  values.map((v) => ({ label: v, value: v }))

// DatePicker gives a Date; the api and the URL want ISO 8601 with timezone
export const dateTimeProcessor: NonNullable<SearchFilterType['processor']> = {
  toUrl: (value) =>
    value instanceof Date
      ? value.toISOString()
      : String(value || '') || undefined,
  fromUrl: (value) => {
    const date = new Date(String(value))
    return isNaN(date.getTime()) ? '' : date
  }
}

const breadcrumbBase = [
  { title: 'Pyppetdb', to: { name: 'Home' } },
  { title: 'Audit' }
]

export const audit: ResourceDefinition = {
  name: 'audit',
  label: 'Audit Event',
  labelPlural: 'Audit Log',
  apiBase: '/api/v1/audit',
  routeParam: 'event_id',
  routeNames: {
    search: 'AuditSearch',
    crud: ''
  },
  path: '/audit/events',
  searchOnly: true,
  customSearchComponent: AuditSearch,
  nav: {
    label: 'Audit Log',
    icon: 'FileText',
    group: 'Audit',
    groupOrder: 7,
    order: 1,
    requiredPermission: PERMISSIONS.AUDIT.GET
  },
  breadcrumbs: {
    search: [...breadcrumbBase, { title: 'Audit Log' }],
    crud: () => []
  },
  toolbar: {
    search: { title: 'Audit Log', items: [] },
    crud: { title: '', items: [] }
  },
  defaultSort: { field: 'time', order: 'desc' },
  // rendered by AuditEventTable
  tableColumns: [],
  searchFilters: [
    { key: 'event', label: 'Event (regex)', type: 'autocomplete' },
    {
      key: 'module',
      label: 'Module',
      type: 'select',
      options: toOptions(AUDIT_MODULES)
    },
    { key: 'transaction', label: 'Transaction', type: 'text' },
    {
      key: 'actor_kind',
      label: 'Actor Kind',
      type: 'select',
      options: toOptions(AUDIT_ACTOR_KINDS)
    },
    { key: 'actor_id', label: 'Actor ID (regex)', type: 'text' },
    {
      key: 'object_kind',
      label: 'Object Kind',
      type: 'select',
      options: toOptions(AUDIT_OBJECT_KINDS)
    },
    { key: 'object_id', label: 'Object ID (regex)', type: 'text' },
    { key: 'ip', label: 'IP', type: 'text' },
    {
      key: 'since',
      label: 'Since',
      type: 'datetime',
      processor: dateTimeProcessor
    },
    {
      key: 'until',
      label: 'Until',
      type: 'datetime',
      processor: dateTimeProcessor
    }
  ],
  fields: [],
  permissions: {}
}

export const auditConfig: ResourceDefinition = {
  name: 'audit/config',
  label: 'Audit Configuration',
  labelPlural: 'Audit Configuration',
  apiBase: '/api/v1/audit/config',
  routeParam: 'config',
  routeNames: {
    search: 'AuditConfig',
    crud: ''
  },
  path: '/audit/config',
  // a single page, no list: hosted as a search-only route
  searchOnly: true,
  customSearchComponent: AuditConfig,
  nav: {
    label: 'Configuration',
    icon: 'FileCog',
    group: 'Audit',
    groupOrder: 7,
    order: 2,
    // UPDATE implies GET
    requiredPermission: '^AUDIT:CONFIG::(GET|UPDATE)$'
  },
  breadcrumbs: {
    search: [...breadcrumbBase, { title: 'Configuration' }],
    crud: () => []
  },
  toolbar: {
    search: { title: 'Audit Configuration', items: [] },
    crud: { title: '', items: [] }
  },
  tableColumns: [],
  searchFilters: [],
  fields: [],
  permissions: {}
}
