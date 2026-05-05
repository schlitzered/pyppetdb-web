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
      const loginData = loginDataStore()
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
              return !loginData.hasPermission('HIERA:LEVEL_DATA::CREATE')
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
