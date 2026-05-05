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

const routeHieraLevelsSearch = {
  path: '/hiera/levels',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    appBar: {
      name: 'Levels',
      to: 'HieraLevelsSearch',
      href: '/hiera/levels',
      requireAdmin: false,
      requiredPermission: 'HIERA::GET',
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
      const loginData = loginDataStore()
      return {
        title: `Hiera Levels`,
        items: [
          {
            title: 'New Level',
            to: { name: 'HieraLevelsCRUD', params: { level_id: '_new' } },
            hide() {
              return !loginData.hasPermission('HIERA:LEVELS::CREATE')
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
