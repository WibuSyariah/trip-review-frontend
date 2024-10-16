import AuthLayout from "@/components/AuthLayout.vue";
import CarPage from "@/views/CarPage.vue";
import CompanyPage from "@/views/CompanyPage.vue";
import DivisionPage from "@/views/DivisionPage.vue";
import DriverPage from "@/views/DriverPage.vue";
import EMoneyPage from "@/views/EMoneyPage.vue";
import LoginPage from "@/views/LoginPage.vue";
import ReviewPage from "@/views/ReviewPage.vue";
import TripPage from "@/views/TripPage.vue";
import UserPage from "@/views/UserPage.vue";
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
    path: "/login",
    component: LoginPage,
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

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || "Trip Review";

  const accessToken = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role"); // Get role as a string
  const roleRoutes = {
    0: ["/", "/login", "/trip", "/master"], // Admin access
    1: ["/", "/login", "/trip"], // Non-admin access
  };

  // If not logged in, redirect to login
  if (!accessToken && to.path !== "/login") {
    next("/login");
  }
  // If logged in, prevent access to login page
  else if (accessToken && to.path === "/login") {
    next("/trip");
  }
  // Handle role-based access
  else if (role) {
    const roleKey = parseInt(role, 10); // Convert role to number

    // Ensure role is valid and exists in roleRoutes
    if (roleRoutes[roleKey]) {
      // Admin role (0) can access any sub-route under /master
      if (roleKey === 0) {
        next(); // Allow admin access to any route under /master
      }
      // Non-admin role (1) restricted to specified routes
      else if (roleKey === 1) {
        const isAllowedPath = roleRoutes[roleKey].includes(to.path); // Exact path match for non-admin
        if (!isAllowedPath) {
          next("/"); // Redirect to home if not allowed
        } else {
          next(); // Allow access to the exact allowed routes
        }
      }
    } else {
      next("/"); // Redirect to home if role is invalid
    }
  } else {
    next(); // Proceed if no role is found
  }
});

export default router;
