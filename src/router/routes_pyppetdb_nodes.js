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
