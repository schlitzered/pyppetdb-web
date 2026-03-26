const routeCAAuthoritiesSearch = {
  path: '/ca/authorities',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    appBar: {
      name: 'CA Authorities',
      to: 'CAAuthoritiesSearch',
      href: '/ca/authorities',
      requireAdmin: true,
      icon: 'mdi-shield-check',
      group: 'CA',
      groupOrder: 4,
      order: 1
    },
    breadCrumb: [
      {
        title: 'Pyppetdb',
        to: { name: 'Home' }
      },
      {
        title: 'CA Authorities',
        to: { name: 'CAAuthoritiesSearch' }
      }
    ],
    toolBar() {
      return {
        title: 'CA Authorities',
        items: [
          {
            title: 'New Authority',
            to: { name: 'CAAuthoritiesCRUD', params: { ca_id: '_new' } },
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
      name: 'CAAuthoritiesSearch',
      component: () => import('@/views/ViewCAAuthoritiesSearch.vue')
    }
  ]
}

const routeCAAuthoritiesCRUD = {
  path: '/ca/authorities/:ca_id',
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
          title: route.params.ca_id
        }
      ]
    },
    toolBar(route) {
      const items = []
      if (route.params.ca_id !== '_new') {
        items.push({
          title: 'Certificates',
          to: {
            name: 'CAAuthoritiesCertsSearch',
            params: { ca_id: route.params.ca_id }
          },
          hide() {
            return false
          }
        })
      }
      return {
        title: `CA Authority ${route.params.ca_id}`,
        items: items
      }
    }
  },
  children: [
    {
      path: '',
      name: 'CAAuthoritiesCRUD',
      component: () => import('@/views/ViewCAAuthoritiesCRUD.vue')
    }
  ]
}

const routesCAAuthorities = [routeCAAuthoritiesSearch, routeCAAuthoritiesCRUD]

export default routesCAAuthorities
