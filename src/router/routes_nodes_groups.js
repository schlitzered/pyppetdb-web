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
      group: 'Administration',
      groupOrder: 3,
      order: 3
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
