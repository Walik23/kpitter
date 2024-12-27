import { createRouter, createWebHistory } from "vue-router";
import RegisterForm from "../components/register.vue";
import Login from "../components/login.vue";
import Me from "../components/me.vue";
import Users from "../components/users.vue";
import Home from "../components/home.vue";

const routes = [
  {
    path: "/register",
    name: "Register",
    component: RegisterForm,
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/me",
    name: "Me",
    component: Me,
  },
  {
    path: "/users",
    name: "Users",
    component: Users,
  },
  {
    path: "/",
    name: "Home",
    component: Home,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
