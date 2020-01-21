import { RouteConfig } from "vue-router";

const routes: RouteConfig[] = [
    {
        path: "/",
        component: () => import("layouts/MyLayout.vue"),
        children: [
            {
                name: "customer",
                path: "",
                component: () => import("pages/Customer.vue")
            },
            {
                name: "login",
                path: "/login",
                component: () => import("pages/Login.vue")
            },
            {
                name: "register",
                path: "/register",
                component: () => import("pages/Register.vue")
            },
            {
                name: "confirm",
                path: "/confirm",
                component: () => import("pages/Confirm.vue")
            },
            {
                name: "problem",
                path: "/customer/:customerId/problem/:problemId",
                component: () => import("pages/ProblemRecording.vue")
            },
            {
                name: "outcome",
                path: "/customer/:customerId/problem/:problemId/outcome",
                component: () => import("pages/Rating.vue")
            }
        ]
    }
];

// Always leave this as last one
if (process.env.MODE !== "ssr") {
    routes.push({
        path: "*",
        component: () => import("pages/Error404.vue")
    });
}

export default routes;
