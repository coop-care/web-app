import { RouteConfig } from "vue-router";

const routes: RouteConfig[] = [
  {
    path: "/",
    component: () => import("layouts/MyLayout.vue"),
    children: [
      { name: "index", path: "", component: () => import("pages/Index.vue") },
      {
        name: "problem",
        path: "/customer/:customerId/problem/:problemIndex",
        component: () => import("pages/ProblemRecording.vue")
      },
      {
        name: "outcome",
        path: "/customer/:customerId/problem/:problemIndex/outcome",
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
