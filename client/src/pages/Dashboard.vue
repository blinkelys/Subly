<script setup lang="ts">
import { ref, onMounted } from 'vue'

type Subscription = {
  _id?: string
  name: string
  price: number
  renewalDate: string
  status: 'active' | 'ended'
}

const subscriptions = ref<Subscription[]>([])

// Modals
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showEndModal = ref(false)

// Selected subscription
const selected = ref<Subscription | null>(null)

// Form
const form = ref<Subscription>({
  name: '',
  price: 0,
  renewalDate: '',
  status: 'active',
})

/* ---------------- API ---------------- */

import api from '../api'

const fetchSubscriptions = async () => {
  const res = await api.get('/subscriptions')
  subscriptions.value = res.data
}

const createSubscription = async () => {
  await api.post('/subscriptions', form.value)
  await fetchSubscriptions()
  closeModals()
}

const updateSubscription = async () => {
  if (!selected.value?._id) return
  await api.put(`/subscriptions/${selected.value._id}`, form.value)
  await fetchSubscriptions()
  closeModals()
}

const deleteSubscription = async () => {
  if (!selected.value?._id) return
  await api.delete(`/subscriptions/${selected.value._id}`)
  await fetchSubscriptions()
  closeModals()
}

const endSubscription = async () => {
  if (!selected.value?._id) return
  await api.patch(`/subscriptions/${selected.value._id}/end`)
  await fetchSubscriptions()
  closeModals()
}

/* ---------------- UI actions ---------------- */

const openCreate = () => {
  form.value = { name: '', price: 0, renewalDate: '', status: 'active' }
  showCreateModal.value = true
}

const openEdit = (sub: Subscription) => {
  selected.value = sub
  form.value = { ...sub }
  showEditModal.value = true
}

const openDelete = (sub: Subscription) => {
  selected.value = sub
  showDeleteModal.value = true
}

const openEnd = (sub: Subscription) => {
  selected.value = sub
  showEndModal.value = true
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  showDeleteModal.value = false
  showEndModal.value = false
  selected.value = null
}

onMounted(fetchSubscriptions)
</script>

<template>
  <div class="min-h-screen bg-gray-950 text-white p-8">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Dashboard</h1>

      <button
        @click="openCreate"
        class="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition"
      >
        + New Subscription
      </button>
    </div>

    <!-- List -->
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="sub in subscriptions"
        :key="sub._id"
        class="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3 hover:border-blue-500/40 transition"
      >
        <div class="flex justify-between items-start">
          <h2 class="text-xl font-semibold">{{ sub.name }}</h2>
          <span
            class="text-xs px-2 py-1 rounded"
            :class="sub.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'"
          >
            {{ sub.status }}
          </span>
        </div>

        <p class="text-gray-400">€{{ sub.price }} / month</p>
        <p class="text-gray-500 text-sm">Renewal: {{ sub.renewalDate }}</p>

        <div class="flex gap-2 pt-3">
          <button @click="openEdit(sub)" class="text-sm px-3 py-1 bg-gray-800 rounded hover:bg-gray-700">
            Edit
          </button>

          <button @click="openEnd(sub)" class="text-sm px-3 py-1 bg-yellow-600/20 text-yellow-400 rounded hover:bg-yellow-600/30">
            End
          </button>

          <button @click="openDelete(sub)" class="text-sm px-3 py-1 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30">
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- CREATE / EDIT MODAL -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-black/70 flex items-center justify-center">
      <div class="bg-gray-900 p-6 rounded-xl w-full max-w-md space-y-4">
        <h2 class="text-xl font-bold">
          {{ showCreateModal ? 'Create' : 'Edit' }} Subscription
        </h2>

        <input v-model="form.name" placeholder="Name" class="w-full p-2 bg-gray-800 rounded" />
        <input v-model.number="form.price" type="number" placeholder="Price" class="w-full p-2 bg-gray-800 rounded" />
        <input v-model="form.renewalDate" type="date" class="w-full p-2 bg-gray-800 rounded" />

        <div class="flex justify-end gap-2 pt-4">
          <button @click="closeModals" class="px-4 py-2 bg-gray-700 rounded">Cancel</button>

          <button
            @click="showCreateModal ? createSubscription() : updateSubscription()"
            class="px-4 py-2 bg-blue-600 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>

    <!-- DELETE MODAL -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/70 flex items-center justify-center">
      <div class="bg-gray-900 p-6 rounded-xl space-y-4">
        <p>Delete this subscription?</p>

        <div class="flex justify-end gap-2">
          <button @click="closeModals" class="px-4 py-2 bg-gray-700 rounded">Cancel</button>
          <button @click="deleteSubscription" class="px-4 py-2 bg-red-600 rounded">Delete</button>
        </div>
      </div>
    </div>

    <!-- END MODAL -->
    <div v-if="showEndModal" class="fixed inset-0 bg-black/70 flex items-center justify-center">
      <div class="bg-gray-900 p-6 rounded-xl space-y-4">
        <p>End this subscription?</p>

        <div class="flex justify-end gap-2">
          <button @click="closeModals" class="px-4 py-2 bg-gray-700 rounded">Cancel</button>
          <button @click="endSubscription" class="px-4 py-2 bg-yellow-600 rounded">End</button>
        </div>
      </div>
    </div>
  </div>
</template>