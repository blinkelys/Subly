<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUser } from '../composables/useUser'
import api from '../api'
import { getSupportedCurrencies } from '../utils/currencies'

const { currentUser, updateSettings } = useUser()

const currencies = ref<any[]>([])
const selectedCurrency = ref('')
const selectedCountry = ref('')
const isLoading = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('')

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

// Get unique countries from currencies
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
  <div class="min-h-screen bg-gray-950 text-white p-8">
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2">Settings</h1>
        <p class="text-gray-400">Manage your preferences</p>
      </div>

      <!-- Settings Card -->
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
        <!-- Currency Selection -->
        <div>
          <label class="block text-sm font-semibold mb-2">Currency</label>
          <select
            v-model="selectedCurrency"
            class="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
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
            class="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Select a country</option>
            <option v-for="country in getCountries()" :key="country" :value="country">
              {{ country }}
            </option>
          </select>
        </div>

        <!-- Current User Info -->
        <div v-if="currentUser" class="bg-gray-800/50 border border-gray-700 rounded p-4">
          <p class="text-sm text-gray-400 mb-2">Current Settings:</p>
          <p class="text-white">
            <strong>Username:</strong> {{ currentUser.username }}
          </p>
          <p class="text-white">
            <strong>Email:</strong> {{ currentUser.email }}
          </p>
          <p class="text-white">
            <strong>Currency:</strong> {{ currentUser.currency }}
          </p>
          <p class="text-white">
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
          class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded transition"
        >
          {{ isLoading ? 'Saving...' : 'Save Settings' }}
        </button>
      </div>
    </div>
  </div>
</template>
