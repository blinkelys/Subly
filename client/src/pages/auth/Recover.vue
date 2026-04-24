<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '../../api/client'

const router = useRouter()
const email = ref('')
const isLoading = ref(false)
const error = ref('')
const success = ref('')
const step = ref<'email' | 'reset'>('email')
const resetToken = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const handleEmailSubmit = async () => {
  if (!email.value) {
    error.value = 'Please enter your email address'
    return
  }

  isLoading.value = true
  error.value = ''
  success.value = ''

  try {
    await apiClient.post('/auth/recover', {
      email: email.value
    })

    success.value = 'Recovery email sent! Check your inbox for instructions.'
    setTimeout(() => {
      step.value = 'reset'
    }, 2000)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to send recovery email. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const validateReset = () => {
  if (!resetToken.value || !newPassword.value || !confirmPassword.value) {
    error.value = 'Please fill in all fields'
    return false
  }

  if (newPassword.value.length < 8) {
    error.value = 'Password must be at least 8 characters long'
    return false
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return false
  }

  return true
}

const handlePasswordReset = async () => {
  error.value = ''
  success.value = ''

  if (!validateReset()) {
    return
  }

  isLoading.value = true

  try {
    await apiClient.post('/auth/reset-password', {
      token: resetToken.value,
      password: newPassword.value
    })

    success.value = 'Password reset successfully! Redirecting to login...'
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to reset password. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const handleBackToLogin = () => {
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
        <h1 class="text-3xl font-bold text-white">{{ step === 'email' ? 'Reset password' : 'Create new password' }}</h1>
        <p class="text-gray-400">
          {{ step === 'email' ? 'Enter your email to receive recovery instructions' : 'Enter your recovery token and new password' }}
        </p>
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

      <!-- Email Step -->
      <form v-if="step === 'email'" @submit.prevent="handleEmailSubmit" class="space-y-6">
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

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300"
        >
          <span v-if="!isLoading">Send recovery email</span>
          <span v-else class="flex items-center justify-center gap-2">
            <svg class="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Sending...
          </span>
        </button>
      </form>

      <!-- Reset Password Step -->
      <form v-else @submit.prevent="handlePasswordReset" class="space-y-6">
        <!-- Recovery Token -->
        <div class="space-y-2">
          <label for="token" class="block text-sm font-medium text-gray-300">
            Recovery token
          </label>
          <input
            v-model="resetToken"
            type="text"
            id="token"
            placeholder="Paste your recovery token here"
            class="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition duration-200"
            required
          />
        </div>

        <!-- New Password -->
        <div class="space-y-2">
          <label for="newPassword" class="block text-sm font-medium text-gray-300">
            New password
          </label>
          <div class="relative">
            <input
              v-model="newPassword"
              :type="showPassword ? 'text' : 'password'"
              id="newPassword"
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

        <!-- Confirm Password -->
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

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300"
        >
          <span v-if="!isLoading">Reset password</span>
          <span v-else class="flex items-center justify-center gap-2">
            <svg class="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Resetting...
          </span>
        </button>
      </form>

      <!-- Back to Login -->
      <button
        @click="handleBackToLogin"
        class="w-full text-center text-gray-400 hover:text-white text-sm transition-colors"
      >
        Back to login
      </button>
    </div>
  </div>
</template>