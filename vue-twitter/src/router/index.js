// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import Home from "../components/Home.vue";
import Login from "../components/Login.vue";
import Secret from "../components/Secret.vue";

const routes = [
  { path: "/", component: Home }, // ← トップページに掲示板！
  { path: "/login", component: Login },
  {
    path: "/secret",
    component: Secret,
    meta: { requiresAuth: true }, // ←認証が必要なルートとしてマーク！
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ここでルートガードを追加！
router.beforeEach((to, from, next) => {
  const isLoggedIn = !!sessionStorage.getItem("username");

  // requiresAuthがtrueならログインしてるか確認
  if (to.meta.requiresAuth && !isLoggedIn) {
    next("/login"); // 未ログインならログインページへ
  } else {
    next(); // OKなら次へ進む
  }
});

export default router;
