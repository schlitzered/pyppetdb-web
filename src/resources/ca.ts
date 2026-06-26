import type { RouteLocationNormalized } from 'vue-router'
import type { ResourceDefinition } from '@/types/resources'
import { PERMISSIONS } from '@/constants/permissions'
import router from '@/router'
import CASpacesCertsSearch from '@/components/special/CASpacesCertsSearch.vue'
import CASpacesCertsForm from '@/components/special/CASpacesCertsForm.vue'
import CAAuthoritiesSearch from '@/components/special/CAAuthoritiesSearch.vue'
import CAAuthoritiesForm from '@/components/special/CAAuthoritiesForm.vue'
import CASpacesSearch from '@/components/special/CASpacesSearch.vue'
import CASpacesForm from '@/components/special/CASpacesForm.vue'

export const caAuthorities: ResourceDefinition = {
  name: 'ca/authorities',
  label: 'CA Authority',
  labelPlural: 'CA Authorities',
  apiBase: '/api/v1/ca/authorities',
  routeParam: 'ca_id',
  routeNames: {
    search: 'CAAuthoritiesSearch',
    crud: 'CAAuthoritiesCRUD'
  },
  path: '/ca/authorities',
  crudPath: '/ca/authorities/:ca_id',
  nav: {
    label: 'CA Authorities',
    icon: 'Shield',
    group: 'CA',
    groupOrder: 4,
    order: 1
  },
  breadcrumbs: {
    search: [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'CA' },
      { title: 'Authorities' }
    ],
    crud: (route: RouteLocationNormalized) => [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'CA' },
      { title: 'Authorities', to: { name: 'CAAuthoritiesSearch' } },
      { title: String(route.params.ca_id) }
    ]
  },
  toolbar: {
    search: {
      title: 'CA Authorities',
      items: []
    },
    crud: {
      title: (route: RouteLocationNormalized) =>
        `CA Authority ${route.params.ca_id}`,
      items: [
        {
          label: 'Certificates',
          icon: 'FileText',
          to: (route: RouteLocationNormalized) => ({
            name: 'CAAuthoritiesCertsSearch',
            params: { ca_id: route.params.ca_id }
          })
        }
      ]
    }
  },
  tableColumns: [
    {
      key: 'id',
      label: 'CA ID',
      sortable: true,
      linkRoute: 'CAAuthoritiesCRUD',
      linkParam: 'ca_id'
    },
    { key: 'cn', label: 'Common Name', sortable: false },
    { key: 'issuer', label: 'Issuer', sortable: false },
    { key: 'status', label: 'Status', sortable: false }
  ],
  searchFilters: [
    { key: 'ca_id', label: 'CA ID', type: 'text' },
    { key: 'parent_id', label: 'Parent CA ID', type: 'text' },
    { key: 'cn', label: 'Common Name', type: 'text' },
    { key: 'fingerprint', label: 'Fingerprint', type: 'text' },
    { key: 'internal', label: 'Internal', type: 'text' }
  ],
  fields: [],
  customSearchComponent: CAAuthoritiesSearch,
  customFormComponent: CAAuthoritiesForm,
  permissions: {
    create: (hasPerm) => hasPerm(PERMISSIONS.CA.AUTHORITIES.CREATE),
    edit: (hasPerm) => hasPerm(PERMISSIONS.CA.AUTHORITIES.UPDATE),
    delete: (hasPerm) => hasPerm(PERMISSIONS.CA.AUTHORITIES.DELETE)
  }
}

export const caAuthoritiesCerts: ResourceDefinition = {
  name: 'ca/authorities/certs',
  label: 'Authority Certificate',
  labelPlural: 'Authority Certificates',
  apiBase: (route: RouteLocationNormalized) =>
    `/api/v1/ca/authorities/${route.params.ca_id}/certs`,
  routeParam: 'cert_id',
  routeNames: {
    search: 'CAAuthoritiesCertsSearch',
    crud: 'CAAuthoritiesCertsCRUD'
  },
  path: '/ca/authorities/:ca_id/certs',
  crudPath: '/ca/authorities/:ca_id/certs/:cert_id',
  breadcrumbs: {
    search: (route: RouteLocationNormalized) => [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'CA' },
      { title: 'Authorities', to: { name: 'CAAuthoritiesSearch' } },
      {
        title: String(route.params.ca_id),
        to: { name: 'CAAuthoritiesCRUD', params: { ca_id: route.params.ca_id } }
      },
      { title: 'Certificates' }
    ],
    crud: (route: RouteLocationNormalized) => [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'CA' },
      { title: 'Authorities', to: { name: 'CAAuthoritiesSearch' } },
      {
        title: String(route.params.ca_id),
        to: { name: 'CAAuthoritiesCRUD', params: { ca_id: route.params.ca_id } }
      },
      {
        title: 'Certificates',
        to: {
          name: 'CAAuthoritiesCertsSearch',
          params: { ca_id: route.params.ca_id }
        }
      },
      { title: String(route.params.cert_id) }
    ]
  },
  toolbar: {
    search: {
      title: 'Authority Certificates',
      items: []
    },
    crud: {
      title: (route: RouteLocationNormalized) =>
        `Certificate ${route.params.cert_id}`,
      items: []
    }
  },
  tableColumns: [
    {
      key: 'id',
      label: 'Cert ID',
      sortable: true,
      linkRoute: 'CAAuthoritiesCertsCRUD',
      linkParam: 'cert_id'
    },
    {
      key: 'cn',
      label: 'Common Name',
      sortable: true,
      linkRoute: 'NodesCRUD',
      linkParam: 'node'
    },
    { key: 'status', label: 'Status', sortable: true }
  ],
  searchFilters: [{ key: 'cn', label: 'Common Name', type: 'text' }],
  fields: [],
  permissions: {
    create: (hasPerm) => {
      const caId = router.currentRoute.value.params.ca_id
      return hasPerm(PERMISSIONS.CA.AUTHORITIES.CERTS.CREATE(String(caId)))
    },
    edit: (hasPerm) => {
      const caId = router.currentRoute.value.params.ca_id
      return hasPerm(PERMISSIONS.CA.AUTHORITIES.CERTS.UPDATE(String(caId)))
    },
    delete: (hasPerm) => {
      const caId = router.currentRoute.value.params.ca_id
      return hasPerm(PERMISSIONS.CA.AUTHORITIES.CERTS.DELETE(String(caId)))
    }
  }
}

export const caSpaces: ResourceDefinition = {
  name: 'ca/spaces',
  label: 'CA Space',
  labelPlural: 'CA Spaces',
  apiBase: '/api/v1/ca/spaces',
  routeParam: 'space_id',
  routeNames: {
    search: 'CASpacesSearch',
    crud: 'CASpacesCRUD'
  },
  path: '/ca/spaces',
  crudPath: '/ca/spaces/:space_id',
  nav: {
    label: 'CA Spaces',
    icon: 'FolderKey',
    group: 'CA',
    groupOrder: 4,
    order: 2
  },
  breadcrumbs: {
    search: [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'CA' },
      { title: 'Spaces' }
    ],
    crud: (route: RouteLocationNormalized) => [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'CA' },
      { title: 'Spaces', to: { name: 'CASpacesSearch' } },
      { title: String(route.params.space_id) }
    ]
  },
  toolbar: {
    search: {
      title: 'CA Spaces',
      items: []
    },
    crud: {
      title: (route: RouteLocationNormalized) =>
        `CA Space ${route.params.space_id}`,
      items: [
        {
          label: 'Certificates',
          icon: 'FileText',
          to: (route: RouteLocationNormalized) => ({
            name: 'CASpacesCertsSearch',
            params: { space_id: route.params.space_id }
          })
        }
      ]
    }
  },
  tableColumns: [
    {
      key: 'id',
      label: 'Space ID',
      sortable: true,
      linkRoute: 'CASpacesCRUD',
      linkParam: 'space_id'
    },
    { key: 'ca_id', label: 'CA ID', sortable: true },
    { key: 'description', label: 'Description', sortable: false }
  ],
  searchFilters: [
    { key: 'space_id', label: 'Space ID', type: 'text' },
    { key: 'ca_id', label: 'CA ID', type: 'text' }
  ],
  fields: [],
  customSearchComponent: CASpacesSearch,
  customFormComponent: CASpacesForm,
  permissions: {
    create: (hasPerm) => hasPerm(PERMISSIONS.CA.SPACES.CREATE),
    edit: (hasPerm) => hasPerm(PERMISSIONS.CA.SPACES.UPDATE),
    delete: (hasPerm) => hasPerm(PERMISSIONS.CA.SPACES.DELETE)
  }
}

export const caSpacesCerts: ResourceDefinition = {
  name: 'ca/spaces/certs',
  label: 'Space Certificate',
  labelPlural: 'Space Certificates',
  apiBase: (route: RouteLocationNormalized) =>
    `/api/v1/ca/spaces/${route.params.space_id}/certs`,
  routeParam: 'cert_id',
  routeNames: {
    search: 'CASpacesCertsSearch',
    crud: 'CASpacesCertsCRUD'
  },
  path: '/ca/spaces/:space_id/certs',
  crudPath: '/ca/spaces/:space_id/certs/:cert_id',
  breadcrumbs: {
    search: (route: RouteLocationNormalized) => [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'CA' },
      { title: 'Spaces', to: { name: 'CASpacesSearch' } },
      {
        title: String(route.params.space_id),
        to: {
          name: 'CASpacesCRUD',
          params: { space_id: route.params.space_id }
        }
      },
      { title: 'Certificates' }
    ],
    crud: (route: RouteLocationNormalized) => [
      { title: 'Pyppetdb', to: { name: 'Home' } },
      { title: 'CA' },
      { title: 'Spaces', to: { name: 'CASpacesSearch' } },
      {
        title: String(route.params.space_id),
        to: {
          name: 'CASpacesCRUD',
          params: { space_id: route.params.space_id }
        }
      },
      {
        title: 'Certificates',
        to: {
          name: 'CASpacesCertsSearch',
          params: { space_id: route.params.space_id }
        }
      },
      { title: String(route.params.cert_id) }
    ]
  },
  toolbar: {
    search: {
      title: 'Space Certificates',
      items: []
    },
    crud: {
      title: (route: RouteLocationNormalized) =>
        `Certificate ${route.params.cert_id}`,
      items: []
    }
  },
  tableColumns: [
    {
      key: 'id',
      label: 'Cert ID',
      sortable: true,
      linkRoute: 'CASpacesCertsCRUD',
      linkParam: 'cert_id'
    },
    {
      key: 'cn',
      label: 'Common Name',
      sortable: true,
      linkRoute: 'NodesCRUD',
      linkParam: 'node'
    },
    { key: 'status', label: 'Status', sortable: true }
  ],
  searchFilters: [
    { key: 'cert_id', label: 'Cert ID', type: 'text' },
    { key: 'cn', label: 'Common Name', type: 'text' },
    { key: 'status', label: 'Status', type: 'text' },
    { key: 'fingerprint', label: 'Fingerprint', type: 'text' },
    { key: 'serial_number', label: 'Serial Number', type: 'text' }
  ],
  fields: [],
  customSearchComponent: CASpacesCertsSearch,
  customFormComponent: CASpacesCertsForm,
  permissions: {
    create: (hasPerm) => {
      const spaceId = router.currentRoute.value.params.space_id
      return hasPerm(PERMISSIONS.CA.SPACES.CERTS.CREATE(String(spaceId)))
    },
    edit: (hasPerm) => {
      const spaceId = router.currentRoute.value.params.space_id
      return hasPerm(PERMISSIONS.CA.SPACES.CERTS.UPDATE(String(spaceId)))
    },
    delete: (hasPerm) => {
      const spaceId = router.currentRoute.value.params.space_id
      return hasPerm(PERMISSIONS.CA.SPACES.CERTS.DELETE(String(spaceId)))
    }
  }
}
