const routeHieraLevelDataSearch = {
  path: '/hiera/data',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    appBar: {
      name: 'Level Data',
      to: 'HieraLevelDataSearch',
      href: '/hiera/data',
      requireAdmin: false,
      icon: 'mdi-database',
      group: 'Hiera',
      groupOrder: 2,
      order: 5
    },
    breadCrumb: [
      {
        title: 'Pyppetdb',
        to: { name: 'Home' }
      },
      {
        title: 'Hiera Level Data',
        to: { name: 'HieraLevelDataSearch' }
      }
    ],
    toolBar() {
      return {
        title: `Hiera Level Data`,
        items: [
          {
            title: 'New Level Data',
            to: {
              name: 'HieraLevelDataCRUD',
              params: { level_id: '_new', data_id: '_new', key_id: '_new' }
            },
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
      name: 'HieraLevelDataSearch',
      component: () => import('@/views/ViewHieraLevelDataSearch.vue')
    }
  ]
}

const routeHieraLevelDataCRUD = {
  path: '/hiera/data/:level_id/:data_id/:key_id',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    breadCrumb(route) {
      return [
        {
          title: 'Pyppetdb',
          to: { name: 'Home' }
        },
        {
          title: 'Hiera Level Data',
          to: { name: 'HieraLevelDataSearch' }
        },
        {
          title: `${route.params.level_id}/${route.params.data_id}/${route.params.key_id}`
        }
      ]
    },
    toolBar(route) {
      return {
        title: `Level Data ${route.params.level_id}/${route.params.data_id}/${route.params.key_id}`,
        items: []
      }
    }
  },
  children: [
    {
      path: '',
      name: 'HieraLevelDataCRUD',
      component: () => import('@/views/ViewHieraLevelDataCRUD.vue')
    }
  ]
}

const routesHieraLevelData = [
  routeHieraLevelDataSearch,
  routeHieraLevelDataCRUD
]

export default routesHieraLevelData
