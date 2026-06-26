export interface CAValidationConfig {
  enforce_rfc1123: boolean
  allowed_extensions: string[]
  key_usages: string[]
  extended_key_usages: string[]
  san_validation: any
  san_injection: any
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
