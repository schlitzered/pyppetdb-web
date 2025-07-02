const routeUsersSearch = {
  path: '/users',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    appBar: {
      name: 'Users',
      to: 'UsersSearch',
      href: '/users',
      requireAdmin: true,
      icon: 'mdi-account-multiple'
    },
    breadCrumb: [
      {
        title: 'Pyppetdb',
        to: { name: 'Home' }
      },
      {
        title: 'Users',
        to: { name: 'UsersSearch' }
      }
    ],
    toolBar() {
      return {
        title: `Users`,
        items: [
          {
            title: 'New User',
            to: { name: 'UsersCRUD', params: { user: '_new' } },
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
      name: 'UsersSearch',
      component: () => import('@/views/ViewUsersSearch.vue')
    }
  ]
}

const routeUsersCrud = {
  path: '/users/:user',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    breadCrumb(route) {
      return [
        {
          title: 'Pyppetdb',
          to: { name: 'Home' }
        },
        {
          title: 'Users',
          to: { name: 'UsersSearch' }
        },
        {
          title: route.params.user
        }
      ]
    },
    toolBar(route) {
      return {
        title: `User ${route.params.user}`,
        items: [
          {
            title: 'Credentials',
            to: {
              name: 'UsersCredentialsSearch',
              params: { user: route.params.user }
            },
            hide(route) {
              return route.params.user === '_new'
            }
          }
        ]
      }
    }
  },
  children: [
    {
      path: '',
      name: 'UsersCRUD',
      component: () => import('@/views/ViewUsersCRUD.vue')
    }
  ]
}

const routesUsers = [routeUsersSearch, routeUsersCrud]

export default routesUsers
