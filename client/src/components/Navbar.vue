<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUser } from '../composables/useUser'
import api from '../api'

const router = useRouter()
const isMenuOpen = ref(false)
const { currentUser, fetchCurrentUser } = useUser()

onMounted(() => {
  fetchCurrentUser()
})

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const logout = async () => {
  try {
    await api.post('/auth/logout')
    currentUser.value = null
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
</script>

<template>
  <nav class="sticky top-0 z-50 bg-gray-900 border-b border-gray-800">
    <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <!-- Logo -->
      <RouterLink to="/" class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
          <span class="text-white font-bold text-lg">S</span>
        </div>
        <span class="text-white font-bold text-xl hidden sm:inline">Subly</span>
      </RouterLink>

      <!-- Desktop Navigation -->
      <div class="hidden md:flex items-center gap-8">
        <RouterLink
          to="/"
          class="text-gray-400 hover:text-white transition-colors duration-200"
          active-class="text-blue-400"
        >
          Home
        </RouterLink>
        <RouterLink
          to="/about"
          class="text-gray-400 hover:text-white transition-colors duration-200"
          active-class="text-blue-400"
        >
          About
        </RouterLink>
      </div>

      <!-- Desktop Auth Buttons -->
      <div v-if="!currentUser" class="hidden md:flex items-center gap-4">
        <RouterLink
          to="/login"
          class="text-gray-400 hover:text-white transition-colors duration-200"
        >
          Login
        </RouterLink>
        <RouterLink
          to="/register"
          class="px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-all duration-300"
        >
          Sign Up
        </RouterLink>
      </div>

      <!-- User Menu -->
      <div v-else class="hidden md:flex items-center gap-4">
        <RouterLink
          to="/dashboard"
          class="text-gray-400 hover:text-white transition-colors duration-200"
        >
          Dashboard
        </RouterLink>
        <RouterLink
          to="/families"
          class="text-gray-400 hover:text-white transition-colors duration-200"
        >
          Families
        </RouterLink>
        <RouterLink
          to="/settings"
          class="text-gray-400 hover:text-white transition-colors duration-200"
        >
          Settings
        </RouterLink>
        <button
          @click="logout"
          class="px-6 py-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-red-500 transition-all duration-300"
        >
          Logout
        </button>
      </div>

      <!-- Mobile Menu Button -->
      <button
        @click="toggleMenu"
        class="md:hidden text-gray-400 hover:text-white"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    </div>

    <!-- Mobile Navigation -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="isMenuOpen"
        class="md:hidden bg-gray-800 border-t border-gray-700 px-6 py-4 space-y-4"
      >
        <RouterLink
          to="/"
          class="block text-gray-400 hover:text-white transition-colors duration-200"
          active-class="text-blue-400"
          @click="isMenuOpen = false"
        >
          Home
        </RouterLink>
        <RouterLink
          to="/about"
          class="block text-gray-400 hover:text-white transition-colors duration-200"
          active-class="text-blue-400"
          @click="isMenuOpen = false"
        >
          About
        </RouterLink>

        <div v-if="!currentUser" class="flex flex-col gap-3 pt-4 border-t border-gray-700">
          <RouterLink
            to="/login"
            class="block text-gray-400 hover:text-white transition-colors duration-200"
            @click="isMenuOpen = false"
          >
            Login
          </RouterLink>
          <RouterLink
            to="/register"
            class="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold text-center transition-all duration-300"
            @click="isMenuOpen = false"
          >
            Sign Up
          </RouterLink>
        </div>

        <div v-else class="flex flex-col gap-3 pt-4 border-t border-gray-700">
          <RouterLink
            to="/dashboard"
            class="block text-gray-400 hover:text-white transition-colors duration-200"
            @click="isMenuOpen = false"
          >
            Dashboard
          </RouterLink>
          <RouterLink
            to="/settings"
            class="block text-gray-400 hover:text-white transition-colors duration-200"
            @click="isMenuOpen = false"
          >
            Settings
          </RouterLink>
          <button
            @click="logout"
            class="px-4 py-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-red-500 transition-all duration-300"
          >
            Logout
          </button>
        </div>
      </div>
    </transition>
  </nav>
</template>