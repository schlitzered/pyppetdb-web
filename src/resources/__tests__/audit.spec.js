import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { audit } from '../audit'
import { auditConfig } from '../audit'
import { dateTimeProcessor } from '../audit'
import { resources } from '../index'

describe('audit resources', () => {
  it('are registered as search-only pages in the Audit group', () => {
    expect(resources.audit).toBe(audit)
    expect(resources.auditConfig).toBe(auditConfig)
    for (const def of [audit, auditConfig]) {
      expect(def.searchOnly).toBe(true)
      expect(def.customSearchComponent).toBeTruthy()
      expect(def.nav.group).toBe('Audit')
    }
    expect(audit.nav.requiredPermission).toBe('AUDIT::GET')
    expect(audit.defaultSort).toEqual({ field: 'time', order: 'desc' })
  })

  it('config nav accepts GET or UPDATE', () => {
    const re = new RegExp(auditConfig.nav.requiredPermission)
    expect(re.test('AUDIT:CONFIG::GET')).toBe(true)
    expect(re.test('AUDIT:CONFIG::UPDATE')).toBe(true)
    expect(re.test('AUDIT::GET')).toBe(false)
  })

  it('round-trips dates through the URL as ISO 8601', () => {
    const date = new Date('2026-11-04T10:15:00.000Z')
    const url = dateTimeProcessor.toUrl(date)
    expect(url).toBe('2026-11-04T10:15:00.000Z')
    expect(dateTimeProcessor.fromUrl(url).getTime()).toBe(date.getTime())
    expect(dateTimeProcessor.fromUrl('garbage')).toBe('')
  })

  it('declares since/until as datetime filters', () => {
    const keys = audit.searchFilters
      .filter((f) => f.type === 'datetime')
      .map((f) => f.key)
    expect(keys).toEqual(['since', 'until'])
  })
})
