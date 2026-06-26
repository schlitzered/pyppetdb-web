export interface CAAuthority {
  id: string
  type: string
  status: string
  parent_id: string | null
  certificate: string
  private_key: string
  external_chain: string[]
  issuer: string
  serial_number: string
  not_before: string
  not_after: string
  revocation_date: string | null
  validation_config: ValidationConfig
  crl_generation: string
  crl_updated_at: string
  crl_next_update: string
}

export interface CASpace {
  id: string
  ca_id: string
  validation_config: ValidationConfig
  ca_history: string[]
}

export interface CACertificate {
  id: string
  cn: string
  status: string
  serial_number: string
  not_before: string
  not_after: string
  revocation_date: string | null
  san: string[]
}

export interface ValidationConfig {
  enforce_rfc1123: boolean
  allowed_extensions: string[]
  key_usages: string[]
  extended_key_usages: string[]
  san_validation: SANValidation | null
  san_injection: SANInjection | null
}

export interface SANValidation {
  max_san_count: number
  regex_list: string[]
  http_checks: HTTPCheck[]
  script_checks: ScriptCheck[]
}

export interface SANInjection {
  entries: SANInjectionEntry[]
}

export interface SANInjectionEntry {
  pattern: string
  templates: string[]
}

export interface HTTPCheck {
  method: string
  url: string
  headers: Record<string, string>
  basic_auth_user: string
  basic_auth_password: string
  body_template: string
  ssl_cert: string
  ssl_key: string
  tls_ca: string
  timeout: number
}

export interface ScriptCheck {
  script_path: string
  timeout: number
}
