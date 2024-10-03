import AuthLayout from "@/components/AuthLayout.vue";
import ReviewPage from "@/views/ReviewPage.vue";
import TripPage from "@/views/TripPage.vue";
// import LoginPage from "@/views/LoginPage.vue";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: AuthLayout,
      children: [
        { path: "trip", component: TripPage },
        // other routes that need the sidebar
      ],
    },
    {
      path: "/review",
      component: ReviewPage,
    },
  ],
});

export default router;
