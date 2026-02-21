const routeHieraKeysSearch = {
  path: '/hiera/keys',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    appBar: {
      name: 'Keys',
      to: 'HieraKeysSearch',
      href: '/hiera/keys',
      requireAdmin: false,
      icon: 'mdi-key',
      group: 'Hiera',
      groupOrder: 2,
      order: 3
    },
    breadCrumb: [
      {
        title: 'Pyppetdb',
        to: { name: 'Home' }
      },
      {
        title: 'Hiera Keys',
        to: { name: 'HieraKeysSearch' }
      }
    ],
    toolBar() {
      return {
        title: `Hiera Keys`,
        items: [
          {
            title: 'New Key',
            to: { name: 'HieraKeysCRUD', params: { key_id: '_new' } },
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
      name: 'HieraKeysSearch',
      component: () => import('@/views/ViewHieraKeysSearch.vue')
    }
  ]
}

const routeHieraKeysCRUD = {
  path: '/hiera/keys/:key_id',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    breadCrumb(route) {
      return [
        {
          title: 'Pyppetdb',
          to: { name: 'Home' }
        },
        {
          title: 'Hiera Keys',
          to: { name: 'HieraKeysSearch' }
        },
        {
          title: route.params.key_id
        }
      ]
    },
    toolBar(route) {
      return {
        title: `Hiera Key ${route.params.key_id}`,
        items: []
      }
    }
  },
  children: [
    {
      path: '',
      name: 'HieraKeysCRUD',
      component: () => import('@/views/ViewHieraKeysCRUD.vue')
    }
  ]
}

const routesHieraKeys = [routeHieraKeysSearch, routeHieraKeysCRUD]

export default routesHieraKeys
