const routeHieraLevelsSearch = {
  path: '/hiera/levels',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    appBar: {
      name: 'Levels',
      to: 'HieraLevelsSearch',
      href: '/hiera/levels',
      requireAdmin: false,
      icon: 'mdi-layers',
      group: 'Hiera',
      groupOrder: 2,
      order: 4
    },
    breadCrumb: [
      {
        title: 'Pyppetdb',
        to: { name: 'Home' }
      },
      {
        title: 'Hiera Levels',
        to: { name: 'HieraLevelsSearch' }
      }
    ],
    toolBar() {
      return {
        title: `Hiera Levels`,
        items: [
          {
            title: 'New Level',
            to: { name: 'HieraLevelsCRUD', params: { level_id: '_new' } },
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
      name: 'HieraLevelsSearch',
      component: () => import('@/views/ViewHieraLevelsSearch.vue')
    }
  ]
}

const routeHieraLevelsCRUD = {
  path: '/hiera/levels/:level_id',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    breadCrumb(route) {
      return [
        {
          title: 'Pyppetdb',
          to: { name: 'Home' }
        },
        {
          title: 'Hiera Levels',
          to: { name: 'HieraLevelsSearch' }
        },
        {
          title: route.params.level_id
        }
      ]
    },
    toolBar(route) {
      return {
        title: `Hiera Level ${route.params.level_id}`,
        items: []
      }
    }
  },
  children: [
    {
      path: '',
      name: 'HieraLevelsCRUD',
      component: () => import('@/views/ViewHieraLevelsCRUD.vue')
    }
  ]
}

const routesHieraLevels = [routeHieraLevelsSearch, routeHieraLevelsCRUD]

export default routesHieraLevels
