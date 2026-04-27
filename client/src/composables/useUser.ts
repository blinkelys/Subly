import { ref, computed } from 'vue'
import api from '../api'

export interface User {
  id?: string
  _id?: string
  username: string
  email: string
  role: string
  currency: string
  country: string
}

// Global user state
const currentUser = ref<User | null>(null)
const isAuthenticated = computed(() => !!currentUser.value)

export function useUser() {
  /**
   * Load current user from /auth/me
   */
  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/auth/me')
      currentUser.value = response.data
      return response.data
    } catch (error) {
      console.error('Failed to fetch current user:', error)
      currentUser.value = null
      return null
    }
  }

  /**
   * Update user settings (currency, country)
   */
  const updateSettings = async (settings: {
    currency?: string
    country?: string
  }) => {
    try {
      const response = await api.put('/auth/settings', settings)
      currentUser.value = response.data.user
      return response.data.user
    } catch (error) {
      console.error('Failed to update settings:', error)
      throw error
    }
  }

  /**
   * Update currency
   */
  const setCurrency = async (currency: string) => {
    return updateSettings({ currency })
  }

  /**
   * Update country
   */
  const setCountry = async (country: string) => {
    return updateSettings({ country })
  }

  /**
   * Get user's current currency
   */
  const getCurrency = computed(() => currentUser.value?.currency ?? 'USD')

  /**
   * Get user's current country
   */
  const getCountry = computed(() => currentUser.value?.country ?? 'US')

  return {
    currentUser,
    isAuthenticated,
    fetchCurrentUser,
    updateSettings,
    setCurrency,
    setCountry,
    getCurrency,
    getCountry,
  }
}
