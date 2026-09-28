import { ref } from 'vue'
import api from '@/api/client'

export type FactKind = 'str' | 'int' | 'float' | 'bool'

export interface FactValueOption {
  label: string
  value: string
}

// the editable state of one `fact:operator:type:value` filter; `kind` and
// `values` are filled in from _distinct_fact_values
export interface FactFilterPart {
  operator: string
  type: string
  value: string
  kind?: FactKind | null
  values?: FactValueOption[]
}

export const ALL_OPERATORS = [
  'eq',
  'gt',
  'gte',
  'in',
  'lt',
  'lte',
  'ne',
  'nin',
  'regex'
]
const NUMERIC_OPERATORS = ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin']
const KIND_OPERATORS: Record<FactKind, string[]> = {
  str: ['eq', 'ne', 'in', 'nin', 'regex'],
  int: NUMERIC_OPERATORS,
  float: NUMERIC_OPERATORS,
  bool: ['eq', 'ne']
}
const RANGE_OPERATORS = ['gt', 'gte', 'lt', 'lte']
export const LIST_OPERATORS = ['in', 'nin']
const CHOICE_OPERATORS = ['eq', 'ne', 'in', 'nin']

export const inferKind = (values: any[]): FactKind | null => {
  if (values.length === 0) return null
  if (values.every((v) => typeof v === 'boolean')) return 'bool'
  if (values.every((v) => typeof v === 'number')) {
    return values.every(Number.isInteger) ? 'int' : 'float'
  }
  if (values.every((v) => typeof v === 'string')) return 'str'
  return null
}

export const operatorsFor = (part: FactFilterPart) =>
  part.kind ? KIND_OPERATORS[part.kind] : ALL_OPERATORS

export const usesValueChoices = (part: FactFilterPart) =>
  !!part.kind &&
  (part.values?.length ?? 0) > 0 &&
  CHOICE_OPERATORS.includes(part.operator)

export const valuePlaceholder = (part: FactFilterPart) => {
  if (part.operator === 'regex') return 'Regex'
  if (LIST_OPERATORS.includes(part.operator)) return 'a,b,c'
  if (RANGE_OPERATORS.includes(part.operator) && part.values?.length) {
    const numbers = part.values.map((v) => Number(v.value))
    return `${Math.min(...numbers)} … ${Math.max(...numbers)}`
  }
  return 'Value'
}

export const formatFactFilter = (fact: string, part: FactFilterPart) => {
  if (fact && part.operator && part.type && part.value !== undefined) {
    return `${fact}:${part.operator}:${part.type}:${part.value}`
  }
  return null
}

// Suggestions for fact filters, narrowed by `context`: the filters already
// in effect (e.g. the preceding AND parts), so only names/values that still
// match nodes are offered. `baseParams` adds fixed endpoint filters such as
// `disabled`.
export function useFactSuggestions(
  baseParams: () => Record<string, any> = () => ({})
) {
  const availableFacts = ref<string[]>([])

  // ponytail: per-instance cache, never invalidated — facts don't change
  // meaningfully while someone is building a filter
  const requestCache = new Map<string, Promise<any>>()
  const cachedGet = (url: string, params: Record<string, any>) => {
    const key = url + JSON.stringify(params)
    if (!requestCache.has(key)) {
      requestCache.set(
        key,
        api.get<any>(url, params, true).catch((err) => {
          requestCache.delete(key)
          throw err
        })
      )
    }
    return requestCache.get(key)!
  }

  const withContext = (context: string[], params: Record<string, any> = {}) => {
    const merged = { ...baseParams(), ...params }
    if (context.length > 0) {
      merged.fact = context
    }
    return merged
  }

  const loadFactNames = async () => {
    try {
      const data = await api.get<any>('/api/v1/nodes/_distinct_fact_names')
      if (data && data.result) {
        availableFacts.value = data.result
      }
    } catch (err) {
      console.error(err)
    }
  }

  const searchFactNames = async (query: string, context: string[] = []) => {
    let names = availableFacts.value
    const params = withContext(context)
    if (Object.keys(params).length > 0) {
      try {
        const data = await cachedGet(
          '/api/v1/nodes/_distinct_fact_names',
          params
        )
        names = data?.result || []
      } catch (err) {
        console.error(err)
      }
    }
    const q = (query || '').toLowerCase()
    return names.filter((f) => f.toLowerCase().includes(q))
  }

  const fetchFactValues = async (
    fact: string,
    context: string[] = []
  ): Promise<{ value: any; count: number }[]> => {
    const data = await cachedGet(
      '/api/v1/nodes/_distinct_fact_values',
      withContext(context, { fact_id: fact })
    )
    return data?.result || []
  }

  // Fills part.kind / part.values for `fact`; a detected kind fixes the type
  // and resets an operator that doesn't apply to it. Unknown facts clear both
  // so the form falls back to free input.
  const refreshPart = async (
    part: FactFilterPart,
    fact: string,
    context: string[] = [],
    isCurrent: () => boolean = () => true
  ) => {
    const known =
      availableFacts.value.length === 0 || availableFacts.value.includes(fact)
    if (!fact || !known) {
      part.kind = null
      part.values = []
      return
    }
    try {
      const result = await fetchFactValues(fact, context)
      if (!isCurrent()) return
      part.kind = inferKind(result.map((r) => r.value))
      part.values = result.map((r) => ({
        label: `${r.value} (${r.count})`,
        value: String(r.value)
      }))
      if (part.kind) {
        part.type = part.kind
        if (!KIND_OPERATORS[part.kind].includes(part.operator)) {
          part.operator = 'eq'
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Refreshes a chain of AND parts in order: each part's context is every
  // complete part before it, and a refresh may change a part's type/operator,
  // which changes the context of the parts after it.
  const refreshChain = async <T extends FactFilterPart>(
    parts: T[],
    factOf: (part: T) => string
  ) => {
    const context: string[] = []
    for (const part of parts) {
      const fact = factOf(part)
      await refreshPart(part, fact, [...context], () => factOf(part) === fact)
      const formatted =
        part.value !== '' ? formatFactFilter(factOf(part), part) : null
      if (formatted) {
        context.push(formatted)
      }
    }
  }

  return {
    availableFacts,
    loadFactNames,
    searchFactNames,
    fetchFactValues,
    refreshPart,
    refreshChain
  }
}
