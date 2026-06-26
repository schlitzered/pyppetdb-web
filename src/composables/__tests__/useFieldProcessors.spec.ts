import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { factFieldProcessor } from '../useFieldProcessors'
import { commaSeparatedProcessor } from '../useFieldProcessors'
import { booleanProcessor } from '../useFieldProcessors'

describe('factFieldProcessor', () => {
  it('fromUrl with string parses into FactValue correctly', () => {
    const result = factFieldProcessor.fromUrl('os:eq:string:linux')
    expect(result).toEqual([
      { fact_name: 'os', operator: 'eq', type: 'string', value: 'linux' }
    ])
  })

  it('fromUrl with array of strings parses each one', () => {
    const result = factFieldProcessor.fromUrl([
      'os:eq:string:linux',
      'arch:eq:string:amd64'
    ])
    expect(result).toEqual([
      { fact_name: 'os', operator: 'eq', type: 'string', value: 'linux' },
      { fact_name: 'arch', operator: 'eq', type: 'string', value: 'amd64' }
    ])
  })

  it('fromUrl with missing parts defaults to empty strings', () => {
    const result = factFieldProcessor.fromUrl('os:eq')
    expect(result).toEqual([
      { fact_name: 'os', operator: 'eq', type: '', value: '' }
    ])
  })

  it('toUrl with valid FactValue array produces strings', () => {
    const result = factFieldProcessor.toUrl([
      { fact_name: 'os', operator: 'eq', type: 'string', value: 'linux' }
    ])
    expect(result).toEqual(['os:eq:string:linux'])
  })

  it('toUrl with empty/incomplete FactValues returns undefined', () => {
    const result = factFieldProcessor.toUrl([
      { fact_name: 'os', operator: 'eq', type: '', value: '' }
    ])
    expect(result).toBeUndefined()
  })
})

describe('commaSeparatedProcessor', () => {
  it('fromUrl with string splits on comma', () => {
    expect(commaSeparatedProcessor.fromUrl('a,b,c')).toEqual(['a', 'b', 'c'])
  })

  it('fromUrl with array returns as-is', () => {
    expect(commaSeparatedProcessor.fromUrl(['a', 'b'])).toEqual(['a', 'b'])
  })

  it('toUrl with array joins with comma', () => {
    expect(commaSeparatedProcessor.toUrl(['a', 'b'])).toBe('a,b')
  })

  it('toUrl with string returns as-is', () => {
    expect(commaSeparatedProcessor.toUrl('a,b')).toBe('a,b')
  })
})

describe('booleanProcessor', () => {
  it('fromUrl returns true for "true"', () => {
    expect(booleanProcessor.fromUrl('true')).toBe(true)
  })

  it('fromUrl returns false for anything else', () => {
    expect(booleanProcessor.fromUrl('false')).toBe(false)
    expect(booleanProcessor.fromUrl('something')).toBe(false)
  })

  it('toUrl returns "true" for true', () => {
    expect(booleanProcessor.toUrl(true)).toBe('true')
  })

  it('toUrl returns "false" for false', () => {
    expect(booleanProcessor.toUrl(false)).toBe('false')
  })
})
