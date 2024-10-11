import AuthLayout from "@/components/AuthLayout.vue";
import ReviewPage from "@/views/ReviewPage.vue";
import TripPage from "@/views/TripPage.vue";
import UserPage from "@/views/UserPage.vue";
// import LoginPage from "@/views/LoginPage.vue";
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    component: AuthLayout,
    children: [
      { path: "trip", component: TripPage, meta: { title: "Home" } },
      {
        path: "master",
        children: [
          {
            path: "user",
            component: UserPage,
            meta: { title: "User" },
          },
        ],
      },
    ],
  },
  {
    path: "/trip/:tripId/review",
    component: ReviewPage,
  },
  {
    path: "/:pathMatch(.*)*", // Vue Router 4 syntax (use '*' for Vue Router 3)
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
