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

const routeHieraKeyModelsDynamicSearch = {
  path: '/hiera/key_models/dynamic',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    appBar: {
      name: 'Key Models Dynamic',
      to: 'HieraKeyModelsDynamicSearch',
      href: '/hiera/key_models/dynamic',
      requireAdmin: false,
      requiredPermission: 'HIERA::GET',
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
      const loginData = loginDataStore()
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
              return !loginData.hasPermission('HIERA:KEY_MODELS_DYNAMIC::CREATE')
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
