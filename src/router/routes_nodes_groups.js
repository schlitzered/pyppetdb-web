const routeNodesGroupsSearch = {
    path: "/nodes_groups",
    component: () => import("@/layouts/default/Default.vue"),
    meta: {
        appBar: {
            name: "NodesGroups",
            to: "NodesGroupsSearch",
            href: "/nodes_groups",
            requireAdmin: true,
            icon: "mdi-account-multiple",
        },
        breadCrumb: [
            {
                title: "Pyppetdb",
                to: {name: "Home"},
            },
            {
                title: "NodesGroups",
                to: {name: "NodesGroupsSearch"},
            },
        ],
        toolBar(route) {
            return {
                title: `NodesGroups`,
                items: [
                    {
                        title: "New Node Group",
                        to: {name: "NodesGroupsCRUD", params: {node_group: "_new"}},
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
            name: "NodesGroupsSearch",
            component: () => import("@/views/NodesGroupsSearch.vue"),
        },
    ],
}

const routeNodesGroupsCrud = {
    path: "/nodes_groups/:node_group",
    component: () => import("@/layouts/default/Default.vue"),
    meta: {
        breadCrumb(route) {
            return [
                {
                    title: "Pyppetdb",
                    to: {name: "Home"},
                },
                {
                    title: "NodesGroups",
                    to: {name: "NodesGroupsSearch"},
                },
                {
                    title: route.params.node_group,
                },
            ];
        },
        toolBar(route) {
            return {
                title: `NodeGroup ${route.params.node_group}`,
                items: [],
            };
        },
    },
    children: [
        {
            path: "",
            name: "NodesGroupsCRUD",
            component: () => import("@/views/NodesGroupsCRUD.vue"),
        },
    ],
}

const routesNodesGroups = [
    routeNodesGroupsSearch,
    routeNodesGroupsCrud,
]

export default routesNodesGroups;
