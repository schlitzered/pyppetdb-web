import type { RouteLocationNormalized } from 'vue-router'
import type { ResourceDefinition } from '@/types/resources'
import { PERMISSIONS } from '@/constants/permissions'
import NodesSearchForm from '@/components/special/NodesSearchForm.vue'
import NodesCrudForm from '@/components/special/NodesCrudForm.vue'
import NodesReportsForm from '@/components/special/NodesReportsForm.vue'
import NodesGroupsForm from '@/components/special/NodesGroupsForm.vue'

export const factFieldProcessor = {
  fromUrl: (urlValue: any) => {
    const fact_values = Array.isArray(urlValue) ? urlValue : [urlValue]
    return fact_values.map((fact_value: string) => {
      const parts = fact_value.split(':')
      return {
        fact_name: parts[0] || '',
        operator: parts[1] || '',
        type: parts[2] || '',
        value: parts[3] || ''
      }
    })
  },

  toUrl: (formValue: any) => {
    if (!Array.isArray(formValue)) {
      return undefined
    }
    const facts = formValue
      .filter(
        (fact: any) =>
          fact.fact_name && fact.operator && fact.type && fact.value
      )
      .map(
        (fact: any) =>
          `${fact.fact_name}:${fact.operator}:${fact.type}:${fact.value}`
      )
    return facts.length > 0 ? facts : undefined
  }
}

export const nodes: ResourceDefinition = {
  name: 'nodes',
  label: 'Node',
  labelPlural: 'Nodes',
  apiBase: '/api/v1/nodes',
  routeParam: 'node',
  customSearchComponent: NodesSearchForm,
  customFormComponent: NodesCrudForm,
  routeNames: {
    search: 'NodesSearch',
    crud: 'NodesCRUD'
  },
  path: '/nodes/nodes',
  crudPath: '/nodes/nodes/:node',
  nav: {
    label: 'Nodes',
    icon: 'Server',
    group: 'Nodes',
    groupOrder: 1,
    order: 1
  },
  breadcrumbs: {
    search: [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'Nodes' },
      { title: 'Nodes' }
    ],
    crud: (route: RouteLocationNormalized) => [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'Nodes' },
      { title: 'Nodes', to: { name: 'NodesSearch' } },
      { title: String(route.params.node) }
    ]
  },
  toolbar: {
    search: {
      title: 'Nodes',
      items: []
    },
    crud: {
      title: (route: RouteLocationNormalized) => `Node ${route.params.node}`,
      items: [
        {
          label: 'Reports',
          icon: 'FileText',
          to: (route: RouteLocationNormalized) => ({
            name: 'NodesReportsSearch',
            params: { node: route.params.node }
          })
        },
        {
          label: 'Certs',
          icon: 'Shield',
          to: (route: RouteLocationNormalized) => ({
            name: 'CASpacesCertsSearch',
            params: { space_id: 'puppet-ca' },
            query: { cn: route.params.node }
          })
        }
      ]
    }
  },
  tableColumns: [
    {
      key: 'id',
      label: 'Node Name',
      sortable: true,
      linkRoute: 'NodesCRUD',
      linkParam: 'node'
    },
    { key: 'environment', label: 'Environment', sortable: true },
    { key: 'report.status', label: 'Report Status', sortable: true }
  ],
  searchFilters: [
    { key: 'node_id', label: 'Node Name', type: 'text' },
    { key: 'disabled', label: 'Disabled', type: 'text' },
    { key: 'environment', label: 'Environment', type: 'text' },
    { key: 'report_status', label: 'Report Status', type: 'text' },
    { key: 'outdated_threshold', label: 'Outdated Threshold', type: 'text' },
    {
      key: 'fact',
      label: 'Fact',
      type: 'array',
      processor: factFieldProcessor
    }
  ],

  fields: [
    {
      key: 'id',
      label: 'Node Name',
      type: 'text',
      required: true,
      readonlyOnEdit: true
    },
    {
      key: 'environment',
      label: 'Environment',
      type: 'text',
      required: true,
      readonly: true
    },
    { key: 'disabled', label: 'Disabled', type: 'switch', defaultValue: false }
  ],
  permissions: {
    create: (hasPerm) => hasPerm(PERMISSIONS.NODES.CREATE),
    edit: (hasPerm) => hasPerm(PERMISSIONS.NODES.UPDATE),
    delete: (hasPerm) => hasPerm(PERMISSIONS.NODES.DELETE)
  }
}

export const nodesGroups: ResourceDefinition = {
  name: 'nodes_groups',
  label: 'Node Group',
  labelPlural: 'Node Groups',
  apiBase: '/api/v1/nodes_groups',
  routeParam: 'node_group',
  customFormComponent: NodesGroupsForm,
  routeNames: {
    search: 'NodesGroupsSearch',
    crud: 'NodesGroupsCRUD'
  },
  path: '/nodes/groups',
  crudPath: '/nodes/groups/:node_group',
  nav: {
    label: 'Node Groups',
    icon: 'Folder',
    group: 'Nodes',
    groupOrder: 1,
    order: 2
  },
  breadcrumbs: {
    search: [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'Nodes' },
      { title: 'Node Groups' }
    ],
    crud: (route: RouteLocationNormalized) => [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'Nodes' },
      { title: 'Node Groups', to: { name: 'NodesGroupsSearch' } },
      { title: String(route.params.node_group) }
    ]
  },
  toolbar: {
    search: {
      title: 'Node Groups',
      items: []
    },
    crud: {
      title: (route: RouteLocationNormalized) =>
        `Node Group ${route.params.node_group}`,
      items: []
    }
  },
  tableColumns: [
    {
      key: 'id',
      label: 'Group ID',
      sortable: true,
      linkRoute: 'NodesGroupsCRUD',
      linkParam: 'node_group'
    },
    { key: 'teams', label: 'Teams' }
  ],
  searchFilters: [],
  fields: [
    {
      key: 'id',
      label: 'Group ID',
      type: 'text',
      required: true,
      readonlyOnEdit: true
    },
    {
      key: 'teams',
      label: 'Associated Teams',
      type: 'autocomplete',
      autocomplete: {
        endpoint: '/api/v1/teams',
        field: 'team_id',
        responseField: 'id',
        multiple: true
      }
    }
  ],
  permissions: {
    create: (hasPerm) => hasPerm(PERMISSIONS.NODES.GROUPS.CREATE),
    edit: (hasPerm) => hasPerm(PERMISSIONS.NODES.GROUPS.UPDATE),
    delete: (hasPerm) => hasPerm(PERMISSIONS.NODES.GROUPS.DELETE)
  }
}

export const nodesReports: ResourceDefinition = {
  name: 'nodes/reports',
  label: 'Node Report',
  labelPlural: 'Node Reports',
  apiBase: (route: RouteLocationNormalized) =>
    `/api/v1/nodes/${route.params.node}/reports`,
  routeParam: 'report',
  routeNames: {
    search: 'NodesReportsSearch',
    crud: 'NodesReportsCRUD'
  },
  path: '/nodes/nodes/:node/reports',
  crudPath: '/nodes/nodes/:node/reports/:report',
  customFormComponent: NodesReportsForm,
  searchOnly: false,
  breadcrumbs: {
    search: (route: RouteLocationNormalized) => [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'Nodes' },
      { title: 'Nodes', to: { name: 'NodesSearch' } },
      {
        title: String(route.params.node),
        to: { name: 'NodesCRUD', params: { node: route.params.node } }
      },
      { title: 'Reports' }
    ],
    crud: (route: RouteLocationNormalized) => [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'Nodes' },
      { title: 'Nodes', to: { name: 'NodesSearch' } },
      {
        title: String(route.params.node),
        to: { name: 'NodesCRUD', params: { node: route.params.node } }
      },
      {
        title: 'Reports',
        to: { name: 'NodesReportsSearch', params: { node: route.params.node } }
      },
      { title: String(route.params.report) }
    ]
  },
  toolbar: {
    search: {
      title: 'Node Reports',
      items: []
    },
    crud: {
      title: (route: RouteLocationNormalized) =>
        `Report ${route.params.report}`,
      items: []
    }
  },
  tableColumns: [
    {
      key: 'id',
      label: 'Report ID',
      sortable: true,
      linkRoute: 'NodesReportsCRUD',
      linkParam: 'report'
    },
    { key: 'report.status', label: 'Status', sortable: true },
    {
      key: 'id',
      label: 'Timestamp',
      sortable: true,
      formatter: (value: unknown) => {
        return value ? new Date(String(value)).toLocaleString() : ''
      }
    }
  ],
  searchFilters: [],
  fields: [],
  permissions: {}
}

export const nodesSecretsRedactor: ResourceDefinition = {
  name: 'nodes_secrets_redactor',
  label: 'Secrets Redactor',
  labelPlural: 'Secrets Redactor',
  apiBase: '/api/v1/nodes_secrets_redactor',
  routeParam: 'secret_id',
  routeNames: {
    search: 'NodesSecretsRedactorSearch',
    crud: 'NodesSecretsRedactorCRUD'
  },
  path: '/nodes/secrets_redactor',
  crudPath: '/nodes/secrets_redactor/:secret_id',
  writeOnly: true,
  nav: {
    label: 'Secrets Redactor',
    icon: 'ShieldAlert',
    group: 'Nodes',
    groupOrder: 1,
    order: 4
  },
  breadcrumbs: {
    search: [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'Nodes' },
      { title: 'Secrets Redactor' }
    ],
    crud: (route: RouteLocationNormalized) => [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'Nodes' },
      { title: 'Secrets Redactor', to: { name: 'NodesSecretsRedactorSearch' } },
      { title: String(route.params.secret_id) }
    ]
  },
  toolbar: {
    search: {
      title: 'Secrets Redactor',
      items: []
    },
    crud: {
      title: (route: RouteLocationNormalized) =>
        `Secrets Redactor ${route.params.secret_id}`,
      items: []
    }
  },
  tableColumns: [
    {
      key: 'id',
      label: 'Pattern ID',
      sortable: true
    },
    {
      key: 'created_at',
      label: 'Created At',
      sortable: true
    }
  ],
  searchFilters: [
    {
      key: 'secret_id',
      label: 'Filter Secret ID (Regex)',
      type: 'text'
    },
    {
      key: 'secret_value',
      label: 'Search by Secret String',
      type: 'text',
      processor: {
        toUrl: () => undefined,
        fromUrl: () => ''
      }
    }
  ],
  fields: [
    {
      key: 'id',
      label: 'Pattern ID',
      type: 'text',
      required: true,
      readonly: true,
      hiddenOnCreate: true
    },
    {
      key: 'value',
      label: 'Secret String to Redact',
      type: 'password',
      required: true,
      hiddenOnEdit: true
    }
  ],
  permissions: {
    create: (hasPerm) => hasPerm(PERMISSIONS.NODES.SECRETS_REDACTOR.CREATE),
    edit: () => false,
    delete: (hasPerm) => hasPerm(PERMISSIONS.NODES.SECRETS_REDACTOR.DELETE)
  }
}

export const nodesDistinctFactValues: ResourceDefinition = {
  name: 'nodes/distinct_fact_values',
  label: 'Distinct Fact Values',
  labelPlural: 'Distinct Fact Values',
  apiBase: '/api/v1/nodes/_distinct_fact_values',
  routeParam: 'fact',
  routeNames: {
    search: 'NodesDistinctFactValues',
    crud: ''
  },
  path: '/nodes/distinct_fact_values',
  searchOnly: true,
  nav: {
    label: 'Distinct Fact Values',
    icon: 'Tag',
    group: 'Nodes',
    groupOrder: 1,
    order: 3
  },
  breadcrumbs: {
    search: [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'Nodes' },
      { title: 'Distinct Fact Values' }
    ],
    crud: () => []
  },
  toolbar: {
    search: {
      title: 'Distinct Fact Values',
      items: []
    },
    crud: {
      title: '',
      items: []
    }
  },
  tableColumns: [
    { key: 'value', label: 'Distinct Value', sortable: true },
    { key: 'count', label: 'Count', sortable: true }
  ],
  searchFilters: [{ key: 'fact_id', label: 'Fact Name', type: 'text' }],
  fields: [],
  permissions: {}
}
