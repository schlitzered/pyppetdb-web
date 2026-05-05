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
const routeNodesReportsSearch = {
  path: '/nodes/:node/reports',
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
        },
        {
          title: 'Reports',
          to: {
            name: 'NodesReportsSearch',
            params: { node: route.params.node }
          }
        }
      ]
    },
    toolBar(route) {
      return {
        title: `Reports ${route.params.node}`,
        items: []
      }
    }
  },
  children: [
    {
      path: '',
      name: 'NodesReportsSearch',
      component: () => import('@/views/ViewNodesReportsSearch.vue')
    }
  ]
}

const routeNodesReportsCrud = {
  path: '/nodes/:node/reports/:report',
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
        },
        {
          title: 'Reports',
          to: {
            name: 'NodesReportsSearch',
            params: { node: route.params.node }
          }
        },
        {
          title: route.params.report
        }
      ]
    },
    toolBar(route) {
      return {
        title: `Report ${route.params.node} ${route.params.report}`,
        items: []
      }
    }
  },
  children: [
    {
      path: '',
      name: 'NodesReportsCRUD',
      component: () => import('@/views/ViewNodesReportsCRUD.vue')
    }
  ]
}

const routesNodesReports = [routeNodesReportsSearch, routeNodesReportsCrud]

export default routesNodesReports
