<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Doughnut, Bar, Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
} from 'chart.js'
import api from '../api'
import { useUser } from '../composables/useUser'
import { useCurrency } from '../composables/useCurrency'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Filler)

const { getCurrency } = useUser()
const { convert, formatPrice, fetchExchangeRates } = useCurrency()

type Subscription = {
  _id?: string
  name: string
  price: number
  paymentDay: number // Day of month (1-31)
  category: string
  status: 'active' | 'ending' | 'ended'
  scheduledEndDate?: string // When subscription will actually end
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
  paymentDay: 1,
  category: 'Other',
  status: 'active',
})

/* --------- Computed Properties --------- */

const filteredSubscriptions = computed(() => {
  let filtered = subscriptions.value.filter((sub) => sub.status !== 'ended')
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
    .filter((sub) => sub.status !== 'ended')
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

/* --------- Subscription Status Helpers --------- */

const getDaysUntilEndDate = (scheduledEndDate?: string): number => {
  if (!scheduledEndDate) return Infinity
  const endDate = new Date(scheduledEndDate)
  const today = new Date()
  const diffTime = endDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

const isLastDayBeforeEnd = (scheduledEndDate?: string): boolean => {
  const daysUntil = getDaysUntilEndDate(scheduledEndDate)
  return daysUntil === 1
}

const shouldAutoTransitionToEnded = (scheduledEndDate?: string): boolean => {
  const daysUntil = getDaysUntilEndDate(scheduledEndDate)
  return daysUntil <= 0
}

/* --------- Subscription Notification Infrastructure --------- */

type NotificationEvent = 'last_day_before_payment' | 'payment_day' | 'subscription_ended'

const subscriptionEventHandlers: Record<NotificationEvent, Array<(sub: Subscription) => void>> = {
  'last_day_before_payment': [],
  'payment_day': [],
  'subscription_ended': [],
}

// Register handlers for future notification features
const onSubscriptionEvent = (event: NotificationEvent, handler: (sub: Subscription) => void) => {
  subscriptionEventHandlers[event].push(handler)
}

const triggerSubscriptionEvent = (event: NotificationEvent, sub: Subscription) => {
  subscriptionEventHandlers[event].forEach((handler) => handler(sub))
}

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

const cumulativeSpendingChart = computed(() => {
  // Sort subscriptions by when they were created (to show cumulative growth)
  const sortedSubs = [...subscriptions.value].sort((a, b) => {
    // Use MongoDB ObjectId timestamp for sorting (first 8 chars represent timestamp in hex)
    const idA = a._id?.toString() || '0'
    const idB = b._id?.toString() || '0'
    const timeA = idA.length >= 8 ? parseInt(idA.substring(0, 8), 16) : 0
    const timeB = idB.length >= 8 ? parseInt(idB.substring(0, 8), 16) : 0
    return timeA - timeB
  })

  if (sortedSubs.length === 0) {
    return null
  }

  // Calculate cumulative spending based on subscription timeline
  const dataPoints: Array<{ date: string; cumulative: number }> = []
  let cumulative = 0
  const today = new Date()

  sortedSubs.forEach((sub) => {
    const amount = convertedPrices.value[sub._id || ''] ?? sub.price

    // Add subscription if it's active or if it hasn't ended yet
    const endDate = sub.scheduledEndDate ? new Date(sub.scheduledEndDate) : null
    const hasEnded = sub.status === 'ended' || (endDate && endDate < today)

    if (!hasEnded) {
      cumulative += amount
      // Extract timestamp from MongoDB ObjectId
      const idStr = sub._id?.toString() || '0'
      const timestamp = idStr.length >= 8 ? parseInt(idStr.substring(0, 8), 16) * 1000 : 0
      const idDate = new Date(timestamp)
      const date = idDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: '2-digit',
      })
      dataPoints.push({ date, cumulative })
    }
  })

  // Add today's total
  const todayStr = today.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
  })
  if (dataPoints.length > 0 && dataPoints[dataPoints.length - 1].date !== todayStr) {
    dataPoints.push({
      date: todayStr,
      cumulative: dataPoints[dataPoints.length - 1].cumulative,
    })
  }

  return {
    labels: dataPoints.map((p) => p.date),
    datasets: [
      {
        label: `Cumulative Spending (${getCurrency.value})`,
        data: dataPoints.map((p) => p.cumulative),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  }
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

/* --------- Auto-Transition Logic --------- */

const autoTransitionEndingToEnded = async () => {
  // Check each 'ending' subscription and transition to 'ended' if scheduled end date has passed
  for (const sub of subscriptions.value) {
    if (sub.status === 'ending' && shouldAutoTransitionToEnded(sub.scheduledEndDate)) {
      try {
        await api.patch(`/subscriptions/${sub._id}/mark-ended`)
        triggerSubscriptionEvent('subscription_ended', sub)
      } catch (error) {
        console.error('Failed to transition subscription to ended:', error)
      }
    }
  }
}

/* --------- Check for notification events --------- */

const checkSubscriptionEvents = () => {
  for (const sub of subscriptions.value) {
    if (sub.status === 'ending') {
      if (isLastDayBeforeEnd(sub.scheduledEndDate)) {
        triggerSubscriptionEvent('last_day_before_payment', sub)
      }
      if (shouldAutoTransitionToEnded(sub.scheduledEndDate)) {
        triggerSubscriptionEvent('payment_day', sub)
      }
    }
  }
}

/* ---------------- UI actions ---------------- */

const openCreate = () => {
  form.value = { name: '', price: 0, paymentDay: 1, category: 'Other', status: 'active' }
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
  await autoTransitionEndingToEnded()
  checkSubscriptionEvents()
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
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
      <!-- Total Monthly Spending -->
      <div class="bg-gradient-to-br from-blue-600/20 to-blue-600/5 border border-blue-500/30 rounded-xl p-4 sm:p-6">
        <p class="text-gray-400 text-sm font-medium">Total Monthly Spending</p>
        <p class="text-3xl font-bold mt-2">{{ formatPrice(totalMonthlySpending, getCurrency) }}</p>
        <p class="text-xs text-gray-500 mt-2">{{ filteredSubscriptions.length }} active subscriptions</p>
      </div>

      <!-- Average Per Subscription -->
      <div class="bg-gradient-to-br from-purple-600/20 to-purple-600/5 border border-purple-500/30 rounded-xl p-4 sm:p-6">
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
      <div class="bg-gradient-to-br from-green-600/20 to-green-600/5 border border-green-500/30 rounded-xl p-4 sm:p-6">
        <p class="text-gray-400 text-sm font-medium">Active Categories</p>
        <p class="text-3xl font-bold mt-2">{{ Object.keys(spendingByCategory).length }}</p>
        <p class="text-xs text-gray-500 mt-2">Subscription categories</p>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
      <!-- Doughnut Chart -->
      <div v-if="chartData.labels.length > 0" class="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6">
        <h2 class="text-base sm:text-lg font-semibold mb-4">Spending by Category</h2>
        <div class="flex justify-center" style="max-height: 250px; min-height: 200px;">
          <Doughnut :data="chartData" :options="{ maintainAspectRatio: false, responsive: true, plugins: { legend: { position: 'bottom' } } }" />
        </div>
      </div>

      <!-- Bar Chart -->
      <div v-if="barChartData.labels.length > 0" class="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6">
        <h2 class="text-base sm:text-lg font-semibold mb-4">Top Categories</h2>
        <div style="height: 250px; min-height: 200px;">
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

    <!-- Cumulative Spending Chart -->
    <div v-if="cumulativeSpendingChart" class="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6 mb-8">
      <h2 class="text-base sm:text-lg font-semibold mb-4">Cumulative Spending Over Time</h2>
      <div style="height: 280px;">
        <Line
          :data="cumulativeSpendingChart"
          :options="{
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
              legend: { display: true, labels: { color: '#fff' } },
              tooltip: { backgroundColor: 'rgba(0, 0, 0, 0.8)', padding: 12, titleColor: '#fff', bodyColor: '#fff' },
            },
            scales: {
              x: { ticks: { color: '#999' }, grid: { color: '#333' } },
              y: { ticks: { color: '#999' }, grid: { color: '#333' }, beginAtZero: true },
            },
          }"
        />
      </div>
    </div>

    <!-- Subscriptions Section -->
    <div class="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 class="text-lg sm:text-xl font-semibold">Your Subscriptions</h2>

        <!-- Category Filter -->
        <div class="w-full md:w-auto">
          <select
            v-model="selectedCategory"
            class="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition text-white"
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
              class="space-y-2"
            >
              <!-- Warning for ending subscriptions on last day -->
              <div
                v-if="sub.status === 'ending' && isLastDayBeforeEnd(sub.scheduledEndDate)"
                class="bg-red-500/20 border border-red-500/50 rounded-lg p-3"
              >
                <p class="text-red-400 text-sm font-semibold">⚠️ Final Day - Ends Tomorrow</p>
                <p class="text-red-300 text-xs">This subscription will be cancelled on {{ new Date(sub.scheduledEndDate || '').toLocaleDateString() }}.</p>
              </div>

              <!-- Warning for ending subscriptions (general) -->
              <div
                v-else-if="sub.status === 'ending'"
                class="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3"
              >
                <p class="text-yellow-400 text-sm font-semibold">⏱️ Ending Subscription</p>
                <p class="text-yellow-300 text-xs">Cancels on {{ new Date(sub.scheduledEndDate || '').toLocaleDateString() }}</p>
              </div>

              <div
                class="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-800/50 hover:bg-gray-800 rounded-lg p-3 sm:p-4 transition group gap-3"
              >
                <div class="flex-grow min-w-0">
                  <p class="font-medium truncate">{{ sub.name }}</p>
                  <p class="text-xs sm:text-sm text-gray-400">Renews on day {{ sub.paymentDay }} of each month</p>
                </div>

                <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                  <p class="font-semibold whitespace-nowrap text-sm sm:text-base">{{ getDisplayPrice(sub) }}/mo</p>

                  <div class="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition w-full sm:w-auto">
                    <button
                      @click="openEdit(sub)"
                      class="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30 transition flex-1 sm:flex-none"
                    >
                      Edit
                    </button>
                    <button
                      v-if="sub.status === 'active'"
                      @click="openEnd(sub)"
                      class="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-yellow-600/20 text-yellow-400 rounded hover:bg-yellow-600/30 transition flex-1 sm:flex-none"
                    >
                      End
                    </button>
                  </div>
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
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-900 p-6 rounded-xl w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
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
            <label class="block text-sm text-gray-400 mb-1">Payment Day (of month)</label>
            <input v-model.number="form.paymentDay" type="number" min="1" max="31" placeholder="1-31" class="w-full p-2.5 bg-gray-800 border border-gray-700 rounded text-white focus:border-blue-500 outline-none" />
            <p class="text-xs text-gray-500 mt-1">The day of each month when this subscription renews</p>
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
    <div v-if="showEndModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-900 p-6 rounded-xl space-y-4 w-full max-w-md">
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