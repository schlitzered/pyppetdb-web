const routeHieraLookupSearch = {
  path: '/hiera/lookup',
  component: () => import('@/layouts/default/LayoutDefault.vue'),
  meta: {
    appBar: {
      name: 'Lookup',
      to: 'HieraLookupSearch',
      href: '/hiera/lookup',
      requireAdmin: false,
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
