import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { resources } from '@/resources'
import HomeView from '../HomeView.vue'
import ResourceTable from '@/components/generic/ResourceTable.vue'

vi.mock(
  '@/components/generic/ResourceTable.vue',
  () => {
    return {
      default: {
        name: 'ResourceTable',
        props: [
          'resourceDef'
        ],
        template: '<div class="mock-resource-table">Mock Resource Table</div>'
      }
    }
  }
)

describe(
  'HomeView',
  () => {
    it(
      'renders ResourceTable with nodes definition',
      () => {
        const wrapper = mount(
          HomeView,
          {
            global: {
              stubs: {
                ResourceTable: true
              }
            }
          }
        )

        const table = wrapper.findComponent(
          ResourceTable
        )

        expect(
          table.exists()
        ).toBe(true)

        expect(
          table.props('resourceDef')
        ).toEqual(
          resources.nodes
        )
      }
    )
  }
)
