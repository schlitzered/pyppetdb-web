import type { RouteRecordRaw } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import LoginView from '@/views/LoginView.vue'
import LoginErrorView from '@/views/LoginErrorView.vue'
import LogoutView from '@/views/LogoutView.vue'

export const authRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: DefaultLayout,
    meta: {
      hideNav: true
    },
    children: [
      {
        path: '',
        name: 'Login',
        component: LoginView
      }
    ]
  },
  {
    path: '/login_logout',
    component: DefaultLayout,
    meta: {
      hideNav: true
    },
    children: [
      {
        path: '',
        name: 'LoginLogout',
        component: LogoutView
      }
    ]
  },
  {
    path: '/login_error',
    component: DefaultLayout,
    meta: {
      hideNav: true
    },
    children: [
      {
        path: '',
        name: 'LoginError',
        component: LoginErrorView
      }
    ]
  }
]

export default authRoutes
