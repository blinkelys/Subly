import { createRouter, createWebHistory } from 'vue-router'
import Home from './pages/Home.vue'
import About from './pages/About.vue'
import Login from './pages/auth/Login.vue'
import Register from './pages/auth/Register.vue'
import Recover from './pages/auth/Recover.vue'
import Dashboard from './pages/Dashboard.vue'
import axios from "axios";

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/recover', component: Recover },
  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true }, }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard for protected routes
router.beforeEach(async (to, _from, next) => {
  if (to.meta.requiresAuth) {
    try {
      await axios.get("/api/auth/me", { withCredentials: true });
      next();
    } catch (error) {
      next("/login");
    }
  } else {
    next();
  }
});

export default router;