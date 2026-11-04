import type { RouteLocationRaw } from 'vue-router'

export interface AuditEvent {
  id: string
  time?: string | null
  event?: string | null
  module?: string | null
  transaction?: string | null
  actor?: { kind: string; id?: string | null; via?: string | null } | null
  object?: { kind: string; id?: string | null } | null
  details?: Record<string, unknown> | null
  request?: Record<string, unknown> | null
  sealed?: boolean
  seq?: number | null
}

export const AUDIT_MODULES = [
  'core',
  'nodes',
  'ca',
  'jobs',
  'puppet',
  'puppetserver'
]

export const AUDIT_ACTOR_KINDS = ['user', 'node', 'system', 'anonymous']

export const AUDIT_OBJECT_KINDS = [
  'user',
  'credential',
  'team',
  'instance',
  'audit_config',
  'node',
  'node_group',
  'ca_authority',
  'ca_space',
  'ca_secret',
  'ca_certificate',
  'ca_compromised_key',
  'job',
  'job_definition'
]

// object kind -> [route name, route param]
const OBJECT_ROUTES: Record<string, [string, string]> = {
  user: ['UsersCRUD', 'user'],
  team: ['TeamsCRUD', 'team'],
  instance: ['InstancesCRUD', 'instance_id'],
  node: ['NodesCRUD', 'node'],
  node_group: ['NodesGroupsCRUD', 'node_group'],
  ca_authority: ['CAAuthoritiesCRUD', 'ca_id'],
  ca_space: ['CASpacesCRUD', 'space_id'],
  ca_secret: ['CASecretsCRUD', 'secret_id'],
  job: ['JobsCRUD', 'job_id'],
  job_definition: ['JobsDefinitionsCRUD', 'definition_id']
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// UI page of the event's object, or null when there is none (or it is gone)
export function auditObjectRoute(item: AuditEvent): RouteLocationRaw | null {
  const obj = item.object
  if (!obj?.id) return null
  if (/\.(deleted|purged)$/.test(item.event || '')) return null
  if (obj.kind === 'ca_certificate') {
    // certificates live below their space; the id is the serial number
    const spaceId = item.details?.space_id
    if (!spaceId) return null
    return {
      name: 'CASpacesCertsCRUD',
      params: { space_id: String(spaceId), cert_id: obj.id }
    }
  }
  const target = OBJECT_ROUTES[obj.kind]
  if (!target) return null
  return { name: target[0], params: { [target[1]]: obj.id } }
}
