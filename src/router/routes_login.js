const routeLogin = {
        path: "/login",
        component: () => import("@/layouts/default/Default.vue"),
        meta: {
            breadCrumb: [
                {
                    title: "Login",
                    to: { name: "Login" },
                },
            ],
        },
        children: [
            {
                path: "",
                name: "Login",
                component: () => import("@/views/Login.vue"),
            },
        ],
    }

const routeLogout = {
        path: "/login_logout",
        component: () => import("@/layouts/default/Default.vue"),
        meta: {
            breadCrumb: [
                {
                    title: "Login Logout",
                    to: { name: "Login" },
                },
            ],
        },
        children: [
            {
                path: "",
                name: "LoginLogout",
                component: () => import("@/views/LoginLogout.vue"),
            },
        ],
    }

const routeLoginError = {
        path: "/login_error",
        component: () => import("@/layouts/default/Default.vue"),
        meta: {
            breadCrumb: [
                {
                    title: "Login Error",
                    to: { name: "Login" },
                },
            ],
        },
        children: [
            {
                path: "",
                name: "LoginError",
                component: () => import("@/views/LoginError.vue"),
            },
        ],
    }


const routesLogin = [
    routeLogin,
    routeLogout,
    routeLoginError,
]

export default routesLogin;