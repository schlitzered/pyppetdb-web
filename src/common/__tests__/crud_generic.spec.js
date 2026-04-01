import { describe, it, expect, vi } from 'vitest'
import { useCrudReload } from '../crud_generic'

describe('useCrudReload', () => {
  it('calls the fetch function when reload is called', () => {
    const fetchFn = vi.fn()
    const { reload } = useCrudReload(fetchFn)
    
    reload()
    expect(fetchFn).toHaveBeenCalledTimes(1)
  })
})
