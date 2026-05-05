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
const routeNodesGroupsSearch = {
  path: '/nodes_groups',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    appBar: {
      name: 'NodesGroups',
      to: 'NodesGroupsSearch',
      href: '/nodes_groups',
      requireAdmin: true,
      icon: 'mdi-account-multiple',
      group: 'Nodes',
      groupOrder: 1,
      order: 2
    },
    breadCrumb: [
      {
        title: 'Pyppetdb',
        to: { name: 'Home' }
      },
      {
        title: 'NodesGroups',
        to: { name: 'NodesGroupsSearch' }
      }
    ],
    toolBar() {
      return {
        title: `NodesGroups`,
        items: [
          {
            title: 'New Node Group',
            to: { name: 'NodesGroupsCRUD', params: { node_group: '_new' } },
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
      name: 'NodesGroupsSearch',
      component: () => import('@/views/ViewNodesGroupsSearch.vue')
    }
  ]
}

const routeNodesGroupsCrud = {
  path: '/nodes_groups/:node_group',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    breadCrumb(route) {
      return [
        {
          title: 'Pyppetdb',
          to: { name: 'Home' }
        },
        {
          title: 'NodesGroups',
          to: { name: 'NodesGroupsSearch' }
        },
        {
          title: route.params.node_group
        }
      ]
    },
    toolBar(route) {
      return {
        title: `NodeGroup ${route.params.node_group}`,
        items: []
      }
    }
  },
  children: [
    {
      path: '',
      name: 'NodesGroupsCRUD',
      component: () => import('@/views/ViewNodesGroupsCRUD.vue')
    }
  ]
}

const routesNodesGroups = [routeNodesGroupsSearch, routeNodesGroupsCrud]

export default routesNodesGroups
