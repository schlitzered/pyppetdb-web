/*
 * Copyright 2026 Stephan Schultchen
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { loginDataStore } from '@/store/login_data'

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
      const loginData = loginDataStore()
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
              return !loginData.hasPermission('USERS:CREDENTIALS::CREATE')
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
