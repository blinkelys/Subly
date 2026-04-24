import { createRouter, createWebHistory } from 'vue-router'
import Home from './pages/Home.vue'
import About from './pages/About.vue'
import Login from './pages/auth/Login.vue'
import Register from './pages/auth/Register.vue'
import Recover from './pages/auth/Recover.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/recover', component: Recover }
]

export default createRouter({
  history: createWebHistory(),
  routes
})