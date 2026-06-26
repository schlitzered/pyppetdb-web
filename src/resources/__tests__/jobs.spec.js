import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { vi } from 'vitest'
import { jobDefinitions } from '../jobs'
import { jobs } from '../jobs'
import { jobNodeRuns } from '../jobs'

describe(
  'jobs resources',
  () => {
    it(
      'jobDefinitions logic',
      () => {
        const route = {
          params: {
            definition_id: 'def1'
          }
        }
        expect(
          jobDefinitions.breadcrumbs.crud(route).length
        ).toBe(4)

        expect(
          jobDefinitions.toolbar.crud.title(route)
        ).toBe('Job Definition def1')

        const hasPerm = vi.fn().mockReturnValue(true)
        expect(
          jobDefinitions.permissions.create(hasPerm)
        ).toBe(true)
        expect(
          jobDefinitions.permissions.edit(hasPerm)
        ).toBe(true)
        expect(
          jobDefinitions.permissions.delete(hasPerm)
        ).toBe(true)
      }
    )

    it(
      'jobs logic',
      () => {
        const route = {
          params: {
            job_id: 'job1'
          }
        }
        expect(
          jobs.breadcrumbs.crud(route).length
        ).toBe(4)

        expect(
          jobs.toolbar.crud.title(route)
        ).toBe('Job job1')

        const formatter = jobs.tableColumns[2].formatter
        expect(
          formatter(null)
        ).toBe('')
        expect(
          formatter('2026-06-26T12:00:00Z')
        ).toContain('2026')

        const hasPerm = vi.fn().mockReturnValue(true)
        expect(
          jobs.permissions.create(hasPerm)
        ).toBe(true)
        expect(
          jobs.permissions.edit()
        ).toBe(false)
        expect(
          jobs.permissions.delete()
        ).toBe(false)
      }
    )

    it(
      'jobNodeRuns logic',
      () => {
        const route = {
          params: {
            node_job_id: 'run1'
          }
        }
        expect(
          jobNodeRuns.breadcrumbs.crud(route).length
        ).toBe(4)

        expect(
          jobNodeRuns.toolbar.crud.title(route)
        ).toBe('Node Job Run run1')
      }
    )
  }
)
