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
import { loginDataStore } from '@/store/login_data'
import { PERMISSIONS } from '@/common/permissions'

const routeTeamsSearch = {
  path: '/teams',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    appBar: {
      name: 'Teams',
      to: 'TeamsSearch',
      href: '/teams',
      requireAdmin: false,
      requiredPermission: PERMISSIONS.TEAMS.GET,
      icon: 'mdi-account-multiple',
      group: 'Administration',
      groupOrder: 3,
      order: 1
    },
    breadCrumb: [
      {
        title: 'Pyppetdb',
        to: { name: 'Home' }
      },
      {
        title: 'Teams',
        to: { name: 'TeamsSearch' }
      }
    ],
    toolBar() {
      const loginData = loginDataStore()
      return {
        title: `Teams`,
        items: [
          {
            title: 'New Team',
            to: { name: 'TeamsCRUD', params: { team: '_new' } },
            hide() {
              return !loginData.hasPermission(PERMISSIONS.TEAMS.CREATE)
            }
          }
        ]
      }
    }
  },
  children: [
    {
      path: '',
      name: 'TeamsSearch',
      component: () => import('@/views/ViewTeamsSearch.vue')
    }
  ]
}

const routeTeamsCrud = {
  path: '/teams/:team',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    breadCrumb(route) {
      return [
        {
          title: 'Pyppetdb',
          to: { name: 'Home' }
        },
        {
          title: 'Teams',
          to: { name: 'TeamsSearch' }
        },
        {
          title: route.params.team
        }
      ]
    },
    toolBar(route) {
      return {
        title: `Team ${route.params.team}`,
        items: []
      }
    }
  },
  children: [
    {
      path: '',
      name: 'TeamsCRUD',
      component: () => import('@/views/ViewTeamsCRUD.vue')
    }
  ]
}

const routesTeams = [routeTeamsSearch, routeTeamsCrud]

export default routesTeams
