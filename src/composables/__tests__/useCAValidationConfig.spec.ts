import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { useCAValidationConfig } from '../useCAValidationConfig'
import { validationConfigErrors } from '../useCAValidationConfig'

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

  describe('validationConfigErrors', () => {
    const err = (status: number, detail: unknown) => ({
      response: { status, data: { detail } }
    })

    it('maps pydantic loc paths below validation_config to field keys', () => {
      expect(
        validationConfigErrors(
          err(422, [
            {
              loc: ['body', 'validation_config', 'renewal', 'window_days'],
              msg: 'too small'
            },
            {
              loc: ['body', 'validation_config', 'denied_extensions', 0],
              msg: 'bad oid'
            },
            {
              loc: ['body', 'validation_config', 'denied_extensions', 2],
              msg: 'bad oid 2'
            },
            { loc: ['body', 'description'], msg: 'ignored' }
          ])
        )
      ).toEqual({
        'renewal.window_days': 'too small',
        denied_extensions: 'bad oid; bad oid 2'
      })
    })

    it('maps service string details to the leading field name', () => {
      expect(
        validationConfigErrors(
          err(
            422,
            'Invalid validation_config: certificate_validity_days 400 exceeds the 365 days of the authority'
          )
        )
      ).toEqual({
        certificate_validity_days:
          'certificate_validity_days 400 exceeds the 365 days of the authority'
      })
      expect(
        validationConfigErrors(err(422, 'Invalid validation_config: Oops'))
      ).toEqual({ '': 'Oops' })
    })

    it('returns nothing for non-422 or unrelated errors', () => {
      expect(validationConfigErrors(err(500, 'boom'))).toEqual({})
      expect(validationConfigErrors(err(422, 'other problem'))).toEqual({})
      expect(validationConfigErrors(new Error('x'))).toEqual({})
      expect(validationConfigErrors(null)).toEqual({})
    })
  })
})
