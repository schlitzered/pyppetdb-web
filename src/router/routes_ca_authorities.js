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

const routeCAAuthoritiesSearch = {
  path: '/ca/authorities',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    appBar: {
      name: 'CA Authorities',
      to: 'CAAuthoritiesSearch',
      href: '/ca/authorities',
      requireAdmin: false,
      requiredPermission: 'CA::GET',
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
      const loginData = loginDataStore()
      return {
        title: 'CA Authorities',
        items: [
          {
            title: 'New Authority',
            to: { name: 'CAAuthoritiesCRUD', params: { ca_id: '_new' } },
            hide() {
              return !loginData.hasPermission('CA:AUTHORITIES:CREATE')
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
