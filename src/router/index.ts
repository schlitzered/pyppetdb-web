import { createRouter } from 'vue-router'
import { createWebHistory } from 'vue-router'
import authRoutes from '@/router/auth'
import { generateResourceRoutes } from '@/router/resources'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import HomeView from '@/views/HomeView.vue'

const routes = [
  ...authRoutes,
  {
    path: '/',
    component: DefaultLayout,
    meta: {
      breadCrumb: [
        {
          title: 'Pyppetdb',
          to: { name: 'Home' }
        }
      ],
      toolBar() {
        return {
          title: 'Home',
          items: []
        }
      }
    },
    children: [
      {
        path: '',
        name: 'Home',
        component: HomeView
      }
    ]
  },
  ...generateResourceRoutes()
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
