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
const routeHieraKeyModelsStaticSearch = {
  path: '/hiera/key_models/static',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    appBar: {
      name: 'Key Models Static',
      to: 'HieraKeyModelsStaticSearch',
      href: '/hiera/key_models/static',
      requireAdmin: false,
      requiredPermission: 'HIERA::GET',
      icon: 'mdi-key-variant',
      group: 'Hiera',
      groupOrder: 2,
      order: 1
    },
    breadCrumb: [
      {
        title: 'Pyppetdb',
        to: { name: 'Home' }
      },
      {
        title: 'Hiera Key Models Static',
        to: { name: 'HieraKeyModelsStaticSearch' }
      }
    ],
    toolBar() {
      return {
        title: `Hiera Key Models Static`,
        items: []
      }
    }
  },
  children: [
    {
      path: '',
      name: 'HieraKeyModelsStaticSearch',
      component: () => import('@/views/ViewHieraKeyModelsStaticSearch.vue')
    }
  ]
}

const routeHieraKeyModelsStaticCRUD = {
  path: '/hiera/key_models/static/:key_model_id',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    breadCrumb(route) {
      return [
        {
          title: 'Pyppetdb',
          to: { name: 'Home' }
        },
        {
          title: 'Hiera Key Models Static',
          to: { name: 'HieraKeyModelsStaticSearch' }
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
      name: 'HieraKeyModelsStaticCRUD',
      component: () => import('@/views/ViewHieraKeyModelsStaticCRUD.vue')
    }
  ]
}

const routesHieraKeyModelsStatic = [
  routeHieraKeyModelsStaticSearch,
  routeHieraKeyModelsStaticCRUD
]

export default routesHieraKeyModelsStatic
