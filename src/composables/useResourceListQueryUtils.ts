import type { SortByItem } from '@/composables/useUrlStateSync'
import type { SearchByItem } from '@/composables/useUrlStateSync'

export interface SearchFormField {
  key: string
  type: string
  default?: unknown
  apiKey?: string
  processor?: {
    toUrl: (value: unknown) => string | undefined
    fromUrl: (value: string) => unknown
  }
}

export function getNestedValue({
  obj,
  path
}: {
  obj: Record<string, unknown>
  path: string
}): unknown {
  let current: any = obj
  const keys = path.split('.')
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key]
    } else {
      return undefined
    }
  }
  return current
}

export function setNestedValue({
  obj,
  path,
  value
}: {
  obj: Record<string, unknown>
  path: string
  value: unknown
}): void {
  const keys = path.split('.')
  const lastKey = keys.pop()!
  let current = obj
  for (const key of keys) {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key] as Record<string, unknown>
  }
  current[lastKey] = value
}

export function applyDataTransformers({
  items,
  transformers
}: {
  items: Record<string, unknown>[]
  transformers: Record<string, (value: unknown) => unknown>
}): Record<string, unknown>[] {
  if (!transformers || Object.keys(transformers).length === 0) {
    return items
  }

  const result: Record<string, unknown>[] = []
  for (const item of items) {
    const transformedItem = { ...item }
    for (const [fieldPath, transformer] of Object.entries(transformers)) {
      const fieldValue = getNestedValue({
        obj: item,
        path: fieldPath
      })
      if (fieldValue !== undefined && typeof transformer === 'function') {
        setNestedValue({
          obj: transformedItem,
          path: fieldPath,
          value: transformer(fieldValue)
        })
      }
    }
    result.push(transformedItem)
  }
  return result
}

export function createSearchForm(
  schema: SearchFormField[]
): Record<string, any> {
  const form: Record<string, any> = {}
  for (const field of schema) {
    if (field.type === 'array') {
      form[field.key] = field.default || []
    } else {
      form[field.key] = field.default || ''
    }
  }
  return form
}

export function initializeFormFromUrl({
  form,
  schema,
  query
}: {
  form: Record<string, any>
  schema: SearchFormField[]
  query: Record<string, string>
}): void {
  for (const field of schema) {
    if (query[field.key]) {
      if (field.processor && field.processor.fromUrl) {
        form[field.key] = field.processor.fromUrl(query[field.key])
      } else if (field.type === 'array') {
        const val = query[field.key]
        form[field.key] = Array.isArray(val) ? val : [val]
      } else {
        form[field.key] = query[field.key]
      }
    }
  }
}

export function buildSearchParams({
  form,
  schema
}: {
  form: Record<string, any>
  schema: SearchFormField[]
}): SearchByItem[] {
  const items: SearchByItem[] = []

  for (const field of schema) {
    const value = form[field.key]
    const hasValue = Array.isArray(value) ? value.length > 0 : Boolean(value)

    if (hasValue) {
      const apiKey = field.apiKey || field.key

      if (field.processor && field.processor.toUrl) {
        const urlValue = field.processor.toUrl(value)
        if (urlValue) {
          items.push({
            key: apiKey,
            value: urlValue
          })
        }
      } else {
        items.push({
          key: apiKey,
          value: value
        })
      }
    }
  }

  return items
}

export function areArraysEqual({
  arr1,
  arr2
}: {
  arr1: SortByItem[]
  arr2: SortByItem[]
}): boolean {
  if (arr1.length !== arr2.length) {
    return false
  }

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i].key !== arr2[i].key || arr1[i].order !== arr2[i].order) {
      return false
    }
  }

  return true
}
