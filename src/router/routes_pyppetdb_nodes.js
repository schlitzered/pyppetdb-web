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
const routePyppetdbNodesSearch = {
  path: '/pyppetdb_nodes',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    appBar: {
      name: 'PyppetdbNodes',
      to: 'PyppetdbNodesSearch',
      href: '/pyppetdb_nodes',
      requireAdmin: true,
      icon: 'mdi-server',
      group: 'System',
      groupOrder: 10,
      order: 1
    },
    breadCrumb: [
      {
        title: 'Pyppetdb',
        to: { name: 'Home' }
      },
      {
        title: 'PyppetdbNodes',
        to: { name: 'PyppetdbNodesSearch' }
      }
    ],
    toolBar() {
      return {
        title: `PyppetdbNodes`,
        items: []
      }
    }
  },
  children: [
    {
      path: '',
      name: 'PyppetdbNodesSearch',
      component: () => import('@/views/ViewPyppetdbNodesSearch.vue')
    }
  ]
}

const routePyppetdbNodesCrud = {
  path: '/pyppetdb_nodes/:node_id',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    breadCrumb(route) {
      return [
        {
          title: 'Pyppetdb',
          to: { name: 'Home' }
        },
        {
          title: 'PyppetdbNodes',
          to: { name: 'PyppetdbNodesSearch' }
        },
        {
          title: route.params.node_id
        }
      ]
    },
    toolBar(route) {
      return {
        title: `PyppetdbNode ${route.params.node_id}`,
        items: []
      }
    }
  },
  children: [
    {
      path: '',
      name: 'PyppetdbNodesCRUD',
      component: () => import('@/views/ViewPyppetdbNodesCRUD.vue')
    }
  ]
}

const routesPyppetdbNodes = [routePyppetdbNodesSearch, routePyppetdbNodesCrud]

export default routesPyppetdbNodes
