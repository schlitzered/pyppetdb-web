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
const routeHieraLookupSearch = {
  path: '/hiera/lookup',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    appBar: {
      name: 'Lookup',
      to: 'HieraLookupSearch',
      href: '/hiera/lookup',
      requireAdmin: false,
      requiredPermission: 'HIERA::GET',
      icon: 'mdi-magnify',
      group: 'Hiera',
      groupOrder: 2,
      order: 6
    },
    breadCrumb: [
      {
        title: 'Pyppetdb',
        to: { name: 'Home' }
      },
      {
        title: 'Hiera Lookup',
        to: { name: 'HieraLookupSearch' }
      }
    ],
    toolBar() {
      return {
        title: `Hiera Lookup`,
        items: []
      }
    }
  },
  children: [
    {
      path: '',
      name: 'HieraLookupSearch',
      component: () => import('@/views/ViewHieraLookupSearch.vue')
    }
  ]
}

const routesHieraLookup = [routeHieraLookupSearch]

export default routesHieraLookup
