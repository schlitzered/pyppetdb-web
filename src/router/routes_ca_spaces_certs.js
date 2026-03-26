const routeCASpacesCertsSearch = {
  path: '/ca/spaces/:space_id/certs',
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
          title: route.params.space_id,
          to: { name: 'CASpacesCRUD', params: { space_id: route.params.space_id } }
        },
        {
          title: 'Certificates'
        }
      ]
    },
    toolBar(route) {
      return {
        title: `CA Space ${route.params.space_id} - Certificates`,
        items: []
      }
    }
  },
  children: [
    {
      path: '',
      name: 'CASpacesCertsSearch',
      component: () => import('@/views/ViewCASpacesCertsSearch.vue')
    }
  ]
}

const routeCASpacesCertsCRUD = {
  path: '/ca/spaces/:space_id/certs/:cert_id',
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
          title: route.params.space_id,
          to: { name: 'CASpacesCRUD', params: { space_id: route.params.space_id } }
        },
        {
          title: 'Certificates',
          to: { name: 'CASpacesCertsSearch', params: { space_id: route.params.space_id } }
        },
        {
          title: route.params.cert_id
        }
      ]
    },
    toolBar(route) {
      return {
        title: `Certificate ${route.params.cert_id}`,
        items: []
      }
    }
  },
  children: [
    {
      path: '',
      name: 'CASpacesCertsCRUD',
      component: () => import('@/views/ViewCASpacesCertsCRUD.vue')
    }
  ]
}

const routesCASpacesCerts = [routeCASpacesCertsSearch, routeCASpacesCertsCRUD]

export default routesCASpacesCerts
