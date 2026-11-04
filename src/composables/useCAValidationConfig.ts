export interface CAValidationConfig {
  enforce_rfc1123: boolean
  allowed_extensions: string[]
  key_usages: string[]
  extended_key_usages: string[]
  san_validation: any
  san_injection: any
  denied_extensions?: string[] | null
  certificate_validity_days?: number | null
  key_policy?: {
    key_types: string[] | null
    rsa_min_key_size: number | null
    ec_curves: string[] | null
  } | null
  subject_attributes?: Record<string, string> | null
  renewal?: {
    grace_seconds: number | null
    window_days: number | null
  } | null
}

const SERVICE_ERROR_PREFIX = 'Invalid validation_config: '

// Map a 422 response to { 'renewal.window_days': msg, ... } keyed by the
// path below validation_config. Handles both FastAPI/Pydantic
// `detail: [{loc, msg}]` and the service's `detail: "Invalid validation_config:
// <field> ..."` string (key '' when no field can be derived).
export function validationConfigErrors(error: unknown): Record<string, string> {
  const response = (error as any)?.response
  const errors: Record<string, string> = {}
  if (response?.status !== 422) return errors
  const detail = response.data?.detail
  if (Array.isArray(detail)) {
    for (const item of detail) {
      const loc: unknown[] = item?.loc || []
      const idx = loc.indexOf('validation_config')
      if (idx < 0) continue
      const key = loc
        .slice(idx + 1)
        .filter((part) => typeof part === 'string')
        .join('.')
      errors[key] = errors[key] ? `${errors[key]}; ${item.msg}` : item.msg
    }
  } else if (
    typeof detail === 'string' &&
    detail.startsWith(SERVICE_ERROR_PREFIX)
  ) {
    const msg = detail.slice(SERVICE_ERROR_PREFIX.length)
    const field = msg.split(' ')[0]
    errors[/^[a-z_]+$/.test(field) ? field : ''] = msg
  }
  return errors
}

export function useCAValidationConfig() {
  const getDefaultValidationConfig = (): CAValidationConfig => {
    return {
      enforce_rfc1123: true,
      allowed_extensions: [],
      key_usages: ['digital_signature', 'key_encipherment'],
      extended_key_usages: ['SERVER_AUTH', 'CLIENT_AUTH'],
      san_validation: null,
      san_injection: null
    }
  }

  const ensureValidationConfig = (formData: any) => {
    if (formData && !formData.validation_config) {
      formData.validation_config = getDefaultValidationConfig()
    }
  }

  return {
    getDefaultValidationConfig,
    ensureValidationConfig
  }
}
