import { RouteConfig } from "vue-router"

const isDemo = process.env.BACKEND == "demo";
const routes: RouteConfig[] = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        redirect: { name: "clientNoneSelected" }
      },
      {
        name: "clientNoneSelected",
        path: "/client",
        component: () => import("pages/Client.vue")
      },
      {
        name: "client",
        path: "/client/:clientId",
        redirect: { name: "clientMasterData" },
        component: () => import("pages/Client.vue"),
        children: [
          {
            name: "clientMasterData",
            path: "profile",
            component: () => import("components/ClientMasterData.vue"),
            children: [
              {
                name: "clientHealthInformation",
                path: "health",
                component: () => import("components/ClientHealthInformation.vue")
              },
              {
                name: "clientAgreements",
                path: "agreements",
                component: () => import("components/ClientAgreements.vue")
              },
              {
                name: "clientContactData",
                path: "contacts/client",
                component: () => import("components/ClientContactData.vue")
              },
              {
                name: "clientInformalContact",
                path: "contacts/informal/:informalContactId",
                component: () => import("components/ClientInformalContact.vue")
              },
              {
                name: "clientFormalContact",
                path: "contacts/formal/:formalContactId",
                component: () => import("components/ClientFormalContact.vue")
              }
            ]
          },
          {
            name: "clientReminders",
            path: "reminders/:day?",
            component: () => import("components/ClientReminders.vue")
          },
          {
            name: "clientReport",
            path: "report/:problemId?",
            component: () => import("components/ClientProblems.vue")
          },
          {
            name: "clientProofOfPerformance",
            path: "/client/:clientId/reports/execution",
            component: () => import("components/ProofOfPerformance.vue")
          },
          {
            name: "clientHistory",
            path: "/client/:clientId/history",
            component: () => import("components/ClientHistory.vue")
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
        name: "newInterventionForProblem",
        path: "/client/:clientId/problem/:problemId/intervention/new",
        component: () => import("pages/NewIntervention.vue")
      },
      // {
      //     name: "interventions",
      //     path: "/client/:clientId/problem/:problemId/intervention",
      //     component: () => import("pages/InterventionList.vue")
      // },
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
        path: !isDemo ? "/client/:clientId/diagnoses" : "",
        component: () => import("pages/ProblemsByDiagnosis.vue")
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
        name: "insights",
        path: "/insights",
        component: () => import("pages/Insights.vue")
      },
      {
        name: "login",
        path: !isDemo ? "/login" : "",
        component: () => import("pages/Login.vue")
      },
      {
        name: "register",
        path: !isDemo ? "/register" : "",
        component: () => import("pages/Register.vue")
      },
      {
        name: "confirm",
        path: !isDemo ? "/confirm" : "",
        component: () => import("pages/Confirm.vue")
      },
      {
        name: "requestPasswordReset",
        path: !isDemo ? "/requestpasswordreset" : "",
        component: () => import("pages/RequestPasswordReset.vue")
      },
      {
        name: "resetPassword",
        path: !isDemo ? "/passwordreset" : "",
        component: () => import("pages/PasswordReset.vue")
      },
      {
        name: "legalNotice",
        path: "/legal-notice",
        component: () => import("pages/Markdown.vue")
      },
      {
        name: "privacyPolicy",
        path: "/privacy-policy",
        component: () => import("pages/Markdown.vue")
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "*",
    component: () => import("pages/Error404.vue")
  }
]

export default routes
