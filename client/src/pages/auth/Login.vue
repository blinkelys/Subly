<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api'

const router = useRouter()
const emailOrUsername = ref('')
const password = ref('')
const rememberMe = ref(false)
const isLoading = ref(false)
const error = ref('')
const showPassword = ref(false)

const handleLogin = async () => {
  if (!emailOrUsername.value || !password.value) {
    error.value = 'Please fill in all fields'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const response = await api.post('/auth/login', {
      emailOrUsername: emailOrUsername.value,
      password: password.value,
      rememberMe: rememberMe.value
    })

    // Redirect to dashboard
    router.push('/dashboard')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Login failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const handleRecovery = () => {
  router.push('/recover')
}

const handleSignUp = () => {
  router.push('/register')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center px-6 py-12">
    <div class="w-full max-w-md space-y-8">
      <!-- Header -->
      <div class="space-y-2 text-center">
        <div class="flex justify-center mb-6">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <span class="text-white font-bold text-2xl">S</span>
          </div>
        </div>
        <h1 class="text-3xl font-bold text-white">Welcome back</h1>
        <p class="text-gray-400">Sign in to your account to continue</p>
      </div>

      <!-- Error Message -->
      <div
        v-if="error"
        class="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
      >
        {{ error }}
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-6">
        <!-- Email or Username Field -->
        <div class="space-y-2">
          <label for="email" class="block text-sm font-medium text-gray-300">
            Email or Username
          </label>
          <input
            v-model="emailOrUsername"
            type="text"
            id="emailOrUsername"
            placeholder="you@example.com"
            class="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition duration-200"
            required
          />
        </div>

        <!-- Password Field -->
        <div class="space-y-2">
          <label for="password" class="block text-sm font-medium text-gray-300">
            Password
          </label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              id="password"
              placeholder="••••••••"
              class="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition duration-200"
              required
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Remember Me & Forgot Password -->
        <div class="flex items-center justify-between">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              v-model="rememberMe"
              type="checkbox"
              class="w-4 h-4 rounded bg-gray-800 border border-gray-700 text-blue-500 focus:ring-blue-500 cursor-pointer"
            />
            <span class="text-sm text-gray-400">Remember me</span>
          </label>
          <button
            type="button"
            @click="handleRecovery"
            class="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Forgot password?
          </button>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300"
        >
          <span v-if="!isLoading">Sign in</span>
          <span v-else class="flex items-center justify-center gap-2">
            <svg class="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
          </span>
        </button>
      </form>

      <!-- Sign Up Link -->
      <p class="text-center text-gray-400 text-sm">
        Don't have an account?
        <button
          @click="handleSignUp"
          class="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
        >
          Sign up
        </button>
      </p>
    </div>
  </div>
</template>