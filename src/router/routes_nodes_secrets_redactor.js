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

const routeNodesSecretsRedactorSearch = {
  path: '/nodes/secrets_redactor',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    appBar: {
      name: 'Secrets Redactor',
      to: 'NodesSecretsRedactorSearch',
      href: '/nodes/secrets_redactor',
      requireAdmin: false,
      icon: 'mdi-shield-lock',
      group: 'Nodes',
      groupOrder: 1,
      order: 4
    },
    breadCrumb: [
      {
        title: 'Pyppetdb',
        to: { name: 'Home' }
      },
      {
        title: 'Nodes Secrets Redactor',
        to: { name: 'NodesSecretsRedactorSearch' }
      }
    ],
    toolBar() {
      return {
        title: `Nodes Secrets Redactor`,
        items: [
          {
            title: 'New Redaction Value',
            to: {
              name: 'NodesSecretsRedactorCRUD',
              params: { secret_id: '_new' }
            },
            hide() {
              const loginData = loginDataStore()
              return !loginData.hasPermission(
                PERMISSIONS.NODES.SECRETS_REDACTOR.CREATE
              )
            }
          }
        ]
      }
    }
  },
  children: [
    {
      path: '',
      name: 'NodesSecretsRedactorSearch',
      component: () => import('@/views/ViewNodesSecretsRedactorSearch.vue')
    }
  ]
}

const routeNodesSecretsRedactorCRUD = {
  path: '/nodes/secrets_redactor/:secret_id',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    breadCrumb(route) {
      return [
        {
          title: 'Pyppetdb',
          to: { name: 'Home' }
        },
        {
          title: 'Nodes Secrets Redactor',
          to: { name: 'NodesSecretsRedactorSearch' }
        },
        {
          title: route.params.secret_id
        }
      ]
    },
    toolBar(route) {
      return {
        title: `Redaction Value ${route.params.secret_id}`,
        items: []
      }
    }
  },
  children: [
    {
      path: '',
      name: 'NodesSecretsRedactorCRUD',
      component: () => import('@/views/ViewNodesSecretsRedactorCRUD.vue')
    }
  ]
}

const routesNodesSecretsRedactor = [
  routeNodesSecretsRedactorSearch,
  routeNodesSecretsRedactorCRUD
]

export default routesNodesSecretsRedactor
