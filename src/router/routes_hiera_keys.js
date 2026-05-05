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
const routeHieraKeysSearch = {
  path: '/hiera/keys',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    appBar: {
      name: 'Keys',
      to: 'HieraKeysSearch',
      href: '/hiera/keys',
      requireAdmin: false,
      icon: 'mdi-key',
      group: 'Hiera',
      groupOrder: 2,
      order: 3
    },
    breadCrumb: [
      {
        title: 'Pyppetdb',
        to: { name: 'Home' }
      },
      {
        title: 'Hiera Keys',
        to: { name: 'HieraKeysSearch' }
      }
    ],
    toolBar() {
      return {
        title: `Hiera Keys`,
        items: [
          {
            title: 'New Key',
            to: { name: 'HieraKeysCRUD', params: { key_id: '_new' } },
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
      name: 'HieraKeysSearch',
      component: () => import('@/views/ViewHieraKeysSearch.vue')
    }
  ]
}

const routeHieraKeysCRUD = {
  path: '/hiera/keys/:key_id',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    breadCrumb(route) {
      return [
        {
          title: 'Pyppetdb',
          to: { name: 'Home' }
        },
        {
          title: 'Hiera Keys',
          to: { name: 'HieraKeysSearch' }
        },
        {
          title: route.params.key_id
        }
      ]
    },
    toolBar(route) {
      return {
        title: `Hiera Key ${route.params.key_id}`,
        items: []
      }
    }
  },
  children: [
    {
      path: '',
      name: 'HieraKeysCRUD',
      component: () => import('@/views/ViewHieraKeysCRUD.vue')
    }
  ]
}

const routesHieraKeys = [routeHieraKeysSearch, routeHieraKeysCRUD]

export default routesHieraKeys
