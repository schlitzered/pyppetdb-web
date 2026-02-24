const routeNodesCredentialsSearch = {
  path: '/nodes/:node/credentials',
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
          title: `${route.params.node} `,
          to: { name: 'NodesCRUD', params: { node: route.params.node } }
        },
        {
          title: 'Credentials'
        }
      ]
    },
    toolBar(route) {
      return {
        title: `Node ${route.params.node} Credentials`,
        items: [
          {
            title: 'New Credential',
            to: {
              name: 'NodesCredentialsCRUD',
              params: { node: route.params.node, credential: '_new' }
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
      name: 'NodesCredentialsSearch',
      component: () => import('@/views/ViewNodesCredentialsSearch.vue')
    }
  ]
}

const routeNodesCredentialsCrud = {
  path: '/nodes/:node/credentials/:credential',
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
          title: `${route.params.node} `,
          to: { name: 'NodesCRUD', params: { node: route.params.node } }
        },
        {
          title: 'Credentials ',
          to: {
            name: 'NodesCredentialsSearch',
            params: { node: route.params.node }
          }
        },
        {
          title: `${route.params.credential} `
        }
      ]
    },
    toolBar(route) {
      return {
        title: `Node ${route.params.node} Credential ${route.params.credential}`,
        items: []
      }
    }
  },
  children: [
    {
      path: '',
      name: 'NodesCredentialsCRUD',
      component: () => import('@/views/ViewNodesCredentialsCRUD.vue')
    }
  ]
}

const routesNodesCredentials = [
  routeNodesCredentialsSearch,
  routeNodesCredentialsCrud
]

export default routesNodesCredentials
