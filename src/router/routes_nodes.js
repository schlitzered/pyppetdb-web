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
const routeNodesDistinctFactValues = {
  path: '/nodes/_distinct_fact_values',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    appBar: {
      name: 'Nodes Distinct Fact Values',
      to: 'NodesDistinctFactValues',
      href: '/nodes/_distinct_fact_values',
      requireAdmin: false,
      icon: 'mdi-account-multiple',
      group: 'Nodes',
      groupOrder: 1,
      order: 3
    },
    breadCrumb: [
      {
        title: 'Pyppetdb',
        to: { name: 'Home' }
      },
      {
        title: 'NodesDistinctFactValues',
        to: { name: 'NodesDistinctFactValues' }
      }
    ],
    toolBar() {
      return {
        title: `NodesDistinctFactValues`,
        items: []
      }
    }
  },
  children: [
    {
      path: '',
      name: 'NodesDistinctFactValues',
      component: () => import('@/views/ViewNodesDistinctFactValues.vue')
    }
  ]
}

const routeNodesSearch = {
  path: '/nodes',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    appBar: {
      name: 'Nodes',
      to: 'NodesSearch',
      href: '/nodes',
      requireAdmin: false,
      icon: 'mdi-account-multiple',
      group: 'Nodes',
      groupOrder: 1,
      order: 1
    },
    breadCrumb: [
      {
        title: 'Pyppetdb',
        to: { name: 'Home' }
      },
      {
        title: 'Nodes',
        to: { name: 'NodesSearch' }
      }
    ],
    toolBar() {
      return {
        title: `Nodes`,
        items: []
      }
    }
  },
  children: [
    {
      path: '',
      name: 'NodesSearch',
      component: () => import('@/views/ViewNodesSearch.vue')
    }
  ]
}

const routeNodesCrud = {
  path: '/nodes/:node',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    breadCrumb(route) {
      return [
        {
          title: 'Pyppetdb',
          to: { name: 'Home' }
        },
        {
          title: 'Nodes',
          to: { name: 'NodesSearch' }
        },
        {
          title: route.params.node,
          to: { name: 'NodesCRUD', params: { node: route.params.node } }
        }
      ]
    },
    toolBar(route) {
      return {
        title: `Node `,
        items: [
          {
            title: 'Reports',
            to: {
              name: 'NodesReportsSearch',
              params: { node: route.params.node }
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
      name: 'NodesCRUD',
      component: () => import('@/views/ViewNodesCRUD.vue')
    }
  ]
}

const routesNodes = [
  routeNodesDistinctFactValues,
  routeNodesSearch,
  routeNodesCrud
]

export default routesNodes
