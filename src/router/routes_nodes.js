const routeNodesSearch = {
  path: '/nodes',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    appBar: {
      name: 'Nodes',
      to: 'NodesSearch',
      href: '/nodes',
      requireAdmin: true,
      icon: 'mdi-account-multiple'
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
        items: [
          {
            title: 'New Node ',
            to: { name: 'NodesCRUD', params: { node: '_new' } },
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
          title: route.params.node
        }
      ]
    },
    toolBar(route) {
      return {
        title: `Node ${route.params.node}`,
        items: []
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

const routesNodes = [routeNodesSearch, routeNodesCrud]

export default routesNodes
