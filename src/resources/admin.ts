import type { RouteLocationNormalized } from 'vue-router'
import type { ResourceDefinition } from '@/types/resources'
import { PERMISSIONS } from '@/constants/permissions'
import api from '@/api/client'
import { ALL_PERMISSIONS } from '@/constants/permissions'

const getPermissions = async (): Promise<string[]> => {
  try {
    const response = await api.get<{ static: string[]; dynamic: string[] }>(
      '/api/v1/permissions'
    )
    if (response) {
      return [...(response.static || []), ...(response.dynamic || [])]
    }
  } catch (e) {
    console.error(e)
  }
  return [...ALL_PERMISSIONS]
}

export const teams: ResourceDefinition = {
  name: 'teams',
  label: 'Team',
  labelPlural: 'Teams',
  apiBase: '/api/v1/teams',
  routeParam: 'team',
  routeNames: {
    search: 'TeamsSearch',
    crud: 'TeamsCRUD'
  },
  path: '/admin/teams',
  crudPath: '/admin/teams/:team',
  nav: {
    label: 'Teams',
    icon: 'Users',
    group: 'Administration',
    groupOrder: 6,
    order: 1
  },
  breadcrumbs: {
    search: [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'Administration' },
      { title: 'Teams' }
    ],
    crud: (route: RouteLocationNormalized) => [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'Administration' },
      { title: 'Teams', to: { name: 'TeamsSearch' } },
      { title: String(route.params.team) }
    ]
  },
  toolbar: {
    search: {
      title: 'Teams',
      items: []
    },
    crud: {
      title: (route: RouteLocationNormalized) => `Team ${route.params.team}`,
      items: []
    }
  },
  tableColumns: [
    {
      key: 'id',
      label: 'Team ID',
      sortable: true,
      linkRoute: 'TeamsCRUD',
      linkParam: 'team'
    },
    { key: 'ldap_group', label: 'LDAP Group', sortable: true }
  ],
  searchFilters: [{ key: 'team_id', label: 'Team ID', type: 'text' }],
  fields: [
    {
      key: 'id',
      label: 'Team ID',
      type: 'text',
      required: true,
      readonlyOnEdit: true
    },
    { key: 'ldap_group', label: 'LDAP Group', type: 'text' },
    {
      key: 'users',
      label: 'Users',
      type: 'autocomplete',
      autocomplete: {
        endpoint: '/api/v1/users',
        field: 'user_id',
        responseField: 'id',
        multiple: true
      }
    },
    {
      key: 'permissions',
      label: 'Permissions',
      type: 'permission-grid',
      autocomplete: {
        endpoint: async (formData: Record<string, any>, query: string) => {
          const all = await getPermissions()
          if (!query) return all
          return all.filter((p) =>
            p.toLowerCase().includes(query.toLowerCase())
          )
        },
        field: 'permission',
        multiple: true
      }
    }
  ],
  permissions: {
    create: (hasPerm) => hasPerm(PERMISSIONS.TEAMS.CREATE),
    edit: (hasPerm) => hasPerm(PERMISSIONS.TEAMS.UPDATE),
    delete: (hasPerm) => hasPerm(PERMISSIONS.TEAMS.DELETE)
  }
}

export const users: ResourceDefinition = {
  name: 'users',
  label: 'User',
  labelPlural: 'Users',
  apiBase: '/api/v1/users',
  routeParam: 'user',
  routeNames: {
    search: 'UsersSearch',
    crud: 'UsersCRUD'
  },
  path: '/admin/users',
  crudPath: '/admin/users/:user',
  nav: {
    label: 'Users',
    icon: 'User',
    group: 'Administration',
    groupOrder: 6,
    order: 2
  },
  breadcrumbs: {
    search: [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'Administration' },
      { title: 'Users' }
    ],
    crud: (route: RouteLocationNormalized) => [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'Administration' },
      { title: 'Users', to: { name: 'UsersSearch' } },
      { title: String(route.params.user) }
    ]
  },
  toolbar: {
    search: {
      title: 'Users',
      items: []
    },
    crud: {
      title: (route: RouteLocationNormalized) => `User ${route.params.user}`,
      items: [
        {
          label: 'Credentials',
          icon: 'Key',
          to: (route: RouteLocationNormalized) => ({
            name: 'UsersCredentialsSearch',
            params: { user: route.params.user }
          }),
          hide: (
            route: RouteLocationNormalized,
            hasPermission: (perm: string) => boolean
          ) =>
            route.params.user === '_new' ||
            !hasPermission(PERMISSIONS.USERS.CREDENTIALS.GET)
        }
      ]
    }
  },
  tableColumns: [
    {
      key: 'id',
      label: 'User ID',
      sortable: true,
      linkRoute: 'UsersCRUD',
      linkParam: 'user'
    },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'admin', label: 'Admin', sortable: true },
    { key: 'backend', label: 'Backend', sortable: true }
  ],
  searchFilters: [{ key: 'user_id', label: 'User ID', type: 'text' }],
  fields: [
    {
      key: 'id',
      label: 'User ID',
      type: 'text',
      required: true,
      readonlyOnEdit: true
    },
    {
      key: 'name',
      label: 'Name',
      type: 'text',
      required: true
    },
    {
      key: 'email',
      label: 'Email',
      type: 'text',
      required: true
    },
    {
      key: 'admin',
      label: 'Administrator',
      type: 'switch',
      defaultValue: false
    },
    {
      key: 'backend',
      label: 'Backend',
      type: 'readonly',
      hiddenOnCreate: true
    },
    {
      key: 'password',
      label: 'Password',
      type: 'double-password',
      required: true,
      hiddenOnEdit: true
    },
    {
      key: 'password_change',
      label: 'Change Password',
      type: 'double-password',
      hiddenOnCreate: true
    },
    {
      key: 'permissions',
      label: 'Permissions',
      type: 'chip-list',
      hiddenOnCreate: true
    }
  ],
  permissions: {
    create: (hasPerm) => hasPerm(PERMISSIONS.USERS.CREATE),
    edit: (hasPerm) => hasPerm(PERMISSIONS.USERS.UPDATE),
    delete: (hasPerm) => hasPerm(PERMISSIONS.USERS.DELETE)
  }
}

export const usersCredentials: ResourceDefinition = {
  name: 'users/credentials',
  label: 'Credential',
  labelPlural: 'Credentials',
  apiBase: (route: RouteLocationNormalized) =>
    `/api/v1/users/${route.params.user}/credentials`,
  routeParam: 'credential',
  routeNames: {
    search: 'UsersCredentialsSearch',
    crud: 'UsersCredentialsCRUD'
  },
  path: '/admin/users/:user/credentials',
  crudPath: '/admin/users/:user/credentials/:credential',
  breadcrumbs: {
    search: (route: RouteLocationNormalized) => [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'Administration' },
      { title: 'Users', to: { name: 'UsersSearch' } },
      {
        title: String(route.params.user),
        to: { name: 'UsersCRUD', params: { user: route.params.user } }
      },
      { title: 'Credentials' }
    ],
    crud: (route: RouteLocationNormalized) => [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'Administration' },
      { title: 'Users', to: { name: 'UsersSearch' } },
      {
        title: String(route.params.user),
        to: { name: 'UsersCRUD', params: { user: route.params.user } }
      },
      {
        title: 'Credentials',
        to: {
          name: 'UsersCredentialsSearch',
          params: { user: route.params.user }
        }
      },
      { title: String(route.params.credential) }
    ]
  },
  toolbar: {
    search: {
      title: 'Credentials',
      items: []
    },
    crud: {
      title: (route: RouteLocationNormalized) =>
        `Credential ${route.params.credential}`,
      items: []
    }
  },
  tableColumns: [
    {
      key: 'id',
      label: 'Credential ID',
      sortable: true,
      linkRoute: 'UsersCredentialsCRUD',
      linkParam: 'credential'
    },
    { key: 'description', label: 'Description', sortable: true },
    {
      key: 'created',
      label: 'Created',
      sortable: true,
      formatter: (value: unknown) => {
        return value ? new Date(String(value)).toLocaleString() : ''
      }
    }
  ],
  searchFilters: [],
  fields: [
    {
      key: 'id',
      label: 'Credential ID',
      type: 'readonly',
      hiddenOnCreate: true
    },
    {
      key: 'created',
      label: 'Created',
      type: 'readonly',
      hiddenOnCreate: true
    },
    {
      key: 'description',
      label: 'Description',
      type: 'text',
      required: true
    }
  ],
  permissions: {
    create: (hasPerm) => hasPerm(PERMISSIONS.USERS.CREDENTIALS.CREATE),
    edit: (hasPerm) => hasPerm(PERMISSIONS.USERS.CREDENTIALS.UPDATE),
    delete: (hasPerm) => hasPerm(PERMISSIONS.USERS.CREDENTIALS.DELETE)
  }
}

export const pyppetdbNodes: ResourceDefinition = {
  name: 'pyppetdb/nodes',
  label: 'PyppetDB Node',
  labelPlural: 'PyppetDB Nodes',
  apiBase: '/api/v1/pyppetdb_nodes',
  routeParam: 'node_id',
  routeNames: {
    search: 'PyppetdbNodesSearch',
    crud: 'PyppetdbNodesCRUD'
  },
  path: '/admin/pyppetdb/nodes',
  crudPath: '/admin/pyppetdb/nodes/:node_id',
  nav: {
    label: 'PyppetDB Nodes',
    icon: 'Cpu',
    group: 'Administration',
    groupOrder: 6,
    order: 3
  },
  breadcrumbs: {
    search: [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'Administration' },
      { title: 'PyppetDB Nodes' }
    ],
    crud: (route: RouteLocationNormalized) => [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'Administration' },
      { title: 'PyppetDB Nodes', to: { name: 'PyppetdbNodesSearch' } },
      { title: String(route.params.node_id) }
    ]
  },
  toolbar: {
    search: {
      title: 'PyppetDB Nodes',
      items: []
    },
    crud: {
      title: (route: RouteLocationNormalized) =>
        `PyppetDB Node ${route.params.node_id}`,
      items: []
    }
  },
  tableColumns: [
    {
      key: 'id',
      label: 'Node ID',
      sortable: true,
      linkRoute: 'PyppetdbNodesCRUD',
      linkParam: 'node_id'
    },
    {
      key: 'heartbeat',
      label: 'Heartbeat',
      sortable: true,
      formatter: (value: unknown) => {
        return value ? new Date(String(value)).toLocaleString() : ''
      }
    },
    {
      key: 'online_since',
      label: 'Online Since',
      sortable: true,
      formatter: (value: unknown) => {
        return value ? new Date(String(value)).toLocaleString() : ''
      }
    }
  ],
  searchFilters: [],
  fields: [
    {
      key: 'id',
      label: 'Node ID',
      type: 'readonly'
    },
    {
      key: 'heartbeat',
      label: 'Heartbeat',
      type: 'readonly'
    },
    {
      key: 'online_since',
      label: 'Online Since',
      type: 'readonly'
    }
  ],
  permissions: {
    create: () => false,
    edit: () => false,
    delete: (hasPerm) => hasPerm(PERMISSIONS.PYPPETDB.NODES.DELETE)
  }
}
