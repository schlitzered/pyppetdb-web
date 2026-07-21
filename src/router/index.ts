import { createRouter } from 'vue-router'
import { createWebHistory } from 'vue-router'
import authRoutes from '@/router/auth'
import { generateResourceRoutes } from '@/router/resources'
import { authStore } from '@/stores/auth'

const routes = [
  ...authRoutes,
  {
    // Landing page. Redirect instead of rendering a nodes table here: the old
    // HomeView mounted a ResourceTable that immediately router.replace()'d to
    // NodesSearch, causing a double navigation + double fetch right after login.
    path: '/',
    name: 'Home',
    redirect: { name: 'NodesSearch' }
  },
  ...generateResourceRoutes()
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Resolve auth before a protected route renders, so the view (and its data
// requests) never fire against an unestablished session. This replaces the
// route-name watch that used to live in DefaultLayout.
router.beforeEach(async (to) => {
  const auth = authStore()

  if (to.name && String(to.name).startsWith('Login')) {
    auth.reset()
    return true
  }

  if (!auth.isLoaded) {
    try {
      await auth.fetchUserData()
    } catch {
      // On a 401 the client already reset auth and redirected to LoginError.
      return false
    }
  }

  return true
})

export default router
