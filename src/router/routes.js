// Composable
import { createRouter, createWebHistory } from "vue-router";
import routesLogin from "./routes_login.js"
import routesNodesGroups from "./routes_nodes_groups.js"
import routesTeams from "./routes_teams.js"
import routesUsers from "./routes_users.js"
import routesUsersCredentials from "./routes_users_credentials"

const routes = [
    ...routesLogin,
    ...routesNodesGroups,
    ...routesTeams,
    ...routesUsers,
    ...routesUsersCredentials,
  {
    path: "/",
    component: () => import("@/layouts/default/Default.vue"),
    meta: {
      breadCrumb: [
        {
          title: "Pyppetdb",
          to: { name: "Home" },
        },
      ],
      toolBar(route) {
        return {
          title: `Home`,
          items: [],
        };
      },
    },
    children: [
      {
        path: "",
        name: "Home",
        component: () =>
          import(/* webpackChunkName: "home" */ "@/views/Home.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
