import AuthLayout from "@/components/AuthLayout.vue";
import CarPage from "@/views/CarPage.vue";
import CompanyPage from "@/views/CompanyPage.vue";
import DivisionPage from "@/views/DivisionPage.vue";
import DriverPage from "@/views/DriverPage.vue";
import EMoneyPage from "@/views/EMoneyPage.vue";
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
          {
            path: "driver",
            component: DriverPage,
            meta: { title: "Driver" },
          },
          {
            path: "car",
            component: CarPage,
            meta: { title: "Car" },
          },
          {
            path: "company",
            component: CompanyPage,
            meta: { title: "Company" },
          },
          {
            path: "division",
            component: DivisionPage,
            meta: { title: "Division" },
          },
          {
            path: "e-money",
            component: EMoneyPage,
            meta: { title: "E-Money" },
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
