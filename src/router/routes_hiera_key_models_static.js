const routeHieraKeyModelsStaticSearch = {
  path: '/hiera/key_models/static',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    appBar: {
      name: 'Key Models Static',
      to: 'HieraKeyModelsStaticSearch',
      href: '/hiera/key_models/static',
      requireAdmin: false,
      icon: 'mdi-key-variant',
      group: 'Hiera',
      groupOrder: 2,
      order: 1
    },
    breadCrumb: [
      {
        title: 'Pyppetdb',
        to: { name: 'Home' }
      },
      {
        title: 'Hiera Key Models Static',
        to: { name: 'HieraKeyModelsStaticSearch' }
      }
    ],
    toolBar() {
      return {
        title: `Hiera Key Models Static`,
        items: []
      }
    }
  },
  children: [
    {
      path: '',
      name: 'HieraKeyModelsStaticSearch',
      component: () => import('@/views/ViewHieraKeyModelsStaticSearch.vue')
    }
  ]
}

const routeHieraKeyModelsStaticCRUD = {
  path: '/hiera/key_models/static/:key_model_id',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    breadCrumb(route) {
      return [
        {
          title: 'Pyppetdb',
          to: { name: 'Home' }
        },
        {
          title: 'Hiera Key Models Static',
          to: { name: 'HieraKeyModelsStaticSearch' }
        },
        {
          title: route.params.key_model_id
        }
      ]
    },
    toolBar(route) {
      return {
        title: `Key Model ${route.params.key_model_id}`,
        items: []
      }
    }
  },
  children: [
    {
      path: '',
      name: 'HieraKeyModelsStaticCRUD',
      component: () => import('@/views/ViewHieraKeyModelsStaticCRUD.vue')
    }
  ]
}

const routesHieraKeyModelsStatic = [
  routeHieraKeyModelsStaticSearch,
  routeHieraKeyModelsStaticCRUD
]

export default routesHieraKeyModelsStatic
