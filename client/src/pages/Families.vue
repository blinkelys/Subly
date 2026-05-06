<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../api'
import { useUser } from '../composables/useUser'

const { currentUser } = useUser()

interface Family {
  _id: string
  name: string
  ownerId: { _id: string; username: string; email: string }
  members: Array<{
    userId: { _id: string; username: string; email: string }
    role: 'owner' | 'admin' | 'member'
    joinedAt: string
  }>
  invites?: Array<{
    email: string
    code: string
    expiresAt: string
  }>
}

const families = ref<Family[]>([])
const showCreateModal = ref(false)
const showInviteModal = ref(false)
const selectedFamily = ref<Family | null>(null)
const newFamilyName = ref('')
const inviteEmail = ref('')
const inviteCode = ref('')
const showAcceptModal = ref(false)
const loading = ref(false)
const message = ref('')

const fetchFamilies = async () => {
  try {
    const res = await api.get('/families')
    families.value = res.data
  } catch (error) {
    console.error('Failed to fetch families:', error)
  }
}

const createFamily = async () => {
  if (!newFamilyName.value.trim()) return

  try {
    loading.value = true
    const res = await api.post('/families', { name: newFamilyName.value })
    families.value.push(res.data)
    newFamilyName.value = ''
    showCreateModal.value = false
    message.value = 'Family created successfully!'
  } catch (error) {
    console.error('Failed to create family:', error)
    message.value = 'Failed to create family'
  } finally {
    loading.value = false
  }
}

const inviteToFamily = async () => {
  if (!inviteEmail.value.trim() || !selectedFamily.value) return

  try {
    loading.value = true
    const res = await api.post(`/families/${selectedFamily.value._id}/invite`, {
      email: inviteEmail.value,
    })
    message.value = `Invite sent to ${inviteEmail.value}`
    inviteEmail.value = ''
    showInviteModal.value = false
    await fetchFamilies()
  } catch (error) {
    console.error('Failed to send invite:', error)
    message.value = 'Failed to send invite'
  } finally {
    loading.value = false
  }
}

const acceptInvite = async () => {
  if (!inviteCode.value.trim()) return

  try {
    loading.value = true
    const res = await api.post(`/families/invite/${inviteCode.value}/accept`)
    families.value.push(res.data)
    inviteCode.value = ''
    showAcceptModal.value = false
    message.value = 'Invite accepted!'
    await fetchFamilies()
  } catch (error) {
    console.error('Failed to accept invite:', error)
    message.value = 'Failed to accept invite'
  } finally {
    loading.value = false
  }
}

const removeMember = async (familyId: string, memberId: string) => {
  if (!confirm('Remove this member from the family?')) return

  try {
    await api.patch(`/families/${familyId}/members/${memberId}/remove`)
    await fetchFamilies()
    message.value = 'Member removed'
  } catch (error) {
    console.error('Failed to remove member:', error)
    message.value = 'Failed to remove member'
  }
}

const leaveFamily = async (familyId: string) => {
  if (!confirm('Leave this family?')) return

  try {
    await api.post(`/families/${familyId}/leave`)
    await fetchFamilies()
    message.value = 'Left family'
  } catch (error) {
    console.error('Failed to leave family:', error)
    message.value = 'Failed to leave family'
  }
}

const deleteFamily = async (familyId: string) => {
  if (!confirm('Delete this family? This action cannot be undone.')) return

  try {
    await api.delete(`/families/${familyId}`)
    families.value = families.value.filter((f) => f._id !== familyId)
    message.value = 'Family deleted'
  } catch (error) {
    console.error('Failed to delete family:', error)
    message.value = 'Failed to delete family'
  }
}

onMounted(() => {
  fetchFamilies()
})
</script>

<template>
  <div class="min-h-screen bg-gray-950 text-white p-4 md:p-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-3">
      <div>
        <h1 class="text-3xl sm:text-4xl font-bold">Families</h1>
        <p class="text-gray-400 text-sm sm:text-base mt-1">Create or join family groups to share subscriptions</p>
      </div>

      <div class="flex gap-2 w-full md:w-auto flex-col sm:flex-row">
        <button
          @click="showCreateModal = true"
          class="px-4 sm:px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-medium text-sm sm:text-base w-full sm:w-auto"
        >
          + Create Family
        </button>

        <button
          @click="showAcceptModal = true"
          class="px-4 sm:px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 transition font-medium text-sm sm:text-base w-full sm:w-auto"
        >
          Accept Invite
        </button>
      </div>
    </div>

    <!-- Message -->
    <div v-if="message" class="mb-4 p-4 bg-blue-500/20 text-blue-400 rounded-lg">
      {{ message }}
      <button @click="message = ''" class="float-right text-xl">×</button>
    </div>

    <!-- Families List -->
    <div v-if="families.length > 0" class="space-y-6">
      <div v-for="family in families" :key="family._id" class="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <h2 class="text-xl sm:text-2xl font-bold">{{ family.name }}</h2>
            <p class="text-gray-400 text-xs sm:text-sm mt-1">Owner: {{ family.ownerId.username }}</p>
          </div>

          <div class="flex gap-2 w-full sm:w-auto flex-col sm:flex-row">
            <button
              @click="selectedFamily = family; showInviteModal = true"
              class="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30 transition w-full sm:w-auto"
            >
              Invite
            </button>
            <button
              @click="leaveFamily(family._id)"
              class="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-yellow-600/20 text-yellow-400 rounded hover:bg-yellow-600/30 transition w-full sm:w-auto"
            >
              Leave
            </button>
          </div>
        </div>

        <!-- Members -->
        <div class="mb-6">
          <h3 class="text-base sm:text-lg font-semibold mb-3">Members ({{ family.members.length }})</h3>
          <div class="space-y-2">
            <div
              v-for="member in family.members"
              :key="member.userId._id"
              class="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-800/50 p-3 rounded gap-2"
            >
              <div class="flex-grow min-w-0">
                <p class="font-medium text-sm sm:text-base">{{ member.userId.username }}</p>
                <p class="text-xs sm:text-sm text-gray-400 truncate">{{ member.userId.email }}</p>
                <p class="text-xs text-gray-500">{{ member.role }}</p>
              </div>

              <button
                v-if="family.ownerId._id !== member.userId._id"
                @click="removeMember(family._id, member.userId._id)"
                class="px-3 py-1 text-xs sm:text-sm bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 transition w-full sm:w-auto"
              >
                Remove
              </button>
            </div>
          </div>
        </div>

        <!-- Pending Invites -->
        <div v-if="family.invites && family.invites.length > 0" class="mb-6">
          <h3 class="text-base sm:text-lg font-semibold mb-3">Pending Invites</h3>
          <div class="space-y-2">
            <div v-for="invite in family.invites" :key="invite.code" class="bg-gray-800/50 p-3 rounded">
              <p class="font-medium text-sm sm:text-base">{{ invite.email }}</p>
              <p class="text-xs text-gray-500">Expires: {{ new Date(invite.expiresAt).toLocaleDateString() }}</p>
            </div>
          </div>
        </div>

        <!-- Delete Button -->
        <div v-if="family.ownerId._id === currentUser?._id">
          <button
            @click="deleteFamily(family._id)"
            class="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 transition w-full sm:w-auto"
          >
            Delete Family
          </button>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <p class="text-gray-400 mb-4">No families yet. Create one to get started!</p>
    </div>

    <!-- CREATE FAMILY MODAL -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-900 p-6 rounded-xl w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold">Create New Family</h2>

        <input
          v-model="newFamilyName"
          placeholder="Family name"
          class="w-full p-2.5 bg-gray-800 border border-gray-700 rounded text-white focus:border-blue-500 outline-none"
        />

        <div class="flex justify-end gap-2 pt-4">
          <button
            @click="showCreateModal = false"
            class="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            @click="createFamily"
            :disabled="loading"
            class="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            Create
          </button>
        </div>
      </div>
    </div>

    <!-- INVITE MODAL -->
    <div v-if="showInviteModal && selectedFamily" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-900 p-6 rounded-xl w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold">Invite to {{ selectedFamily.name }}</h2>

        <input
          v-model="inviteEmail"
          type="email"
          placeholder="Email address"
          class="w-full p-2.5 bg-gray-800 border border-gray-700 rounded text-white focus:border-blue-500 outline-none"
        />

        <div class="flex justify-end gap-2 pt-4">
          <button
            @click="showInviteModal = false"
            class="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            @click="inviteToFamily"
            :disabled="loading"
            class="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            Send Invite
          </button>
        </div>
      </div>
    </div>

    <!-- ACCEPT INVITE MODAL -->
    <div v-if="showAcceptModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-900 p-6 rounded-xl w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold">Accept Invite</h2>

        <input
          v-model="inviteCode"
          placeholder="Paste invite code here"
          class="w-full p-2.5 bg-gray-800 border border-gray-700 rounded text-white focus:border-blue-500 outline-none font-mono text-sm"
        />

        <div class="flex justify-end gap-2 pt-4">
          <button
            @click="showAcceptModal = false"
            class="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            @click="acceptInvite"
            :disabled="loading"
            class="px-4 py-2 bg-green-600 rounded hover:bg-green-700 transition disabled:opacity-50"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  </div>
</script>
