import { createRouter, createWebHistory } from 'vue-router'
import Home from './pages/Home.vue'
import About from './pages/About.vue'
import Login from './pages/auth/Login.vue'
import Register from './pages/auth/Register.vue'
import Recover from './pages/auth/Recover.vue'
import Dashboard from './pages/Dashboard.vue'
import Settings from './pages/Settings.vue'
import Families from './pages/Families.vue'
import api from "./api";

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/recover', component: Recover },
  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true }, },
  { path: '/families', component: Families, meta: { requiresAuth: true }, },
  { path: '/settings', component: Settings, meta: { requiresAuth: true }, }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard for protected routes
router.beforeEach(async (to) => {
  if (to.meta.requiresAuth) {
    try {
      await api.get("/auth/me");
      return true;
    } catch (error) {
      return "/login";
    }
  }
});

export default router;