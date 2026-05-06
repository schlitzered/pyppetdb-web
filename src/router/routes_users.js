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
import { PERMISSIONS } from '@/common/permissions'

const routeUsersSearch = {
  path: '/users',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    appBar: {
      name: 'Users',
      to: 'UsersSearch',
      href: '/users',
      requireAdmin: false,
      requiredPermission: PERMISSIONS.USERS.GET,
      icon: 'mdi-account-multiple',
      group: 'Administration',
      groupOrder: 3,
      order: 2
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
      const loginData = loginDataStore()
      return {
        title: `Users`,
        items: [
          {
            title: 'New User',
            to: { name: 'UsersCRUD', params: { user: '_new' } },
            hide() {
              return !loginData.hasPermission(PERMISSIONS.USERS.CREATE)
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
              const loginData = loginDataStore()
              if (route.params.user === '_new') return true
              if (route.params.user === '_self') return false
              return !loginData.hasPermission(PERMISSIONS.USERS.CREDENTIALS.GET)
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
