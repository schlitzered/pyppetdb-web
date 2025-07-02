const routeTeamsSearch = {
    path: "/teams",
    component: () => import("@/layouts/default/Default.vue"),
    meta: {
        appBar: {
            name: "Teams",
            to: "TeamsSearch",
            href: "/teams",
            requireAdmin: true,
            icon: "mdi-account-multiple",
        },
        breadCrumb: [
            {
                title: "Pyppetdb",
                to: {name: "Home"},
            },
            {
                title: "Teams",
                to: {name: "TeamsSearch"},
            },
        ],
        toolBar(route) {
            return {
                title: `Teams`,
                items: [
                    {
                        title: "New Team",
                        to: {name: "TeamsCRUD", params: {team: "_new"}},
                        hide(route) {
                            return false;
                        },
                    },
                ],
            };
        },
    },
    children: [
        {
            path: "",
            name: "TeamsSearch",
            component: () => import("@/views/TeamsSearch.vue"),
        },
    ],
}

const routeTeamsCrud = {
    path: "/teams/:team",
    component: () => import("@/layouts/default/Default.vue"),
    meta: {
        breadCrumb(route) {
            return [
                {
                    title: "Pyppetdb",
                    to: {name: "Home"},
                },
                {
                    title: "Teams",
                    to: {name: "TeamsSearch"},
                },
                {
                    title: route.params.team,
                },
            ];
        },
        toolBar(route) {
            return {
                title: `Team ${route.params.team}`,
                items: [],
            };
        },
    },
    children: [
        {
            path: "",
            name: "TeamsCRUD",
            component: () => import("@/views/TeamsCRUD.vue"),
        },
    ],
}

const routesTeams = [
    routeTeamsSearch,
    routeTeamsCrud,
]

export default routesTeams;
