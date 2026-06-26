import type { RouteRecordRaw } from 'vue-router'
import { resources } from '@/resources'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import ResourceSearchView from '@/views/ResourceSearchView.vue'
import ResourceCrudView from '@/views/ResourceCrudView.vue'

export function generateResourceRoutes(): RouteRecordRaw[] {
  const routes: RouteRecordRaw[] = []

  for (const resource of Object.values(resources)) {
    const searchPath = resource.path || `/${resource.name}`
    const crudPath =
      resource.crudPath || `/${resource.name}/:${resource.routeParam}`

    routes.push({
      path: '/',
      component: DefaultLayout,
      children: [
        {
          path: searchPath.replace(/^\//, ''),
          name: resource.routeNames.search,
          component: resource.customSearchComponent || ResourceSearchView,
          meta: { resource },
          props: (route) => ({ resourceDef: route.meta.resource })
        }
      ]
    })

    if (!resource.searchOnly) {
      routes.push({
        path: '/',
        component: DefaultLayout,
        children: [
          {
            path: crudPath.replace(/^\//, ''),
            name: resource.routeNames.crud,
            component: resource.customFormComponent || ResourceCrudView,
            meta: { resource },
            props: (route) => ({ resourceDef: route.meta.resource })
          }
        ]
      })
    }
  }

  return routes
}
