<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api'

const router = useRouter()
const email = ref('')
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const agreeToTerms = ref(false)
const isLoading = ref(false)
const error = ref('')
const success = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const validateForm = () => {
  if (!username.value || !email.value || !password.value || !confirmPassword.value) {
    error.value = 'Please fill in all fields'
    return false
  }

  if (username.value.length < 3) {
    error.value = 'Username must be at least 3 characters long'
    return false
  }

  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters long'
    return false
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return false
  }

  if (!agreeToTerms.value) {
    error.value = 'You must agree to the terms and conditions'
    return false
  }

  return true
}

const handleRegister = async () => {
  error.value = ''
  success.value = ''

  if (!validateForm()) {
    return
  }

  isLoading.value = true

  try {
    await api.post('/auth/register', {
      username: username.value,
      email: email.value,
      password: password.value
    })

    success.value = 'Account created successfully! Redirecting to login...'
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Registration failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const handleLogin = () => {
  router.push('/login')
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
        <h1 class="text-3xl font-bold text-white">Create account</h1>
        <p class="text-gray-400">Join us and start managing your subscriptions</p>
      </div>

      <!-- Success Message -->
      <div
        v-if="success"
        class="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm"
      >
        {{ success }}
      </div>

      <!-- Error Message -->
      <div
        v-if="error"
        class="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
      >
        {{ error }}
      </div>

      <!-- Form -->
      <form @submit.prevent="handleRegister" class="space-y-6">
        <!-- Email Field -->
        <div class="space-y-2">
          <label for="email" class="block text-sm font-medium text-gray-300">
            Email address
          </label>
          <input
            v-model="email"
            type="email"
            id="email"
            placeholder="you@example.com"
            class="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition duration-200"
            required
          />
        </div>

        <!-- Username Field -->
        <div class="space-y-2">
          <label for="username" class="block text-sm font-medium text-gray-300">
            Username
          </label>
          <input
            v-model="username"
            type="text"
            id="username"
            placeholder="yourname"
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
          <p class="text-xs text-gray-500">At least 8 characters</p>
        </div>

        <!-- Confirm Password Field -->
        <div class="space-y-2">
          <label for="confirmPassword" class="block text-sm font-medium text-gray-300">
            Confirm password
          </label>
          <div class="relative">
            <input
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              id="confirmPassword"
              placeholder="••••••••"
              class="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition duration-200"
              required
            />
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <svg v-if="!showConfirmPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        <!-- Terms Checkbox -->
        <label class="flex items-start gap-2 cursor-pointer">
          <input
            v-model="agreeToTerms"
            type="checkbox"
            class="w-4 h-4 mt-1 rounded bg-gray-800 border border-gray-700 text-blue-500 focus:ring-blue-500 cursor-pointer flex-shrink-0"
          />
          <span class="text-sm text-gray-400">
            I agree to the
            <a href="#" class="text-blue-400 hover:text-blue-300 transition-colors">Terms of Service</a>
            and
            <a href="#" class="text-blue-400 hover:text-blue-300 transition-colors">Privacy Policy</a>
          </span>
        </label>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300"
        >
          <span v-if="!isLoading">Create account</span>
          <span v-else class="flex items-center justify-center gap-2">
            <svg class="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating account...
          </span>
        </button>
      </form>

      <!-- Login Link -->
      <p class="text-center text-gray-400 text-sm">
        Already have an account?
        <button
          @click="handleLogin"
          class="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
        >
          Sign in
        </button>
      </p>
    </div>
  </div>
</template>