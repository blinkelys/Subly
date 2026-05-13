<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../api'

interface User {
  _id: string
  username: string
  email: string
  role: string
  currency: string
  country: string
  emailVerified: boolean
  createdAt: string
}

const users = ref<User[]>([])
const loading = ref(false)
const error = ref('')
const success = ref('')
const editingUser = ref<User | null>(null)
const showEditModal = ref(false)
const editForm = ref({
  username: '',
  email: '',
  currency: '',
  country: '',
  role: ''
})
const currencies = ref<string[]>([])
const countries = ref<{ code: string; name: string }[]>([])

const fetchUsers = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await api.get('/admin/users')
    users.value = response.data.users
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to fetch users'
  } finally {
    loading.value = false
  }
}

const fetchCurrencies = async () => {
  try {
    const response = await api.get('/auth/currencies')
    currencies.value = response.data.map((c: any) => c.code)
  } catch (err) {
    console.error('Failed to fetch currencies:', err)
  }
}

const fetchCountries = async () => {
  // Simple list of countries - in a real app you'd fetch this from an API
  countries.value = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'IT', name: 'Italy' },
    { code: 'ES', name: 'Spain' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'JP', name: 'Japan' },
    { code: 'IN', name: 'India' },
    { code: 'BR', name: 'Brazil' },
    { code: 'MX', name: 'Mexico' },
    { code: 'SG', name: 'Singapore' },
  ]
}

const openEditModal = (user: User) => {
  editingUser.value = user
  editForm.value = {
    username: user.username,
    email: user.email,
    currency: user.currency,
    country: user.country,
    role: user.role
  }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingUser.value = null
}

const saveUser = async () => {
  if (!editingUser.value) return

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    await api.put(`/admin/users/${editingUser.value._id}`, editForm.value)
    success.value = 'User updated successfully'
    closeEditModal()
    await fetchUsers()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to update user'
  } finally {
    loading.value = false
  }
}

const deleteUser = async (userId: string, username: string) => {
  if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
    return
  }

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    await api.delete(`/admin/users/${userId}`)
    success.value = 'User deleted successfully'
    await fetchUsers()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to delete user'
  } finally {
    loading.value = false
  }
}

const sendResetEmail = async (userId: string, username: string) => {
  if (!confirm(`Send password reset email to "${username}"?`)) {
    return
  }

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    await api.post(`/admin/users/${userId}/reset-password`)
    success.value = 'Password reset email sent successfully'
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to send reset email'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUsers()
  fetchCurrencies()
  fetchCountries()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
    <MainLayout>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl sm:text-4xl font-bold text-white mb-2">Admin Panel</h1>
          <p class="text-gray-400">Manage users and system settings</p>
        </div>

        <!-- Messages -->
        <div v-if="error" class="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
          <p class="text-red-400">{{ error }}</p>
        </div>
        <div v-if="success" class="mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-xl">
          <p class="text-green-400">{{ success }}</p>
        </div>

        <!-- Users Table -->
        <div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-800">
            <h2 class="text-xl font-semibold text-white">Users</h2>
          </div>

          <div v-if="loading" class="p-8 text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p class="text-gray-400 mt-2">Loading users...</p>
          </div>

          <div v-else-if="users.length === 0" class="p-8 text-center">
            <p class="text-gray-400">No users found</p>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-800">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Created</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-800">
                <tr v-for="user in users" :key="user._id" class="hover:bg-gray-800/50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <div class="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                          <span class="text-white font-medium text-sm">{{ user.username.charAt(0).toUpperCase() }}</span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-white">{{ user.username }}</div>
                        <div class="text-sm text-gray-400">{{ user.currency }} • {{ user.country }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{{ user.email }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="user.role === 'admin' ? 'bg-red-900/20 text-red-400 border-red-500/30' : 'bg-blue-900/20 text-blue-400 border-blue-500/30'"
                      class="inline-flex px-2 py-1 text-xs font-medium border rounded-full"
                    >
                      {{ user.role }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="user.emailVerified ? 'bg-green-900/20 text-green-400 border-green-500/30' : 'bg-yellow-900/20 text-yellow-400 border-yellow-500/30'"
                      class="inline-flex px-2 py-1 text-xs font-medium border rounded-full"
                    >
                      {{ user.emailVerified ? 'Verified' : 'Unverified' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {{ new Date(user.createdAt).toLocaleDateString() }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      @click="openEditModal(user)"
                      class="text-blue-400 hover:text-blue-300 transition"
                    >
                      Edit
                    </button>
                    <button
                      @click="sendResetEmail(user._id, user.username)"
                      class="text-yellow-400 hover:text-yellow-300 transition"
                    >
                      Reset PW
                    </button>
                    <button
                      @click="deleteUser(user._id, user.username)"
                      class="text-red-400 hover:text-red-300 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Edit User Modal -->
      <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-gray-900 border border-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <h3 class="text-xl font-semibold text-white mb-4">Edit User</h3>

            <form @submit.prevent="saveUser" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Username</label>
                <input
                  v-model="editForm.username"
                  type="text"
                  required
                  class="w-full p-2.5 bg-gray-800 border border-gray-700 rounded text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  v-model="editForm.email"
                  type="email"
                  required
                  class="w-full p-2.5 bg-gray-800 border border-gray-700 rounded text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Currency</label>
                <select
                  v-model="editForm.currency"
                  required
                  class="w-full p-2.5 bg-gray-800 border border-gray-700 rounded text-white focus:border-blue-500 outline-none"
                >
                  <option v-for="currency in currencies" :key="currency" :value="currency">{{ currency }}</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Country</label>
                <select
                  v-model="editForm.country"
                  required
                  class="w-full p-2.5 bg-gray-800 border border-gray-700 rounded text-white focus:border-blue-500 outline-none"
                >
                  <option v-for="country in countries" :key="country.code" :value="country.code">{{ country.name }}</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Role</label>
                <select
                  v-model="editForm.role"
                  required
                  class="w-full p-2.5 bg-gray-800 border border-gray-700 rounded text-white focus:border-blue-500 outline-none"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div class="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  @click="closeEditModal"
                  class="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="loading"
                  class="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <span v-if="loading">Saving...</span>
                  <span v-else>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  </div>
</template>