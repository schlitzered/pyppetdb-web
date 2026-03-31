const routeCAAuthoritiesCertsSearch = {
  path: '/ca/authorities/:ca_id/certs',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    breadCrumb(route) {
      return [
        {
          title: 'Pyppetdb',
          to: { name: 'Home' }
        },
        {
          title: 'CA Authorities',
          to: { name: 'CAAuthoritiesSearch' }
        },
        {
          title: route.params.ca_id,
          to: {
            name: 'CAAuthoritiesCRUD',
            params: { ca_id: route.params.ca_id }
          }
        },
        {
          title: 'Certificates'
        }
      ]
    },
    toolBar(route) {
      return {
        title: `CA Authority ${route.params.ca_id} - Certificates`,
        items: []
      }
    }
  },
  children: [
    {
      path: '',
      name: 'CAAuthoritiesCertsSearch',
      component: () => import('@/views/ViewCAAuthoritiesCertsSearch.vue')
    }
  ]
}

const routeCAAuthoritiesCertsCRUD = {
  path: '/ca/authorities/:ca_id/certs/:cert_id',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    breadCrumb(route) {
      return [
        {
          title: 'Pyppetdb',
          to: { name: 'Home' }
        },
        {
          title: 'CA Authorities',
          to: { name: 'CAAuthoritiesSearch' }
        },
        {
          title: route.params.ca_id,
          to: {
            name: 'CAAuthoritiesCRUD',
            params: { ca_id: route.params.ca_id }
          }
        },
        {
          title: 'Certificates',
          to: {
            name: 'CAAuthoritiesCertsSearch',
            params: { ca_id: route.params.ca_id }
          }
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
      name: 'CAAuthoritiesCertsCRUD',
      component: () => import('@/views/ViewCAAuthoritiesCertsCRUD.vue')
    }
  ]
}

const routesCAAuthoritiesCerts = [
  routeCAAuthoritiesCertsSearch,
  routeCAAuthoritiesCertsCRUD
]

export default routesCAAuthoritiesCerts
