const routeHieraKeyModelsDynamicSearch = {
  path: '/hiera/key_models/dynamic',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    appBar: {
      name: 'Key Models Dynamic',
      to: 'HieraKeyModelsDynamicSearch',
      href: '/hiera/key_models/dynamic',
      requireAdmin: false,
      icon: 'mdi-key-plus',
      group: 'Hiera',
      groupOrder: 2,
      order: 2
    },
    breadCrumb: [
      {
        title: 'Pyppetdb',
        to: { name: 'Home' }
      },
      {
        title: 'Hiera Key Models Dynamic',
        to: { name: 'HieraKeyModelsDynamicSearch' }
      }
    ],
    toolBar() {
      return {
        title: `Hiera Key Models Dynamic`,
        items: [
          {
            title: 'New Key Model',
            to: {
              name: 'HieraKeyModelsDynamicCRUD',
              params: { key_model_id: '_new' }
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
      name: 'HieraKeyModelsDynamicSearch',
      component: () => import('@/views/ViewHieraKeyModelsDynamicSearch.vue')
    }
  ]
}

const routeHieraKeyModelsDynamicCRUD = {
  path: '/hiera/key_models/dynamic/:key_model_id',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    breadCrumb(route) {
      return [
        {
          title: 'Pyppetdb',
          to: { name: 'Home' }
        },
        {
          title: 'Hiera Key Models Dynamic',
          to: { name: 'HieraKeyModelsDynamicSearch' }
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
      name: 'HieraKeyModelsDynamicCRUD',
      component: () => import('@/views/ViewHieraKeyModelsDynamicCRUD.vue')
    }
  ]
}

const routesHieraKeyModelsDynamic = [
  routeHieraKeyModelsDynamicSearch,
  routeHieraKeyModelsDynamicCRUD
]

export default routesHieraKeyModelsDynamic
