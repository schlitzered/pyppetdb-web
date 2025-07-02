const routeUsersCredentialsSearch = {
  path: '/users/:user/credentials',
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
          title: `${route.params.user} `,
          to: { name: 'UsersCRUD', params: { user: route.params.user } }
        },
        {
          title: 'Credentials'
        }
      ]
    },
    toolBar(route) {
      return {
        title: `User ${route.params.user} Credentials`,
        items: [
          {
            title: 'New Credential',
            to: {
              name: 'UsersCredentialsCRUD',
              params: { user: route.params.user, credential: '_new' }
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
      name: 'UsersCredentialsSearch',
      component: () => import('@/views/ViewUsersCredentialsSearch.vue')
    }
  ]
}

const routeUsersCredentialsCrud = {
  path: '/users/:user/credentials/:credential',
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
          title: `${route.params.user} `,
          to: { name: 'UsersCRUD', params: { user: route.params.user } }
        },
        {
          title: 'Credentials ',
          to: {
            name: 'UsersCredentialsSearch',
            params: { user: route.params.user }
          }
        },
        {
          title: `${route.params.credential} `
        }
      ]
    },
    toolBar(route) {
      return {
        title: `User ${route.params.user} Credential ${route.params.credential}`,
        items: []
      }
    }
  },
  children: [
    {
      path: '',
      name: 'UsersCredentialsCRUD',
      component: () => import('@/views/ViewUsersCredentialsCRUD.vue')
    }
  ]
}

const routesUsersCredentials = [
  routeUsersCredentialsSearch,
  routeUsersCredentialsCrud
]

export default routesUsersCredentials
