import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { getNestedValue } from '../useResourceListQueryUtils'
import { setNestedValue } from '../useResourceListQueryUtils'
import { applyDataTransformers } from '../useResourceListQueryUtils'
import { createSearchForm } from '../useResourceListQueryUtils'
import { initializeFormFromUrl } from '../useResourceListQueryUtils'
import { buildSearchParams } from '../useResourceListQueryUtils'
import { areArraysEqual } from '../useResourceListQueryUtils'

describe('useResourceListQueryUtils', () => {
  it('getNestedValue retrieves simple path', () => {
    const obj = { foo: 'bar' }
    const result = getNestedValue({
      obj,
      path: 'foo'
    })
    expect(result).toBe('bar')
  })

  it('getNestedValue retrieves nested path', () => {
    const obj = { foo: { bar: 'baz' } }
    const result = getNestedValue({
      obj,
      path: 'foo.bar'
    })
    expect(result).toBe('baz')
  })

  it('getNestedValue returns undefined for missing path', () => {
    const obj = { foo: 'bar' }
    const result = getNestedValue({
      obj,
      path: 'missing.path'
    })
    expect(result).toBeUndefined()
  })

  it('setNestedValue sets simple path', () => {
    const obj = {}
    setNestedValue({
      obj,
      path: 'foo',
      value: 'bar'
    })
    expect(obj).toEqual({ foo: 'bar' })
  })

  it('setNestedValue sets nested path', () => {
    const obj = {}
    setNestedValue({
      obj,
      path: 'foo.bar',
      value: 'baz'
    })
    expect(obj).toEqual({ foo: { bar: 'baz' } })
  })

  it('applyDataTransformers returns items unchanged when no transformers', () => {
    const items = [{ foo: 'bar' }]
    const result = applyDataTransformers({
      items,
      transformers: {}
    })
    expect(result).toEqual([{ foo: 'bar' }])
  })

  it('applyDataTransformers applies transformer to field', () => {
    const items = [{ foo: 'bar' }]
    const transformers = {
      foo: (val: any) => val.toUpperCase()
    }
    const result = applyDataTransformers({
      items,
      transformers
    })
    expect(result).toEqual([{ foo: 'BAR' }])
  })

  it('createSearchForm initializes form fields based on type', () => {
    const schema = [
      { key: 'tags', type: 'array' },
      { key: 'name', type: 'string', default: 'foo' }
    ]
    const form = createSearchForm(schema)
    expect(form).toEqual({
      tags: [],
      name: 'foo'
    })
  })

  it('initializeFormFromUrl populates fields from query', () => {
    const schema = [
      { key: 'tags', type: 'array' },
      { key: 'name', type: 'string' }
    ]
    const form = { tags: [], name: '' }
    const query = { tags: 'a', name: 'bar' }
    initializeFormFromUrl({
      form,
      schema,
      query
    })
    expect(form).toEqual({
      tags: ['a'],
      name: 'bar'
    })
  })

  it('initializeFormFromUrl uses processor fromUrl when present', () => {
    const schema = [
      {
        key: 'name',
        type: 'string',
        processor: {
          toUrl: (val: any) => val,
          fromUrl: (val: string) => val.toUpperCase()
        }
      }
    ]
    const form = { name: '' }
    const query = { name: 'foo' }
    initializeFormFromUrl({
      form,
      schema,
      query
    })
    expect(form).toEqual({
      name: 'FOO'
    })
  })

  it('buildSearchParams creates SearchByItem array', () => {
    const schema = [
      { key: 'tags', type: 'array' },
      { key: 'name', type: 'string' }
    ]
    const form = { tags: ['a'], name: '' }
    const result = buildSearchParams({
      form,
      schema
    })
    expect(result).toEqual([{ key: 'tags', value: ['a'] }])
  })

  it('buildSearchParams uses processor toUrl when present', () => {
    const schema = [
      {
        key: 'name',
        type: 'string',
        processor: {
          toUrl: (val: any) => val.toUpperCase(),
          fromUrl: (val: string) => val
        }
      }
    ]
    const form = { name: 'foo' }
    const result = buildSearchParams({
      form,
      schema
    })
    expect(result).toEqual([{ key: 'name', value: 'FOO' }])
  })

  it('areArraysEqual compares sortBy lists correctly', () => {
    const arr1 = [{ key: 'foo', order: 'asc' as const }]
    const arr2 = [{ key: 'foo', order: 'asc' as const }]
    const arr3 = [{ key: 'foo', order: 'desc' as const }]
    const arr4 = [{ key: 'bar', order: 'asc' as const }]

    expect(areArraysEqual({ arr1, arr2 })).toBe(true)

    expect(areArraysEqual({ arr1, arr2: arr3 })).toBe(false)

    expect(areArraysEqual({ arr1, arr2: arr4 })).toBe(false)
  })
})
