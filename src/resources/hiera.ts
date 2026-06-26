import type { RouteLocationNormalized } from 'vue-router'
import type { ResourceDefinition } from '@/types/resources'
import { PERMISSIONS } from '@/constants/permissions'
import HieraLevelDataForm from '@/components/special/HieraLevelDataForm.vue'
import HieraLookupForm from '@/components/special/HieraLookupForm.vue'
import HieraKeyModelsDynamicForm from '@/components/special/HieraKeyModelsDynamicForm.vue'

export const hieraKeys: ResourceDefinition = {
  name: 'hiera/keys',
  label: 'Hiera Key',
  labelPlural: 'Hiera Keys',
  apiBase: '/api/v1/hiera/keys',
  routeParam: 'key_id',
  routeNames: {
    search: 'HieraKeysSearch',
    crud: 'HieraKeysCRUD'
  },
  path: '/hiera/keys',
  crudPath: '/hiera/keys/:key_id',
  nav: {
    label: 'Keys',
    icon: 'Key',
    group: 'Hiera',
    groupOrder: 2,
    order: 3
  },
  breadcrumbs: {
    search: [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'Hiera' },
      { title: 'Keys' }
    ],
    crud: (route: RouteLocationNormalized) => [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'Hiera' },
      { title: 'Keys', to: { name: 'HieraKeysSearch' } },
      { title: String(route.params.key_id) }
    ]
  },
  toolbar: {
    search: {
      title: 'Hiera Keys',
      items: []
    },
    crud: {
      title: (route: RouteLocationNormalized) =>
        `Hiera Key ${route.params.key_id}`,
      items: []
    }
  },
  tableColumns: [
    {
      key: 'id',
      label: 'Key ID',
      sortable: true,
      linkRoute: 'HieraKeysCRUD',
      linkParam: 'key_id'
    },
    { key: 'team', label: 'Team', sortable: true },
    { key: 'model', label: 'Model', sortable: true }
  ],
  searchFilters: [{ key: 'key_id', label: 'Key ID', type: 'text' }],
  fields: [
    {
      key: 'id',
      label: 'Key ID',
      type: 'text',
      required: true,
      readonlyOnEdit: true
    },
    { key: 'team', label: 'Team', type: 'text', required: true },
    {
      key: 'model',
      label: 'Model ID',
      type: 'autocomplete',
      required: true,
      autocomplete: {
        endpoint: (formData: Record<string, any>) => {
          const type = formData.model_type || 'static'
          return `/api/v1/hiera/key_models/${type}`
        },
        field: 'key_model_id',
        responseField: 'id'
      }
    },
    {
      key: 'model_type',
      label: 'Model Type',
      type: 'select',
      required: true,
      options: [
        { label: 'Static', value: 'static' },
        { label: 'Dynamic', value: 'dynamic' }
      ]
    }
  ],
  permissions: {
    create: (hasPerm) => hasPerm(PERMISSIONS.HIERA.KEYS.CREATE),
    edit: (hasPerm) => hasPerm(PERMISSIONS.HIERA.KEYS.UPDATE),
    delete: (hasPerm) => hasPerm(PERMISSIONS.HIERA.KEYS.DELETE)
  }
}

export const hieraLevels: ResourceDefinition = {
  name: 'hiera/levels',
  label: 'Hiera Level',
  labelPlural: 'Hiera Levels',
  apiBase: '/api/v1/hiera/levels',
  routeParam: 'level_id',
  routeNames: {
    search: 'HieraLevelsSearch',
    crud: 'HieraLevelsCRUD'
  },
  path: '/hiera/levels',
  crudPath: '/hiera/levels/:level_id',
  nav: {
    label: 'Levels',
    icon: 'Layers',
    group: 'Hiera',
    groupOrder: 2,
    order: 4
  },
  breadcrumbs: {
    search: [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'Hiera' },
      { title: 'Levels' }
    ],
    crud: (route: RouteLocationNormalized) => [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'Hiera' },
      { title: 'Levels', to: { name: 'HieraLevelsSearch' } },
      { title: String(route.params.level_id) }
    ]
  },
  toolbar: {
    search: {
      title: 'Hiera Levels',
      items: []
    },
    crud: {
      title: (route: RouteLocationNormalized) =>
        `Hiera Level ${route.params.level_id}`,
      items: []
    }
  },
  tableColumns: [
    {
      key: 'id',
      label: 'Level ID',
      sortable: true,
      linkRoute: 'HieraLevelsCRUD',
      linkParam: 'level_id'
    },
    { key: 'priority', label: 'Priority', sortable: true }
  ],
  searchFilters: [],
  fields: [
    {
      key: 'id',
      label: 'Level ID',
      type: 'text',
      required: true,
      readonlyOnEdit: true
    },
    { key: 'priority', label: 'Priority', type: 'number', required: true }
  ],
  permissions: {
    create: (hasPerm) => hasPerm(PERMISSIONS.HIERA.LEVELS.CREATE),
    edit: (hasPerm) => hasPerm(PERMISSIONS.HIERA.LEVELS.UPDATE),
    delete: (hasPerm) => hasPerm(PERMISSIONS.HIERA.LEVELS.DELETE)
  }
}

export const hieraLevelData: ResourceDefinition = {
  name: 'hiera/data',
  label: 'Hiera Level Data',
  labelPlural: 'Hiera Level Data',
  apiBase: '/api/v1/hiera/data',
  routeParam: 'data_id',
  routeNames: {
    search: 'HieraLevelDataSearch',
    crud: 'HieraLevelDataCRUD'
  },
  path: '/hiera/data',
  crudPath: '/hiera/data/:level_id/:data_id/:key_id',
  customFormComponent: HieraLevelDataForm,
  creationParams: {
    level_id: '_new',
    data_id: '_new',
    key_id: '_new'
  },
  nav: {
    label: 'Level Data',
    icon: 'Database',
    group: 'Hiera',
    groupOrder: 2,
    order: 5
  },
  breadcrumbs: {
    search: [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'Hiera' },
      { title: 'Level Data' }
    ],
    crud: (route: RouteLocationNormalized) => [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'Hiera' },
      { title: 'Level Data', to: { name: 'HieraLevelDataSearch' } },
      {
        title: `${route.params.level_id}/${route.params.data_id}/${route.params.key_id}`
      }
    ]
  },
  toolbar: {
    search: {
      title: 'Hiera Level Data',
      items: []
    },
    crud: {
      title: (route: RouteLocationNormalized) =>
        `Level Data ${route.params.level_id}/${route.params.data_id}/${route.params.key_id}`,
      items: []
    }
  },
  tableColumns: [
    {
      key: 'id',
      label: 'Data ID',
      sortable: true,
      linkRoute: 'HieraLevelDataCRUD',
      linkParams: {
        level_id: 'level_id',
        data_id: 'id',
        key_id: 'key_id'
      }
    },
    { key: 'level_id', label: 'Level', sortable: true },
    { key: 'key_id', label: 'Key', sortable: true },
    { key: 'encrypted', label: 'Encrypted', sortable: true }
  ],
  searchFilters: [
    { key: 'level_id', label: 'Level ID', type: 'text' },
    { key: 'data_id', label: 'Data ID', type: 'text' },
    { key: 'key_id', label: 'Key ID', type: 'text' }
  ],
  fields: [],
  permissions: {
    create: (hasPerm) => hasPerm(PERMISSIONS.HIERA.LEVEL_DATA.CREATE),
    edit: (hasPerm) => hasPerm(PERMISSIONS.HIERA.LEVEL_DATA.UPDATE),
    delete: (hasPerm) => hasPerm(PERMISSIONS.HIERA.LEVEL_DATA.DELETE)
  }
}

export const hieraKeyModelsStatic: ResourceDefinition = {
  name: 'hiera/key_models/static',
  label: 'Key Model Static',
  labelPlural: 'Key Models Static',
  apiBase: '/api/v1/hiera/key_models/static',
  routeParam: 'key_model_id',
  routeNames: {
    search: 'HieraKeyModelsStaticSearch',
    crud: 'HieraKeyModelsStaticCRUD'
  },
  path: '/hiera/key_models/static',
  crudPath: '/hiera/key_models/static/:key_model_id',
  customFormComponent: HieraKeyModelsDynamicForm,
  nav: {
    label: 'Key Models Static',
    icon: 'FileCode',
    group: 'Hiera',
    groupOrder: 2,
    order: 1
  },
  breadcrumbs: {
    search: [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'Hiera' },
      { title: 'Key Models Static' }
    ],
    crud: (route: RouteLocationNormalized) => [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'Hiera' },
      {
        title: 'Key Models Static',
        to: { name: 'HieraKeyModelsStaticSearch' }
      },
      { title: String(route.params.key_model_id) }
    ]
  },
  toolbar: {
    search: {
      title: 'Hiera Key Models Static',
      items: []
    },
    crud: {
      title: (route: RouteLocationNormalized) =>
        `Key Model ${route.params.key_model_id}`,
      items: []
    }
  },
  tableColumns: [
    {
      key: 'id',
      label: 'Model ID',
      sortable: true,
      linkRoute: 'HieraKeyModelsStaticCRUD',
      linkParam: 'key_model_id'
    },
    { key: 'description', label: 'Description', sortable: false }
  ],
  searchFilters: [{ key: 'key_model_id', label: 'Model ID', type: 'text' }],
  fields: [
    {
      key: 'id',
      label: 'Model ID',
      type: 'text',
      required: true,
      readonlyOnEdit: true
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea',
      required: false
    },
    { key: 'model', label: 'Model (JSON)', type: 'textarea', required: true }
  ],
  permissions: {
    create: (hasPerm) => hasPerm(PERMISSIONS.HIERA.KEYS.CREATE),
    edit: (hasPerm) => hasPerm(PERMISSIONS.HIERA.KEYS.UPDATE),
    delete: (hasPerm) => hasPerm(PERMISSIONS.HIERA.KEYS.DELETE)
  }
}

export const hieraKeyModelsDynamic: ResourceDefinition = {
  name: 'hiera/key_models/dynamic',
  label: 'Key Model Dynamic',
  labelPlural: 'Key Models Dynamic',
  apiBase: '/api/v1/hiera/key_models/dynamic',
  routeParam: 'key_model_id',
  routeNames: {
    search: 'HieraKeyModelsDynamicSearch',
    crud: 'HieraKeyModelsDynamicCRUD'
  },
  path: '/hiera/key_models/dynamic',
  crudPath: '/hiera/key_models/dynamic/:key_model_id',
  customFormComponent: HieraKeyModelsDynamicForm,
  nav: {
    label: 'Key Models Dynamic',
    icon: 'FileJson',
    group: 'Hiera',
    groupOrder: 2,
    order: 2
  },
  breadcrumbs: {
    search: [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'Hiera' },
      { title: 'Key Models Dynamic' }
    ],
    crud: (route: RouteLocationNormalized) => [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'Hiera' },
      {
        title: 'Key Models Dynamic',
        to: { name: 'HieraKeyModelsDynamicSearch' }
      },
      { title: String(route.params.key_model_id) }
    ]
  },
  toolbar: {
    search: {
      title: 'Hiera Key Models Dynamic',
      items: []
    },
    crud: {
      title: (route: RouteLocationNormalized) =>
        `Key Model ${route.params.key_model_id}`,
      items: []
    }
  },
  tableColumns: [
    {
      key: 'id',
      label: 'Model ID',
      sortable: true,
      linkRoute: 'HieraKeyModelsDynamicCRUD',
      linkParam: 'key_model_id'
    },
    { key: 'description', label: 'Description', sortable: false }
  ],
  searchFilters: [{ key: 'key_model_id', label: 'Model ID', type: 'text' }],
  fields: [
    {
      key: 'id',
      label: 'Model ID',
      type: 'text',
      required: true,
      readonlyOnEdit: true
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea',
      required: false
    },
    { key: 'model', label: 'Model (JSON)', type: 'textarea', required: true }
  ],
  permissions: {
    create: (hasPerm) => hasPerm(PERMISSIONS.HIERA.KEY_MODELS_DYNAMIC.CREATE),
    edit: () => false,
    delete: (hasPerm) => hasPerm(PERMISSIONS.HIERA.KEY_MODELS_DYNAMIC.DELETE)
  }
}

export const hieraLookup: ResourceDefinition = {
  name: 'hiera/lookup',
  label: 'Lookup',
  labelPlural: 'Lookup',
  apiBase: '/api/v1/hiera/lookup',
  routeParam: 'key',
  routeNames: {
    search: 'HieraLookupSearch',
    crud: ''
  },
  path: '/hiera/lookup',
  searchOnly: true,
  customSearchComponent: HieraLookupForm,
  nav: {
    label: 'Lookup',
    icon: 'Search',
    group: 'Hiera',
    groupOrder: 2,
    order: 6
  },
  breadcrumbs: {
    search: [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'Hiera' },
      { title: 'Lookup' }
    ],
    crud: () => []
  },
  toolbar: {
    search: {
      title: 'Hiera Lookup',
      items: []
    },
    crud: {
      title: '',
      items: []
    }
  },
  tableColumns: [
    { key: 'key', label: 'Key Name', sortable: true },
    { key: 'value', label: 'Value', sortable: true },
    { key: 'level', label: 'Level', sortable: true },
    { key: 'data_id', label: 'Data ID', sortable: true }
  ],
  searchFilters: [
    { key: 'key', label: 'Key ID', type: 'text' },
    { key: 'node', label: 'Node Name', type: 'text' }
  ],
  fields: [],
  permissions: {}
}
