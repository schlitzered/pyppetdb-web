import type { Component } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'

export type FieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'autocomplete'
  | 'switch'
  | 'chip-list'
  | 'password'
  | 'double-password'
  | 'readonly'
  | 'number'
  | 'permission-grid'

export interface FieldOption {
  label: string
  value: string
}

export interface AutocompleteConfig {
  endpoint: string | ((formData: Record<string, any>, query: string) => any)
  field: string
  responseField?: string
  minLength?: number
  multiple?: boolean
}

export interface FieldDefinition {
  key: string
  label: string
  type: FieldType
  icon?: string
  readonly?: boolean
  readonlyOnEdit?: boolean
  required?: boolean
  rules?: ((value: unknown) => boolean | string)[]
  options?: FieldOption[]
  autocomplete?: AutocompleteConfig
  defaultValue?: unknown
  hidden?: boolean
  hiddenOnCreate?: boolean
  hiddenOnEdit?: boolean
  cols?: number
  appendSlot?: string
}

export type SortOrder = 'asc' | 'desc'

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  linkRoute?: string
  linkParam?: string
  linkParams?: Record<string, string>
  formatter?: (value: unknown, row: Record<string, unknown>) => string
  component?: Component
  width?: string
}

export interface SearchFilterType {
  key: string
  label: string
  type: 'text' | 'select' | 'boolean' | 'array'
  apiKey?: string
  options?: FieldOption[]
  processor?: {
    toUrl: (value: unknown) => string | string[] | undefined
    fromUrl: (value: any) => unknown
  }
}

export interface BatchAction {
  label: string
  color: string
  action: string
  canApply: (items: Record<string, unknown>[]) => boolean
}

export interface ResourcePermissions {
  edit?: (
    hasPermission: (perm: string) => boolean,
    item?: Record<string, unknown>
  ) => boolean
  delete?: (
    hasPermission: (perm: string) => boolean,
    item?: Record<string, unknown>
  ) => boolean
  create?: (hasPermission: (perm: string) => boolean) => boolean
}

export interface NavConfig {
  label: string
  icon: string
  group: string
  groupOrder: number
  order: number
  requireAdmin?: boolean
  requiredPermission?: string | RegExp
}

export interface ToolbarItem {
  label: string
  icon: string
  to?:
    | Record<string, unknown>
    | ((route: RouteLocationNormalized) => Record<string, unknown>)
  hide?: (
    route: RouteLocationNormalized,
    hasPermission: (perm: string) => boolean
  ) => boolean
  requireAdmin?: boolean
  emit?: string
}

export interface BreadcrumbItem {
  title: string
  to?: Record<string, unknown>
  disabled?: boolean
}

export interface ResourceDefinition {
  name: string
  label: string
  labelPlural: string
  apiBase: string | ((route: RouteLocationNormalized) => string)
  routeParam: string
  routeNames: {
    search: string
    crud: string
  }
  path?: string
  crudPath?: string
  nav?: NavConfig
  breadcrumbs: {
    search:
      | BreadcrumbItem[]
      | ((route: RouteLocationNormalized) => BreadcrumbItem[])
    crud: (route: RouteLocationNormalized) => BreadcrumbItem[]
  }
  toolbar: {
    search: {
      title: string
      items: ToolbarItem[]
    }
    crud: {
      title: string | ((route: RouteLocationNormalized) => string)
      items: ToolbarItem[]
    }
  }
  tableColumns: TableColumn[]
  searchFilters: SearchFilterType[]
  fields: FieldDefinition[]
  permissions: ResourcePermissions
  defaultSort?: { field: string; order: SortOrder }
  apiFields?: string[]
  batchActions?: BatchAction[]
  searchOnly?: boolean
  writeOnly?: boolean
  customFormComponent?: Component
  customSearchComponent?: Component
  creationParams?: Record<string, string>
  dataTransformers?: Record<string, (value: unknown) => unknown>
}
