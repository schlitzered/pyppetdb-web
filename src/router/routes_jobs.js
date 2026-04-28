const routeJobsDefinitionsSearch = {
  path: '/jobs/definitions',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    appBar: {
      name: 'Job Definitions',
      to: 'JobsDefinitionsSearch',
      href: '/jobs/definitions',
      requireAdmin: false,
      icon: 'mdi-file-cog',
      group: 'Jobs',
      groupOrder: 5,
      order: 1
    },
    breadCrumb: [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'Job Definitions', to: { name: 'JobsDefinitionsSearch' } }
    ],
    toolBar() {
      return {
        title: `Job Definitions`,
        items: [
          {
            title: 'New Definition',
            to: { name: 'JobsDefinitionsCRUD', params: { definition_id: '_new' } },
            requireAdmin: true
          }
        ]
      }
    }
  },
  children: [
    {
      path: '',
      name: 'JobsDefinitionsSearch',
      component: () => import('@/views/ViewJobsDefinitionsSearch.vue')
    }
  ]
}

const routeJobsDefinitionsCrud = {
  path: '/jobs/definitions/:definition_id',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    breadCrumb(route) {
      return [
        { title: 'Pyppetdb', to: { name: 'Home' } },
        { title: 'Job Definitions', to: { name: 'JobsDefinitionsSearch' } },
        { title: route.params.definition_id }
      ]
    },
    toolBar(route) {
      return {
        title: `Job Definition ${route.params.definition_id}`,
        items: []
      }
    }
  },
  children: [
    {
      path: '',
      name: 'JobsDefinitionsCRUD',
      component: () => import('@/views/ViewJobsDefinitionsCRUD.vue')
    }
  ]
}

const routeJobsSearch = {
  path: '/jobs/jobs',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    appBar: {
      name: 'Jobs',
      to: 'JobsSearch',
      href: '/jobs/jobs',
      requireAdmin: false,
      icon: 'mdi-play-network',
      group: 'Jobs',
      groupOrder: 5,
      order: 2
    },
    breadCrumb: [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'Jobs', to: { name: 'JobsSearch' } }
    ],
    toolBar() {
      return {
        title: `Jobs`,
        items: [
          {
            title: 'New Job',
            to: { name: 'JobsCRUD', params: { job_id: '_new' } },
            hide() { return false }
          }
        ]
      }
    }
  },
  children: [
    {
      path: '',
      name: 'JobsSearch',
      component: () => import('@/views/ViewJobsSearch.vue')
    }
  ]
}

const routeJobsCrud = {
  path: '/jobs/jobs/:job_id',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    breadCrumb(route) {
      return [
        { title: 'Pyppetdb', to: { name: 'Home' } },
        { title: 'Jobs', to: { name: 'JobsSearch' } },
        { title: route.params.job_id }
      ]
    },
    toolBar(route) {
      return {
        title: `Job ${route.params.job_id}`,
        items: []
      }
    }
  },
  children: [
    {
      path: '',
      name: 'JobsCRUD',
      component: () => import('@/views/ViewJobsCRUD.vue')
    }
  ]
}

const routeJobsNodesJobsSearch = {
  path: '/jobs/nodes_jobs',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    appBar: {
      name: 'Node Job Runs',
      to: 'JobsNodesJobsSearch',
      href: '/jobs/nodes_jobs',
      requireAdmin: false,
      icon: 'mdi-format-list-bulleted-type',
      group: 'Jobs',
      groupOrder: 5,
      order: 3
    },
    breadCrumb: [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'Node Job Runs', to: { name: 'JobsNodesJobsSearch' } }
    ],
    toolBar() {
      return {
        title: `Node Job Runs`,
        items: []
      }
    }
  },
  children: [
    {
      path: '',
      name: 'JobsNodesJobsSearch',
      component: () => import('@/views/ViewJobsNodesJobsSearch.vue')
    }
  ]
}

const routeJobsNodesJobsCrud = {
  path: '/jobs/nodes_jobs/:node_job_id',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    breadCrumb(route) {
      return [
        { title: 'Pyppetdb', to: { name: 'Home' } },
        { title: 'Node Job Runs', to: { name: 'JobsNodesJobsSearch' } },
        { title: route.params.node_job_id }
      ]
    },
    toolBar(route) {
      return {
        title: `Node Job Run ${route.params.node_job_id}`,
        items: []
      }
    }
  },
  children: [
    {
      path: '',
      name: 'JobsNodesJobsCRUD',
      component: () => import('@/views/ViewJobsNodesJobsCRUD.vue')
    }
  ]
}

const routesJobs = [
  routeJobsDefinitionsSearch,
  routeJobsDefinitionsCrud,
  routeJobsSearch,
  routeJobsCrud,
  routeJobsNodesJobsSearch,
  routeJobsNodesJobsCrud
]

export default routesJobs
