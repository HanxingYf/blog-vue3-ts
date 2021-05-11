import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/index",
    name: "Index",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/Index.vue"),
  },
  {
    path: "/article",
    name: "Article",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/Article.vue"),
  },
  {
    path: "/item",
    name: "Item",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/Item.vue"),
  },
  {
    path: "/:catchAll(.*)",
    name: "404",
    component: () =>
      import("../views/404.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
