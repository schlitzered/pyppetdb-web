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
          title: 'Reports'
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
