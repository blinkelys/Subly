<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Doughnut, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js'
import api from '../api'
import { useUser } from '../composables/useUser'
import { useCurrency } from '../composables/useCurrency'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

const { getCurrency } = useUser()
const { convert, formatPrice, fetchExchangeRates } = useCurrency()

type Subscription = {
  _id?: string
  name: string
  price: number
  paymentDate: string
  category: string
  status: 'active' | 'ending' | 'ended'
}

const CATEGORIES = [
  'Entertainment',
  'Rent',
  'Software',
  'Fitness',
  'Food',
  'Music',
  'Streaming',
  'Cloud Storage',
  'Education',
  'Other',
]

const subscriptions = ref<Subscription[]>([])
const isLoadingRates = ref(false)
const convertedPrices = ref<Record<string, number>>({})
const selectedCategory = ref<string>('All')

// Modals
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showEndModal = ref(false)

// Selected subscription
const selected = ref<Subscription | null>(null)

// Form
const form = ref<Subscription>({
  name: '',
  price: 0,
  paymentDate: '',
  category: 'Other',
  status: 'active',
})

/* --------- Computed Properties --------- */

const filteredSubscriptions = computed(() => {
  let filtered = subscriptions.value.filter((sub) => sub.status === 'active')
  if (selectedCategory.value !== 'All') {
    filtered = filtered.filter((sub) => sub.category === selectedCategory.value)
  }
  return filtered.sort((a, b) => a.category.localeCompare(b.category))
})

const totalMonthlySpending = computed(() => {
  return filteredSubscriptions.value.reduce(
    (sum, sub) => sum + (convertedPrices.value[sub._id || ''] ?? sub.price),
    0
  )
})

const spendingByCategory = computed(() => {
  const data: Record<string, number> = {}
  subscriptions.value
    .filter((sub) => sub.status === 'active')
    .forEach((sub) => {
      const amount = convertedPrices.value[sub._id || ''] ?? sub.price
      data[sub.category] = (data[sub.category] || 0) + amount
    })
  return data
})

const categoryColors = computed(() => {
  const colors: Record<string, string> = {
    Entertainment: '#8b5cf6',
    Rent: '#ef4444',
    Software: '#3b82f6',
    Fitness: '#10b981',
    Food: '#f59e0b',
    Music: '#ec4899',
    Streaming: '#06b6d4',
    'Cloud Storage': '#f97316',
    Education: '#6366f1',
    Other: '#6b7280',
  }
  return colors
})

const chartData = computed(() => {
  const labels = Object.keys(spendingByCategory.value)
  const data = Object.values(spendingByCategory.value)
  const colors = labels.map((cat) => categoryColors.value[cat] || '#6b7280')

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors,
        borderColor: 'rgba(15, 23, 42, 1)',
        borderWidth: 2,
      },
    ],
  }
})

const barChartData = computed(() => {
  const sorted = Object.entries(spendingByCategory.value)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)

  const labels = sorted.map(([cat]) => cat)
  const data = sorted.map(([, amount]) => amount)
  const colors = labels.map((cat) => categoryColors.value[cat] || '#6b7280')

  return {
    labels,
    datasets: [
      {
        label: `Spending (${getCurrency.value})`,
        data,
        backgroundColor: colors,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  }
})

const subscriptionsGroupedByCategory = computed(() => {
  const grouped: Record<string, Subscription[]> = {}
  filteredSubscriptions.value.forEach((sub) => {
    if (!grouped[sub.category]) {
      grouped[sub.category] = []
    }
    grouped[sub.category].push(sub)
  })
  return grouped
})

/* --------- Subscriptions API --------- */

const fetchSubscriptions = async () => {
  try {
    const res = await api.get('/subscriptions')
    subscriptions.value = res.data.map((sub: any) => ({
      ...sub,
      category: sub.category || 'Other',
    }))
  } catch (error) {
    console.error('Failed to fetch subscriptions:', error)
    subscriptions.value = []
  }
}

const convertPrices = async () => {
  isLoadingRates.value = true
  try {
    await fetchExchangeRates()

    const currency = getCurrency.value
    for (const sub of subscriptions.value) {
      const convertedAmount = await convert(sub.price, 'USD', currency)
      convertedPrices.value[sub._id || ''] = convertedAmount
    }
  } catch (error) {
    console.error('Failed to convert prices:', error)
  } finally {
    isLoadingRates.value = false
  }
}

const getDisplayPrice = (subscription: Subscription): string => {
  const key = subscription._id || ''
  const convertedPrice = convertedPrices.value[key] ?? subscription.price
  return formatPrice(convertedPrice, getCurrency.value)
}

const createSubscription = async () => {
  await api.post('/subscriptions', form.value)
  await fetchSubscriptions()
  await convertPrices()
  closeModals()
}

const updateSubscription = async () => {
  if (!selected.value?._id) return
  await api.put(`/subscriptions/${selected.value._id}`, form.value)
  await fetchSubscriptions()
  await convertPrices()
  closeModals()
}

const endSubscription = async () => {
  if (!selected.value?._id) return
  await api.patch(`/subscriptions/${selected.value._id}/end`)
  await fetchSubscriptions()
  await convertPrices()
  closeModals()
}

/* ---------------- UI actions ---------------- */

const openCreate = () => {
  form.value = { name: '', price: 0, paymentDate: '', category: 'Other', status: 'active' }
  showCreateModal.value = true
}

const openEdit = (sub: Subscription) => {
  selected.value = sub
  form.value = { ...sub }
  showEditModal.value = true
}

const openEnd = (sub: Subscription) => {
  selected.value = sub
  showEndModal.value = true
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  showEndModal.value = false
  selected.value = null
}

onMounted(async () => {
  await fetchSubscriptions()
  await convertPrices()
})
</script>

<template>
  <div class="min-h-screen bg-gray-950 text-white p-4 md:p-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 class="text-4xl font-bold">Dashboard</h1>
        <p class="text-gray-400 mt-1">Track and manage your subscriptions</p>
      </div>

      <button
        @click="openCreate"
        class="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-medium"
      >
        + Add Subscription
      </button>
    </div>

    <!-- Loading indicator -->
    <div v-if="isLoadingRates" class="mb-4 p-4 bg-blue-500/20 text-blue-400 rounded-lg">
      Loading exchange rates...
    </div>

    <!-- Summary Cards -->
    <div class="grid md:grid-cols-3 gap-6 mb-8">
      <!-- Total Monthly Spending -->
      <div class="bg-gradient-to-br from-blue-600/20 to-blue-600/5 border border-blue-500/30 rounded-xl p-6">
        <p class="text-gray-400 text-sm font-medium">Total Monthly Spending</p>
        <p class="text-3xl font-bold mt-2">{{ formatPrice(totalMonthlySpending, getCurrency) }}</p>
        <p class="text-xs text-gray-500 mt-2">{{ filteredSubscriptions.length }} active subscriptions</p>
      </div>

      <!-- Average Per Subscription -->
      <div class="bg-gradient-to-br from-purple-600/20 to-purple-600/5 border border-purple-500/30 rounded-xl p-6">
        <p class="text-gray-400 text-sm font-medium">Average Per Subscription</p>
        <p class="text-3xl font-bold mt-2">
          {{
            formatPrice(
              filteredSubscriptions.length > 0 ? totalMonthlySpending / filteredSubscriptions.length : 0,
              getCurrency
            )
          }}
        </p>
        <p class="text-xs text-gray-500 mt-2">Monthly average</p>
      </div>

      <!-- Active Categories -->
      <div class="bg-gradient-to-br from-green-600/20 to-green-600/5 border border-green-500/30 rounded-xl p-6">
        <p class="text-gray-400 text-sm font-medium">Active Categories</p>
        <p class="text-3xl font-bold mt-2">{{ Object.keys(spendingByCategory).length }}</p>
        <p class="text-xs text-gray-500 mt-2">Subscription categories</p>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid lg:grid-cols-2 gap-6 mb-8">
      <!-- Doughnut Chart -->
      <div v-if="chartData.labels.length > 0" class="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 class="text-lg font-semibold mb-4">Spending by Category</h2>
        <div class="flex justify-center" style="max-height: 300px">
          <Doughnut :data="chartData" :options="{ maintainAspectRatio: false, responsive: true, plugins: { legend: { position: 'bottom' } } }" />
        </div>
      </div>

      <!-- Bar Chart -->
      <div v-if="barChartData.labels.length > 0" class="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 class="text-lg font-semibold mb-4">Top Categories</h2>
        <div style="height: 300px">
          <Bar
            :data="barChartData"
            :options="{
              indexAxis: 'y',
              maintainAspectRatio: false,
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { x: { ticks: { color: '#999' }, grid: { color: '#333' } }, y: { ticks: { color: '#999' }, grid: { display: false } } },
            }"
          />
        </div>
      </div>
    </div>

    <!-- Subscriptions Section -->
    <div class="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 class="text-xl font-semibold">Your Subscriptions</h2>

        <!-- Category Filter -->
        <div class="w-full md:w-auto">
          <select
            v-model="selectedCategory"
            class="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition text-white"
          >
            <option value="All">All Categories</option>
            <option v-for="cat in CATEGORIES" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>
      </div>

      <!-- Grouped List View -->
      <div v-if="filteredSubscriptions.length > 0" class="space-y-6">
        <div v-for="(subs, category) in subscriptionsGroupedByCategory" :key="category" class="space-y-3">
          <!-- Category Header -->
          <div class="flex items-center gap-3 mt-4">
            <div :style="{ backgroundColor: categoryColors[category] || '#6b7280' }" class="w-3 h-3 rounded-full"></div>
            <h3 class="text-lg font-semibold text-gray-300">{{ category }}</h3>
            <span class="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded">{{ subs.length }}</span>
            <span class="text-sm text-gray-400 ml-auto">{{ formatPrice(subs.reduce((sum, sub) => sum + (convertedPrices[sub._id || ''] ?? sub.price), 0), getCurrency) }}/mo</span>
          </div>

          <!-- Subscriptions in Category -->
          <div class="space-y-2 pl-3 border-l border-gray-800">
            <div
              v-for="sub in subs"
              :key="sub._id"
              class="flex items-center justify-between bg-gray-800/50 hover:bg-gray-800 rounded-lg p-4 transition group"
            >
              <div class="flex-grow">
                <p class="font-medium">{{ sub.name }}</p>
                <p class="text-sm text-gray-400">Payment on {{ sub.paymentDate }}</p>
              </div>

              <div class="flex items-center gap-4">
                <p class="font-semibold whitespace-nowrap">{{ getDisplayPrice(sub) }}/mo</p>

                <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    @click="openEdit(sub)"
                    class="px-3 py-1 text-sm bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30 transition"
                  >
                    Edit
                  </button>
                  <button
                    @click="openEnd(sub)"
                    class="px-3 py-1 text-sm bg-yellow-600/20 text-yellow-400 rounded hover:bg-yellow-600/30 transition"
                  >
                    End
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-8">
        <p class="text-gray-400">No active subscriptions in this category</p>
        <button @click="openCreate" class="text-blue-400 hover:text-blue-300 mt-2">Add your first subscription</button>
      </div>
    </div>

    <!-- CREATE / EDIT MODAL -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div class="bg-gray-900 p-6 rounded-xl w-full max-w-md space-y-4">
        <h2 class="text-xl font-bold">
          {{ showCreateModal ? 'Add New' : 'Edit' }} Subscription
        </h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-400 mb-1">Name</label>
            <input v-model="form.name" placeholder="Subscription name" class="w-full p-2.5 bg-gray-800 border border-gray-700 rounded text-white focus:border-blue-500 outline-none" />
          </div>

          <div>
            <label class="block text-sm text-gray-400 mb-1">Price (USD)</label>
            <input v-model.number="form.price" type="number" placeholder="0.00" class="w-full p-2.5 bg-gray-800 border border-gray-700 rounded text-white focus:border-blue-500 outline-none" />
          </div>

          <div>
            <label class="block text-sm text-gray-400 mb-1">Payment Date</label>
            <input v-model="form.paymentDate" type="date" class="w-full p-2.5 bg-gray-800 border border-gray-700 rounded text-white focus:border-blue-500 outline-none" />
          </div>

          <div>
            <label class="block text-sm text-gray-400 mb-1">Category</label>
            <select v-model="form.category" class="w-full p-2.5 bg-gray-800 border border-gray-700 rounded text-white focus:border-blue-500 outline-none">
              <option v-for="cat in CATEGORIES" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-4">
          <button @click="closeModals" class="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition">
            Cancel
          </button>

          <button
            @click="showCreateModal ? createSubscription() : updateSubscription()"
            class="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition font-medium"
          >
            {{ showCreateModal ? 'Create' : 'Update' }}
          </button>
        </div>
      </div>
    </div>

    <!-- END MODAL -->
    <div v-if="showEndModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div class="bg-gray-900 p-6 rounded-xl space-y-4">
        <h2 class="text-lg font-semibold">End Subscription?</h2>
        <p class="text-gray-400">Are you sure you want to end <span class="font-semibold">{{ selected?.name }}</span>?</p>

        <div class="flex justify-end gap-2">
          <button @click="closeModals" class="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition">
            Cancel
          </button>
          <button @click="endSubscription" class="px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-700 transition font-medium">
            End Subscription
          </button>
        </div>
      </div>
    </div>
  </div>
</template>