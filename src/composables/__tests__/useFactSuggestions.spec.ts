import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { vi } from 'vitest'
import { beforeEach } from 'vitest'
import api from '@/api/client'
import { useFactSuggestions } from '../useFactSuggestions'
import { inferKind } from '../useFactSuggestions'
import { operatorsFor } from '../useFactSuggestions'
import { usesValueChoices } from '../useFactSuggestions'
import { valuePlaceholder } from '../useFactSuggestions'
import { formatFactFilter } from '../useFactSuggestions'
import type { FactFilterPart } from '../useFactSuggestions'

vi.mock('@/api/client', () => ({
  default: {
    get: vi.fn()
  }
}))

const VALUES: Record<string, { value: any; count: number }[]> = {
  'os.family': [
    { value: 'Debian', count: 3 },
    { value: 'RedHat', count: 5 }
  ],
  cpus: [
    { value: 2, count: 4 },
    { value: 16, count: 1 }
  ]
}

const newPart = (): FactFilterPart => ({
  operator: 'regex',
  type: 'str',
  value: ''
})

describe('useFactSuggestions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.get).mockImplementation((url: string, params?: any) => {
      if (url === '/api/v1/nodes/_distinct_fact_names') {
        return Promise.resolve({
          result: params?.fact ? ['cpus'] : ['os.family', 'cpus']
        })
      }
      if (url === '/api/v1/nodes/_distinct_fact_values') {
        return Promise.resolve({ result: VALUES[params.fact_id] || [] })
      }
      return Promise.resolve({ result: [] })
    })
  })

  it('infers the kind of a value set', () => {
    expect(inferKind([])).toBe(null)
    expect(inferKind([true, false])).toBe('bool')
    expect(inferKind([1, 2])).toBe('int')
    expect(inferKind([1, 2.5])).toBe('float')
    expect(inferKind(['a', 'b'])).toBe('str')
    expect(inferKind(['a', 1])).toBe(null)
  })

  it('derives operators, input mode and placeholder from the part', () => {
    const part: FactFilterPart = {
      operator: 'gt',
      type: 'int',
      value: '',
      kind: 'int',
      values: [
        { label: '2 (4)', value: '2' },
        { label: '16 (1)', value: '16' }
      ]
    }
    expect(operatorsFor(part)).not.toContain('regex')
    expect(operatorsFor({ ...part, kind: 'bool' })).toEqual(['eq', 'ne'])
    expect(operatorsFor({ ...part, kind: null })).toContain('regex')
    expect(usesValueChoices(part)).toBe(false)
    expect(usesValueChoices({ ...part, operator: 'in' })).toBe(true)
    expect(valuePlaceholder(part)).toBe('2 … 16')
    expect(valuePlaceholder({ ...part, operator: 'regex' })).toBe('Regex')
    expect(valuePlaceholder({ ...part, operator: 'nin' })).toBe('a,b,c')
    expect(formatFactFilter('cpus', { ...part, value: '4' })).toBe(
      'cpus:gt:int:4'
    )
    expect(formatFactFilter('', part)).toBe(null)
  })

  it('refreshes a chain with each part narrowed by the ones before', async () => {
    const { loadFactNames, refreshChain } = useFactSuggestions(() => ({
      disabled: false
    }))
    await loadFactNames()
    const parts = [
      { ...newPart(), fact: 'os.family', value: 'RedHat' },
      { ...newPart(), fact: 'cpus', operator: 'regex' },
      { ...newPart(), fact: 'unknown' }
    ]

    await refreshChain(parts, (p) => p.fact)

    // regex is valid for strings, so the first part keeps it
    expect(parts[0].kind).toBe('str')
    expect(parts[0].operator).toBe('regex')
    expect(parts[1].kind).toBe('int')
    expect(parts[1].type).toBe('int')
    expect(parts[1].operator).toBe('eq')
    expect(parts[2].kind).toBe(null)
    expect(api.get).toHaveBeenCalledWith(
      '/api/v1/nodes/_distinct_fact_values',
      {
        disabled: false,
        fact_id: 'cpus',
        fact: ['os.family:regex:str:RedHat']
      },
      true
    )
    expect(api.get).not.toHaveBeenCalledWith(
      '/api/v1/nodes/_distinct_fact_values',
      expect.objectContaining({ fact_id: 'unknown' }),
      true
    )
  })

  it('searches fact names with context and caches requests', async () => {
    const { loadFactNames, searchFactNames } = useFactSuggestions()
    await loadFactNames()

    expect(await searchFactNames('OS')).toEqual(['os.family'])
    expect(await searchFactNames('', ['os.family:eq:str:RedHat'])).toEqual([
      'cpus'
    ])
    await searchFactNames('c', ['os.family:eq:str:RedHat'])

    const contextCalls = vi
      .mocked(api.get)
      .mock.calls.filter(
        ([url, params]) =>
          url === '/api/v1/nodes/_distinct_fact_names' && params
      )
    expect(contextCalls).toHaveLength(1)
  })
})
