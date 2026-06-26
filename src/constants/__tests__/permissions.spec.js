import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { PERMISSIONS } from '../permissions'
import { ALL_PERMISSIONS } from '../permissions'

describe(
  'permissions',
  () => {
    it(
      'has correct dynamic values',
      () => {
        expect(
          PERMISSIONS.CA.SPACES.CERTS.CREATE('myspace')
        ).toBe('CA:SPACES:myspace:CERTS:CREATE')

        expect(
          PERMISSIONS.CA.SPACES.CERTS.READ('myspace')
        ).toBe('CA:SPACES:myspace:CERTS:READ')

        expect(
          PERMISSIONS.CA.SPACES.CERTS.UPDATE('myspace')
        ).toBe('CA:SPACES:myspace:CERTS:UPDATE')

        expect(
          PERMISSIONS.CA.SPACES.CERTS.DELETE('myspace')
        ).toBe('CA:SPACES:myspace:CERTS:DELETE')

        expect(
          PERMISSIONS.CA.AUTHORITIES.CERTS.CREATE('myca')
        ).toBe('CA:AUTHORITIES:myca:CERTS:CREATE')

        expect(
          PERMISSIONS.CA.AUTHORITIES.CERTS.READ('myca')
        ).toBe('CA:AUTHORITIES:myca:CERTS:READ')

        expect(
          PERMISSIONS.CA.AUTHORITIES.CERTS.UPDATE('myca')
        ).toBe('CA:AUTHORITIES:myca:CERTS:UPDATE')

        expect(
          PERMISSIONS.CA.AUTHORITIES.CERTS.DELETE('myca')
        ).toBe('CA:AUTHORITIES:myca:CERTS:DELETE')

        expect(
          PERMISSIONS.JOBS.JOB.CREATE_SPECIFIC('mydef')
        ).toBe('JOBS:JOB:mydef:CREATE')

        expect(
          PERMISSIONS.HIERA.LEVEL_DATA.CREATE_SPECIFIC('mykey')
        ).toBe('HIERA:LEVEL_DATA:mykey:CREATE')

        expect(
          PERMISSIONS.HIERA.LEVEL_DATA.READ_SPECIFIC('mykey')
        ).toBe('HIERA:LEVEL_DATA:mykey:READ')

        expect(
          PERMISSIONS.HIERA.LEVEL_DATA.UPDATE_SPECIFIC('mykey')
        ).toBe('HIERA:LEVEL_DATA:mykey:UPDATE')

        expect(
          PERMISSIONS.HIERA.LEVEL_DATA.DELETE_SPECIFIC('mykey')
        ).toBe('HIERA:LEVEL_DATA:mykey:DELETE')
      }
    )

    it(
      'defines all permissions list',
      () => {
        expect(
          Array.isArray(ALL_PERMISSIONS)
        ).toBe(true)
      }
    )
  }
)
