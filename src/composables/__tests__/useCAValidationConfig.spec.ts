import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { useCAValidationConfig } from '../useCAValidationConfig'

describe('useCAValidationConfig', () => {
  it('getDefaultValidationConfig returns correct defaults', () => {
    const { getDefaultValidationConfig } = useCAValidationConfig()
    const config = getDefaultValidationConfig()
    expect(config).toEqual({
      enforce_rfc1123: true,
      allowed_extensions: [],
      key_usages: ['digital_signature', 'key_encipherment'],
      extended_key_usages: ['SERVER_AUTH', 'CLIENT_AUTH'],
      san_validation: null,
      san_injection: null
    })
  })

  it('ensureValidationConfig adds config when missing', () => {
    const { ensureValidationConfig } = useCAValidationConfig()
    const { getDefaultValidationConfig } = useCAValidationConfig()
    const formData: any = {}
    ensureValidationConfig(formData)
    expect(formData.validation_config).toEqual(getDefaultValidationConfig())
  })

  it('ensureValidationConfig does not overwrite existing config', () => {
    const { ensureValidationConfig } = useCAValidationConfig()
    const formData: any = {
      validation_config: { enforce_rfc1123: false }
    }
    ensureValidationConfig(formData)
    expect(formData.validation_config).toEqual({ enforce_rfc1123: false })
  })

  it('ensureValidationConfig handles null/undefined gracefully', () => {
    const { ensureValidationConfig } = useCAValidationConfig()
    expect(() => ensureValidationConfig(null)).not.toThrow()
    expect(() => ensureValidationConfig(undefined)).not.toThrow()
  })
})
