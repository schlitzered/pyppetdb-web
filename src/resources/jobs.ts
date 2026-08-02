import type { RouteLocationNormalized } from 'vue-router'
import type { ResourceDefinition } from '@/types/resources'
import { PERMISSIONS } from '@/constants/permissions'
import JobsNodesJobsForm from '@/components/special/JobsNodesJobsForm.vue'
import JobsCrudForm from '@/components/special/JobsCrudForm.vue'
import JobsDefinitionsForm from '@/components/special/JobsDefinitionsForm.vue'

export const jobDefinitions: ResourceDefinition = {
  name: 'jobs/definitions',
  label: 'Job Definition',
  labelPlural: 'Job Definitions',
  apiBase: '/api/v1/jobs/definitions',
  // list only renders these; drops params_template / params / environment_variables
  apiFields: ['id', 'executable', 'user', 'group'],
  routeParam: 'definition_id',
  routeNames: {
    search: 'JobsDefinitionsSearch',
    crud: 'JobsDefinitionsCRUD'
  },
  customFormComponent: JobsDefinitionsForm,
  path: '/jobs/definitions',
  crudPath: '/jobs/definitions/:definition_id',
  nav: {
    label: 'Definitions',
    icon: 'FileCog',
    group: 'Jobs',
    groupOrder: 5,
    order: 1
  },
  breadcrumbs: {
    search: [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'Jobs' },
      { title: 'Definitions' }
    ],
    crud: (route: RouteLocationNormalized) => [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'Jobs' },
      { title: 'Definitions', to: { name: 'JobsDefinitionsSearch' } },
      { title: String(route.params.definition_id) }
    ]
  },
  toolbar: {
    search: {
      title: 'Job Definitions',
      items: []
    },
    crud: {
      title: (route: RouteLocationNormalized) =>
        `Job Definition ${route.params.definition_id}`,
      items: []
    }
  },
  tableColumns: [
    {
      key: 'id',
      label: 'Definition ID',
      sortable: true,
      linkRoute: 'JobsDefinitionsCRUD',
      linkParam: 'definition_id'
    },
    { key: 'executable', label: 'Executable', sortable: true },
    { key: 'user', label: 'User', sortable: true },
    { key: 'group', label: 'Group', sortable: true }
  ],
  searchFilters: [
    { key: 'definition_id', label: 'Definition ID', type: 'text' }
  ],
  fields: [],
  permissions: {
    create: (hasPerm) => hasPerm(PERMISSIONS.JOBS.DEFINITION.CREATE),
    edit: (hasPerm) => hasPerm(PERMISSIONS.JOBS.DEFINITION.UPDATE),
    delete: (hasPerm) => hasPerm(PERMISSIONS.JOBS.DEFINITION.DELETE)
  }
}

export const jobs: ResourceDefinition = {
  name: 'jobs/jobs',
  label: 'Job',
  labelPlural: 'Jobs',
  apiBase: '/api/v1/jobs/jobs',
  // list only renders these; drops parameters / env_vars / node_filter / nodes list
  apiFields: ['id', 'definition_id', 'created_at', 'created_by'],
  routeParam: 'job_id',
  routeNames: {
    search: 'JobsSearch',
    crud: 'JobsCRUD'
  },
  path: '/jobs/jobs',
  crudPath: '/jobs/jobs/:job_id',
  customFormComponent: JobsCrudForm,
  nav: {
    label: 'Jobs',
    icon: 'Play',
    group: 'Jobs',
    groupOrder: 5,
    order: 2
  },
  breadcrumbs: {
    search: [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'Jobs' },
      { title: 'Jobs' }
    ],
    crud: (route: RouteLocationNormalized) => [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'Jobs' },
      { title: 'Jobs', to: { name: 'JobsSearch' } },
      { title: String(route.params.job_id) }
    ]
  },
  toolbar: {
    search: {
      title: 'Jobs',
      items: []
    },
    crud: {
      title: (route: RouteLocationNormalized) => `Job ${route.params.job_id}`,
      items: []
    }
  },
  tableColumns: [
    {
      key: 'id',
      label: 'Job ID',
      sortable: true,
      linkRoute: 'JobsCRUD',
      linkParam: 'job_id'
    },
    { key: 'definition_id', label: 'Definition ID', sortable: true },
    {
      key: 'created_at',
      label: 'Created At',
      sortable: true,
      formatter: (value: unknown) => {
        return value ? new Date(String(value)).toLocaleString() : ''
      }
    },
    { key: 'created_by', label: 'Created By', sortable: true }
  ],
  searchFilters: [{ key: 'job_id', label: 'Job ID', type: 'text' }],
  fields: [
    {
      key: 'id',
      label: 'Job ID',
      type: 'text',
      required: true,
      readonlyOnEdit: true
    },
    {
      key: 'definition_id',
      label: 'Definition ID',
      type: 'autocomplete',
      required: true,
      autocomplete: {
        endpoint: '/api/v1/jobs/definitions',
        field: 'definition_id',
        responseField: 'id'
      }
    }
  ],
  permissions: {
    create: (hasPerm) => hasPerm(PERMISSIONS.JOBS.JOB.CREATE),
    edit: () => false,
    delete: () => false
  }
}

export const jobNodeRuns: ResourceDefinition = {
  name: 'jobs/nodes_jobs',
  label: 'Node Job Run',
  labelPlural: 'Node Job Runs',
  apiBase: '/api/v1/jobs/nodes_jobs',
  apiFields: [
    'id',
    'job_id',
    'definition_id',
    'node_id',
    'status',
    'created_at',
    'created_by'
  ],
  routeParam: 'node_job_id',
  routeNames: {
    search: 'JobsNodesJobsSearch',
    crud: 'JobsNodesJobsCRUD'
  },
  path: '/jobs/nodes_jobs',
  crudPath: '/jobs/nodes_jobs/:node_job_id',
  customFormComponent: JobsNodesJobsForm,
  nav: {
    label: 'Node Job Runs',
    icon: 'ListCollapse',
    group: 'Jobs',
    groupOrder: 5,
    order: 3
  },
  breadcrumbs: {
    search: [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'Jobs' },
      { title: 'Node Job Runs' }
    ],
    crud: (route: RouteLocationNormalized) => [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'Jobs' },
      { title: 'Node Job Runs', to: { name: 'JobsNodesJobsSearch' } },
      { title: String(route.params.node_job_id) }
    ]
  },
  toolbar: {
    search: {
      title: 'Node Job Runs',
      items: []
    },
    crud: {
      title: (route: RouteLocationNormalized) =>
        `Node Job Run ${route.params.node_job_id}`,
      items: []
    }
  },
  tableColumns: [
    {
      key: 'id',
      label: 'Run ID',
      sortable: true,
      linkRoute: 'JobsNodesJobsCRUD',
      linkParam: 'node_job_id'
    },
    { key: 'job_id', label: 'Job ID', sortable: true },
    { key: 'definition_id', label: 'Definition ID', sortable: true },
    { key: 'node_id', label: 'Node ID', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    {
      key: 'created_at',
      label: 'Created At',
      sortable: true,
      formatter: (value: unknown) => {
        return value ? new Date(String(value)).toLocaleString() : ''
      }
    },
    { key: 'created_by', label: 'Created By', sortable: true }
  ],
  searchFilters: [
    { key: 'job_id', label: 'Job ID', type: 'text' },
    { key: 'node_id', label: 'Node ID', type: 'text' },
    { key: 'status', label: 'Status', type: 'text' }
  ],
  fields: [],
  permissions: {}
}
