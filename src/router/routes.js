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
// Composable
import { createRouter, createWebHistory } from 'vue-router'
import routesLogin from './routes_login.js'
import routesHieraKeyModelsStatic from './routes_hiera_key_models_static.js'
import routesHieraKeyModelsDynamic from './routes_hiera_key_models_dynamic.js'
import routesHieraKeys from './routes_hiera_keys.js'
import routesHieraLevels from './routes_hiera_levels.js'
import routesHieraLevelData from './routes_hiera_level_data.js'
import routesHieraLookup from './routes_hiera_lookup.js'
import routesNodes from './routes_nodes.js'
import routesNodesGroups from './routes_nodes_groups.js'
import routesNodesReports from './routes_nodes_reports.js'
import routesTeams from './routes_teams.js'
import routesUsers from './routes_users.js'
import routesUsersCredentials from './routes_users_credentials.js'
import routesCAAuthorities from './routes_ca_authorities.js'
import routesCAAuthoritiesCerts from './routes_ca_authorities_certs.js'
import routesCASpaces from './routes_ca_spaces.js'
import routesCASpacesCerts from './routes_ca_spaces_certs.js'
import routesPyppetdbNodes from './routes_pyppetdb_nodes.js'
import routesJobs from './routes_jobs.js'
import routesNodesSecretsRedactor from './routes_nodes_secrets_redactor.js'

const routes = [
  ...routesLogin,
  ...routesHieraKeyModelsStatic,
  ...routesHieraKeyModelsDynamic,
  ...routesHieraKeys,
  ...routesHieraLevels,
  ...routesHieraLevelData,
  ...routesHieraLookup,
  ...routesNodes,
  ...routesNodesGroups,
  ...routesNodesReports,
  ...routesTeams,
  ...routesUsers,
  ...routesUsersCredentials,
  ...routesCAAuthorities,
  ...routesCAAuthoritiesCerts,
  ...routesCASpaces,
  ...routesCASpacesCerts,
  ...routesPyppetdbNodes,
  ...routesJobs,
  ...routesNodesSecretsRedactor,
  {
    path: '/',
    component: () => import('@/layouts/default/LayoutDefault.vue'),
    meta: {
      breadCrumb: [
        {
          title: 'Pyppetdb',
          to: { name: 'Home' }
        }
      ],
      toolBar() {
        return {
          title: `Home`,
          items: []
        }
      }
    },
    children: [
      {
        path: '',
        name: 'Home',
        component: () =>
          import(/* webpackChunkName: "home" */ '@/views/ViewHome.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
