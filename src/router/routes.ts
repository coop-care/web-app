import { RouteConfig } from "vue-router";

const routes: RouteConfig[] = [
    {
        path: "/",
        component: () => import("layouts/MyLayout.vue"),
        children: [
            {
                path: "",
                redirect: "client"
            },
            {
                name: "client",
                path: "/client/:clientId?",
                component: () => import("pages/Client.vue"),
                children: [
                    {
                        name: "clientReminders",
                        path: "reminders/:day?"
                    },
                    {
                        name: "clientReport",
                        path: "report/:problemId?"
                    },
                    {
                        name: "clientHistory",
                        path: "history"
                    },
                    {
                        name: "clientMasterData",
                        path: "masterdata"
                    }
                ]
            },
            {
                name: "classification",
                path: "/client/:clientId/problem/:problemId/classification",
                component: () => import("pages/Classification.vue")
            },
            {
                name: "outcome",
                path: "/client/:clientId/problem/:problemId/outcome",
                component: () => import("pages/Rating.vue")
            },
            {
                name: "interventions",
                path: "/client/:clientId/problem/:problemId/intervention",
                component: () => import("pages/InterventionList.vue")
            },
            {
                name: "intervention",
                path:
                    "/client/:clientId/problem/:problemId/intervention/:interventionId",
                component: () => import("pages/Intervention.vue")
            },
            {
                name: "newIntervention",
                path: "/client/:clientId/intervention/new",
                component: () => import("pages/NewIntervention.vue")
            },
            {
                name: "problem",
                path: "/client/:clientId/problem/:problemId/:step?",
                component: () => import("pages/ProblemRecording.vue")
            },
            {
                name: "problemsByDiagnosis",
                path: "/client/:clientId/diagnoses",
                component: () => import("pages/ProblemsByDiagnosis.vue")
            },
            {
                name: "proofOfPerformance",
                path: "/client/:clientId/reports/execution",
                component: () => import("pages/ProofOfPerformance.vue")
            },
            {
                name: "userSettings",
                path: "/settings/user",
                component: () => import("pages/UserSettings.vue")
            },
            {
                name: "teamSettings",
                path: "/settings/team",
                component: () => import("pages/TeamSettings.vue")
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
