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
const routeLogin = {
  path: '/login',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    hideNav: true,
    breadCrumb: [
      {
        title: 'Login',
        to: { name: 'Login' }
      }
    ]
  },
  children: [
    {
      path: '',
      name: 'Login',
      component: () => import('@/views/ViewLogin.vue')
    }
  ]
}

const routeLogout = {
  path: '/login_logout',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    hideNav: true,
    breadCrumb: [
      {
        title: 'Login Logout',
        to: { name: 'Login' }
      }
    ]
  },
  children: [
    {
      path: '',
      name: 'LoginLogout',
      component: () => import('@/views/ViewLoginLogout.vue')
    }
  ]
}

const routeLoginError = {
  path: '/login_error',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    hideNav: true,
    breadCrumb: [
      {
        title: 'Login Error',
        to: { name: 'Login' }
      }
    ]
  },
  children: [
    {
      path: '',
      name: 'LoginError',
      component: () => import('@/views/ViewLoginError.vue')
    }
  ]
}

const routesLogin = [routeLogin, routeLogout, routeLoginError]

export default routesLogin
