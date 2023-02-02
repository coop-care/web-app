import { RouteConfig } from "vue-router";
import store from "../store";

const isDemo = store.direct.getters.isDemo;
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
        meta: { noScroll: true },
        children: [
          {
            name: "clientMasterData",
            path: "profile",
            component: () => import("components/ClientMasterData.vue"),
            meta: { noScroll: true },
            children: [
              {
                name: "clientHealthInformation",
                path: "health",
                component: () => import("components/ClientHealthInformation.vue"),
                meta: { noScroll: true },
              },
              // {
              //   name: "clientBillingInformation",
              //   path: "billing",
              //   component: () => import("components/ClientBillingSettings/index.vue")
              // },
              {
                name: "clientAgreements",
                path: "agreements",
                component: () => import("components/ClientAgreements.vue"),
                meta: { noScroll: true },
              },
              {
                name: "clientContactData",
                path: "contacts/client",
                component: () => import("components/ClientContactData.vue"),
                meta: { noScroll: true },
              },
              {
                name: "clientInformalContact",
                path: "contacts/informal/:informalContactId",
                component: () => import("components/ClientInformalContact.vue"),
                meta: { noScroll: true },
              },
              {
                name: "clientFormalContact",
                path: "contacts/formal/:formalContactId",
                component: () => import("components/ClientFormalContact.vue"),
                meta: { noScroll: true },
              }
            ]
          },
          {
            name: "clientReminders",
            path: "reminders/:day?",
            component: () => import("components/ClientReminders.vue"),
            meta: { noScroll: true },
          },
          {
            name: "clientReport",
            path: ":expandedIds?/report/:sheet?/:problemId?/:interventionId?/:step?",
            component: () => import("components/ClientProblems.vue"),
            meta: { noScroll: true },
          },
          {
            name: "clientConversation",
            path: "conversation/:day?",
            component: () => import("components/ClientConversation.vue"),
            meta: {
              disablePullToRefresh: true
            }
          },
          {
            name: "clientProofOfPerformance",
            path: "/client/:clientId/reports/execution",
            component: () => import("components/ProofOfPerformance.vue"),
            meta: { noScroll: true },
          },
          {
            name: "clientHistory",
            path: "/client/:clientId/history",
            component: () => import("components/ClientHistory.vue"),
            meta: { noScroll: true },
          }
        ]
      },
      {
        name: "clientProblemClassification",
        path: "/client/:clientId/problem/:problemId/classification",
        component: () => import("pages/Classification.vue")
      },
      {
        name: "clientOutcome",
        path: "/client/:clientId/problem/:problemId/outcome",
        component: () => import("pages/Rating.vue")
      },
      {
        name: "clientNewInterventionForProblem",
        path: "/client/:clientId/problem/:problemId/intervention/new",
        component: () => import("pages/NewIntervention.vue")
      },
      // {
      //     name: "clientiInterventions",
      //     path: "/client/:clientId/problem/:problemId/intervention",
      //     component: () => import("pages/InterventionList.vue")
      // },
      {
        name: "clientIntervention",
        path:
          "/client/:clientId/problem/:problemId/intervention/:interventionId",
        component: () => import("pages/Intervention.vue")
      },
      {
        name: "clientNewIntervention",
        path: "/client/:clientId/intervention/new",
        component: () => import("pages/NewIntervention.vue")
      },
      {
        name: "clientProblem",
        path: "/client/:clientId/problem/:problemId/:step?",
        component: () => import("pages/ProblemRecording.vue")
      },
      {
        name: "clientProblemsByDiagnosis",
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
      // {
      //   name: "backoffice",
      //   path: "/backoffice/:backofficeId?",
      //   redirect: { name: "backofficeInvoice" },
      //   component: () => import("pages/Backoffice.vue"),
      //   children: [
      //     {
      //       name: "backofficeInvoice",
      //       path: "invoice/:invoiceId?",
      //       component: () => import("components/BackofficeInvoice.vue"),
      //     },
      //     {
      //       name: "backofficeCostEstimate",
      //       path: "costestimate/:costestimateId?",
      //       component: () => import("components/BackofficeCostEstimate.vue")
      //     },
      //     {
      //       name: "backofficeReferral",
      //       path: "referral/:referralId?",
      //       component: () => import("components/BackofficeReferral/index.vue")
      //     },
      //     {
      //       name: "backofficeSettings",
      //       path: "settings",
      //       redirect: { name: "backofficeGeneralSettings" },
      //       component: () => import("components/BackofficeSettings.vue"),
      //       children: [
      //         {
      //           name: "backofficeGeneralSettings",
      //           path: "general",
      //           component: () => import("components/BackofficeGeneralSettings.vue")
      //         },
      //         {
      //           name: "backofficeCompensationAgreement",
      //           path: "compensationagreement/:agreementId",
      //           component: () => import("components/BackofficeCompensationAgreement/index.vue")
      //         },
      //       ]
      //     },
      //   ]
      // },
      {
        name: "insights",
        path: "/insights",
        component: () => import("pages/Insights.vue"),
        meta: { section: "team" }
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
        name: "license",
        path: "/license",
        component: () => import("pages/License.vue")
      },
      {
        name: "acknowledgements",
        path: "/acknowledgements",
        component: () => import("pages/Acknowledgements.vue")
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
