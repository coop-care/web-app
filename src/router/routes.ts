import { defineAsyncComponent } from "vue";
import { RouteRecordRaw } from "vue-router";
import store from "../store";

const newProblem = defineAsyncComponent(() => import("pages/ProblemRecording.vue"));
const editClassification = defineAsyncComponent(() => import("pages/Classification.vue"));
const newIntervention = defineAsyncComponent(() => import("pages/NewIntervention.vue"));
const editIntervention = defineAsyncComponent(() => import("pages/Intervention.vue"));
const newOutcome = defineAsyncComponent(() => import("pages/Rating.vue"));

const isDemo = store.direct.getters.isDemo;
const routes: RouteRecordRaw[] = [
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
            path: ":day?/reminders/:sheet?/:problemId?/:interventionId?",
            component: () => import("components/ClientReminders.vue"),
            meta: {
              noScroll: true,
              sheets: { newIntervention, editIntervention, newOutcome }
            },
          },
          {
            name: "clientReport",
            path: ":expandedIds?/report/:sheet?/:problemId?/-/:interventionId?/-/:step?",
            component: () => import("components/ClientProblems.vue"),
            meta: {
              noScroll: true,
              sheets: { newProblem, editClassification, newIntervention, newOutcome }
            },
          },
          {
            name: "clientConversation",
            path: ":day?/conversation/:sheet?/:problemId?",
            component: () => import("components/ClientConversation.vue"),
            meta: {
              disablePullToRefresh: true,
              sheets: { newOutcome, newIntervention }
            }
          },
          {
            name: "clientProofOfPerformance",
            path: "reports/execution",
            component: () => import("components/ProofOfPerformance.vue"),
            meta: { noScroll: true },
          },
          {
            name: "clientHistory",
            path: "history",
            component: () => import("components/ClientHistory.vue"),
            meta: { noScroll: true },
          }
        ]
      },
      // {
      //   name: "clientProblemsByDiagnosis",
      //   path: !isDemo ? "/client/:clientId/diagnoses" : "",
      //   component: () => import("pages/ProblemsByDiagnosis.vue")
      // },
      {
        name: "userSettings",
        path: "/settings/user",
        component: () => import("pages/UserSettings.vue")
      },
      {
        name: "teamSettings",
        path: isDemo ? "/settings/team" : "",
        component: () => import("pages/TeamSettings.vue"),
        meta: { section: "client" }
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
        meta: { section: "client" }
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
      },
      {
        name: "login",
        path: !isDemo ? "/login" : "",
        component: () => import("pages/Login.vue"),
        meta: { noAuth: true }
      },
      {
        name: "register",
        path: !isDemo ? "/register" : "",
        component: () => import("pages/Register.vue"),
        meta: { noAuth: true }
      },
      {
        name: "confirm",
        path: !isDemo ? "/confirm" : "",
        component: () => import("pages/Confirm.vue"),
        meta: { noAuth: true }
      },
      {
        name: "requestPasswordReset",
        path: !isDemo ? "/requestpasswordreset" : "",
        component: () => import("pages/RequestPasswordReset.vue"),
        meta: { noAuth: true }
      },
      {
        name: "resetPassword",
        path: !isDemo ? "/passwordreset" : "",
        component: () => import("pages/PasswordReset.vue"),
        meta: { noAuth: true }
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
