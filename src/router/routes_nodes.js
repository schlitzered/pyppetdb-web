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
          },
          {
            title: 'Credentials',
            to: {
              name: 'NodesCredentialsSearch',
              params: { node: route.params.node }
            },
            hide(route) {
              return route.params.node === '_new'
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
