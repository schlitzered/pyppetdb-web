import type { FieldOption } from '@/types/resources'

export const CERT_STATUS_OPTIONS: FieldOption[] = [
  { label: 'Requested', value: 'requested' },
  { label: 'Signed', value: 'signed' },
  { label: 'Superseded', value: 'superseded' },
  { label: 'Revoked', value: 'revoked' },
  { label: 'Expired', value: 'expired' }
]

export const CERT_REVOCATION_REASONS: FieldOption[] = [
  { label: 'Unspecified', value: 'unspecified' },
  { label: 'Key Compromise', value: 'key_compromise' },
  { label: 'Affiliation Changed', value: 'affiliation_changed' },
  { label: 'Superseded', value: 'superseded' },
  { label: 'Cessation of Operation', value: 'cessation_of_operation' },
  { label: 'Privilege Withdrawn', value: 'privilege_withdrawn' }
]

export const AUTHORITY_REVOCATION_REASONS: FieldOption[] = [
  ...CERT_REVOCATION_REASONS.slice(0, 2),
  { label: 'CA Compromise', value: 'ca_compromise' },
  ...CERT_REVOCATION_REASONS.slice(2)
]

export const getCertStatusSeverity = (status: string) => {
  if (status === 'signed') {
    return 'success'
  }
  if (status === 'requested') {
    return 'warn'
  }
  if (status === 'revoked') {
    return 'danger'
  }
  if (status === 'superseded') {
    return 'info'
  }
  return 'secondary'
}
