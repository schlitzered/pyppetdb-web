const routeCASpacesSearch = {
  path: '/ca/spaces',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    appBar: {
      name: 'CA Spaces',
      to: 'CASpacesSearch',
      href: '/ca/spaces',
      requireAdmin: true,
      icon: 'mdi-folder-key',
      group: 'CA',
      groupOrder: 4,
      order: 2
    },
    breadCrumb: [
      {
        title: 'Pyppetdb',
        to: { name: 'Home' }
      },
      {
        title: 'CA Spaces',
        to: { name: 'CASpacesSearch' }
      }
    ],
    toolBar() {
      return {
        title: 'CA Spaces',
        items: [
          {
            title: 'New Space',
            to: { name: 'CASpacesCRUD', params: { space_id: '_new' } },
            hide() {
              return false
            }
          }
        ]
      }
    }
  },
  children: [
    {
      path: '',
      name: 'CASpacesSearch',
      component: () => import('@/views/ViewCASpacesSearch.vue')
    }
  ]
}

const routeCASpacesCRUD = {
  path: '/ca/spaces/:space_id',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    breadCrumb(route) {
      return [
        {
          title: 'Pyppetdb',
          to: { name: 'Home' }
        },
        {
          title: 'CA Spaces',
          to: { name: 'CASpacesSearch' }
        },
        {
          title: route.params.space_id
        }
      ]
    },
    toolBar(route) {
      const items = []
      if (route.params.space_id !== '_new') {
        items.push({
          title: 'Certificates',
          to: {
            name: 'CASpacesCertsSearch',
            params: { space_id: route.params.space_id }
          },
          hide() {
            return false
          }
        })
      }
      return {
        title: `CA Space ${route.params.space_id}`,
        items: items
      }
    }
  },
  children: [
    {
      path: '',
      name: 'CASpacesCRUD',
      component: () => import('@/views/ViewCASpacesCRUD.vue')
    }
  ]
}

const routesCASpaces = [routeCASpacesSearch, routeCASpacesCRUD]

export default routesCASpaces
