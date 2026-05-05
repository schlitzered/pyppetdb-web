/*
 * Copyright 2026 Stephan Schultchen
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const routeCAAuthoritiesCertsSearch = {
  path: '/ca/authorities/:ca_id/certs',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    breadCrumb(route) {
      return [
        {
          title: 'Pyppetdb',
          to: { name: 'Home' }
        },
        {
          title: 'CA Authorities',
          to: { name: 'CAAuthoritiesSearch' }
        },
        {
          title: route.params.ca_id,
          to: {
            name: 'CAAuthoritiesCRUD',
            params: { ca_id: route.params.ca_id }
          }
        },
        {
          title: 'Certificates'
        }
      ]
    },
    toolBar(route) {
      return {
        title: `CA Authority ${route.params.ca_id} - Certificates`,
        items: []
      }
    }
  },
  children: [
    {
      path: '',
      name: 'CAAuthoritiesCertsSearch',
      component: () => import('@/views/ViewCAAuthoritiesCertsSearch.vue')
    }
  ]
}

const routeCAAuthoritiesCertsCRUD = {
  path: '/ca/authorities/:ca_id/certs/:cert_id',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    breadCrumb(route) {
      return [
        {
          title: 'Pyppetdb',
          to: { name: 'Home' }
        },
        {
          title: 'CA Authorities',
          to: { name: 'CAAuthoritiesSearch' }
        },
        {
          title: route.params.ca_id,
          to: {
            name: 'CAAuthoritiesCRUD',
            params: { ca_id: route.params.ca_id }
          }
        },
        {
          title: 'Certificates',
          to: {
            name: 'CAAuthoritiesCertsSearch',
            params: { ca_id: route.params.ca_id }
          }
        },
        {
          title: route.params.cert_id
        }
      ]
    },
    toolBar(route) {
      return {
        title: `Certificate ${route.params.cert_id}`,
        items: []
      }
    }
  },
  children: [
    {
      path: '',
      name: 'CAAuthoritiesCertsCRUD',
      component: () => import('@/views/ViewCAAuthoritiesCertsCRUD.vue')
    }
  ]
}

const routesCAAuthoritiesCerts = [
  routeCAAuthoritiesCertsSearch,
  routeCAAuthoritiesCertsCRUD
]

export default routesCAAuthoritiesCerts
