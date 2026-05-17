<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUser } from '../composables/useUser'
import api from '../api'
import { getSupportedCurrencies } from '../utils/currencies'

const router = useRouter()
const { currentUser, updateSettings } = useUser()

const currencies = ref<any[]>([])
const selectedCurrency = ref('')
const selectedCountry = ref('')
const isLoading = ref(false)
const message = ref('')
const messageType = ref<'' | 'success' | 'error'>('')

// Delete account
const showDeleteModal = ref(false)
const deletePassword = ref('')
const isDeleting = ref(false)
const deleteError = ref('')

onMounted(async () => {
  // Fetch supported currencies
  try {
    const res = await api.get('/auth/currencies')
    currencies.value = res.data
  } catch (error) {
    console.error('Failed to fetch currencies:', error)
    // Fallback to local currencies
    currencies.value = getSupportedCurrencies()
  }

  // Set current selection
  if (currentUser.value) {
    selectedCurrency.value = currentUser.value.currency || 'USD'
    selectedCountry.value = currentUser.value.country || 'US'
  }
})

const handleSave = async () => {
  if (!selectedCurrency.value || !selectedCountry.value) {
    message.value = 'Please select both currency and country'
    messageType.value = 'error'
    return
  }

  isLoading.value = true
  message.value = ''

  try {
    await updateSettings({
      currency: selectedCurrency.value,
      country: selectedCountry.value,
    })
    message.value = 'Settings updated successfully!'
    messageType.value = 'success'
  } catch (error: any) {
    message.value = error.response?.data?.message || 'Failed to update settings'
    messageType.value = 'error'
  } finally {
    isLoading.value = false
  }
}

const openDeleteModal = () => {
  deletePassword.value = ''
  deleteError.value = ''
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deletePassword.value = ''
  deleteError.value = ''
}

const confirmDeleteAccount = async () => {
  if (!deletePassword.value) {
    deleteError.value = 'Password is required'
    return
  }

  isDeleting.value = true
  deleteError.value = ''

  try {
    await api.delete('/auth/account', {
      data: {
        password: deletePassword.value
      }
    })

    // Account deleted successfully, redirect to login
    setTimeout(() => {
      router.push('/login')
    }, 1000)
  } catch (error: any) {
    deleteError.value = error.response?.data?.message || 'Failed to delete account'
  } finally {
    isDeleting.value = false
  }
}
const getCountries = () => {
  const countries = new Set(currencies.value.map((c) => c.country))
  return Array.from(countries).sort()
}

// Get currencies for selected country
const getCurrenciesForCountry = () => {
  if (!selectedCountry.value) return currencies.value
  return currencies.value.filter((c) => c.country === selectedCountry.value)
}
</script>

<template>
  <div class="min-h-screen bg-gray-950 text-white p-4 md:p-8">
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl sm:text-4xl font-bold mb-2">Settings</h1>
        <p class="text-gray-400 text-sm sm:text-base">Manage your preferences</p>
      </div>

      <!-- Settings Card -->
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
        <!-- Currency Selection -->
        <div>
          <label class="block text-sm font-semibold mb-2">Currency</label>
          <select
            v-model="selectedCurrency"
            class="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Select a currency</option>
            <option v-for="currency in getCurrenciesForCountry()" :key="currency.code" :value="currency.code">
              {{ currency.code }} - {{ currency.name }} ({{ currency.symbol }})
            </option>
          </select>
        </div>

        <!-- Country Selection -->
        <div>
          <label class="block text-sm font-semibold mb-2">Country</label>
          <select
            v-model="selectedCountry"
            class="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Select a country</option>
            <option v-for="country in getCountries()" :key="country" :value="country">
              {{ country }}
            </option>
          </select>
        </div>

        <!-- Current User Info -->
        <div v-if="currentUser" class="bg-gray-800/50 border border-gray-700 rounded p-4 space-y-2">
          <p class="text-xs sm:text-sm text-gray-400 font-semibold">Current Settings:</p>
          <p class="text-white text-sm">
            <strong>Username:</strong> {{ currentUser.username }}
          </p>
          <p class="text-white text-sm">
            <strong>Email:</strong> <span class="truncate">{{ currentUser.email }}</span>
          </p>
          <p class="text-white text-sm">
            <strong>Currency:</strong> {{ currentUser.currency }}
          </p>
          <p class="text-white text-sm">
            <strong>Country:</strong> {{ currentUser.country }}
          </p>
        </div>

        <!-- Message -->
        <div
          v-if="message"
          :class="{
            'bg-green-500/20 text-green-400 border border-green-500/40':
              messageType === 'success',
            'bg-red-500/20 text-red-400 border border-red-500/40':
              messageType === 'error',
          }"
          class="p-3 rounded"
        >
          {{ message }}
        </div>

        <!-- Save Button -->
        <button
          @click="handleSave"
          :disabled="isLoading"
          class="w-full px-4 py-2 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded transition font-medium"
        >
          {{ isLoading ? 'Saving...' : 'Save Settings' }}
        </button>
      </div>

      <!-- Danger Zone -->
      <div class="bg-red-950/20 border border-red-500/30 rounded-xl p-6 space-y-4 mt-8">
        <div class="flex items-start gap-3">
          <div class="flex-1">
            <h2 class="text-lg sm:text-xl font-bold text-red-400 mb-1">Delete Account</h2>
            <p class="text-sm text-gray-400">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
          </div>
        </div>

        <button
          @click="openDeleteModal"
          class="w-full px-4 py-2 text-sm sm:text-base bg-red-600 hover:bg-red-700 rounded transition font-medium text-white"
        >
          Delete Account
        </button>
      </div>

      <!-- Delete Account Modal -->
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        @click.self="closeDeleteModal"
      >
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-sm w-full space-y-4">
          <div>
            <h3 class="text-xl font-bold text-red-400 mb-2">Delete Account</h3>
            <p class="text-sm text-gray-400">
              This will permanently delete your account and all your data. This action cannot be undone.
            </p>
          </div>

          <div v-if="deleteError" class="p-3 rounded bg-red-500/20 border border-red-500/40 text-red-400 text-sm">
            {{ deleteError }}
          </div>

          <div>
            <label class="block text-sm font-semibold mb-2">Confirm your password</label>
            <input
              v-model="deletePassword"
              type="password"
              placeholder="Enter your password"
              class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
              @keyup.enter="confirmDeleteAccount"
            />
          </div>

          <div class="flex gap-3 pt-4">
            <button
              @click="closeDeleteModal"
              class="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded transition font-medium"
            >
              Cancel
            </button>
            <button
              @click="confirmDeleteAccount"
              :disabled="isDeleting"
              class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded transition font-medium"
            >
              {{ isDeleting ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
