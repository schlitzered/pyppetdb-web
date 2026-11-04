import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { escapeRegex } from '@/utils/audit'
import { auditObjectRoute } from '@/utils/audit'

describe('audit utils', () => {
  it('escapes regex metacharacters', () => {
    expect(escapeRegex('a.example.com')).toBe('a\\.example\\.com')
    expect(escapeRegex('x(1)+[y]')).toBe('x\\(1\\)\\+\\[y\\]')
  })

  it('links known object kinds', () => {
    expect(
      auditObjectRoute({
        id: '1',
        event: 'nodes.nodes.updated',
        object: { kind: 'node', id: 'n1' }
      })
    ).toEqual({ name: 'NodesCRUD', params: { node: 'n1' } })
    expect(
      auditObjectRoute({
        id: '1',
        event: 'jobs.jobs.created',
        object: { kind: 'job', id: 'j1' }
      })
    ).toEqual({ name: 'JobsCRUD', params: { job_id: 'j1' } })
  })

  it('links certificates through the space in details', () => {
    expect(
      auditObjectRoute({
        id: '1',
        event: 'ca.certificates.signed',
        object: { kind: 'ca_certificate', id: 'ab12' },
        details: { space_id: 's1' }
      })
    ).toEqual({
      name: 'CASpacesCertsCRUD',
      params: { space_id: 's1', cert_id: 'ab12' }
    })
    expect(
      auditObjectRoute({
        id: '1',
        object: { kind: 'ca_certificate', id: 'ab12' }
      })
    ).toBeNull()
  })

  it('returns null for missing, unknown or deleted objects', () => {
    expect(auditObjectRoute({ id: '1', object: null })).toBeNull()
    expect(
      auditObjectRoute({ id: '1', object: { kind: 'node', id: null } })
    ).toBeNull()
    expect(
      auditObjectRoute({ id: '1', object: { kind: 'credential', id: 'c' } })
    ).toBeNull()
    expect(
      auditObjectRoute({
        id: '1',
        event: 'nodes.nodes.deleted',
        object: { kind: 'node', id: 'n1' }
      })
    ).toBeNull()
  })
})
