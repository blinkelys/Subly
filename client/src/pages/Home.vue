<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const handleGetStarted = () => {
  router.push('/register')
}

const handleLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="bg-gray-950">
    <!-- Hero Section -->
    <div class="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-gray-950 flex items-center justify-center px-6 py-20">
      <div class="max-w-4xl w-full text-center space-y-8">
        <div class="space-y-4">
          <h1 class="text-6xl md:text-7xl font-extrabold text-white tracking-tight">
            Manage Your <span class="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Subscriptions</span>
          </h1>

          <p class="text-xl md:text-2xl text-gray-400 font-light max-w-2xl mx-auto">
            Track, organize, and manage all your subscriptions in one beautiful dashboard. Never miss a renewal or overpay again.
          </p>
        </div>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row justify-center gap-4 pt-8">
          <button
            @click="handleGetStarted"
            class="px-8 py-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 text-lg"
          >
            Get started free
          </button>

          <button
            @click="handleLogin"
            class="px-8 py-4 rounded-lg border-2 border-gray-700 hover:border-blue-400 text-gray-300 hover:text-white font-semibold transition-all duration-300 text-lg"
          >
            Sign in
          </button>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-8 pt-20 border-t border-gray-800">
          <div class="space-y-2">
            <p class="text-4xl font-bold text-blue-400">10K+</p>
            <p class="text-gray-400 text-sm">Active users</p>
          </div>
          <div class="space-y-2">
            <p class="text-4xl font-bold text-blue-400">$2M+</p>
            <p class="text-gray-400 text-sm">Saved annually</p>
          </div>
          <div class="space-y-2">
            <p class="text-4xl font-bold text-blue-400">100%</p>
            <p class="text-gray-400 text-sm">Free to use</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="max-w-6xl mx-auto px-6 py-20 space-y-16">
      <div class="text-center space-y-4 mb-16">
        <h2 class="text-4xl md:text-5xl font-bold text-white">Powerful Features</h2>
        <p class="text-gray-400 text-lg">Everything you need to manage your subscriptions</p>
      </div>

      <div class="grid md:grid-cols-2 gap-12">
        <!-- Feature 1 -->
        <div class="space-y-4 p-6 rounded-xl bg-gray-900/50 border border-gray-800 hover:border-blue-500/50 transition-all duration-300">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
            📊
          </div>
          <h3 class="text-xl font-bold text-white">Real-time Dashboard</h3>
          <p class="text-gray-400">See all your subscriptions at a glance with an intuitive, real-time dashboard.</p>
        </div>

        <!-- Feature 2 -->
        <div class="space-y-4 p-6 rounded-xl bg-gray-900/50 border border-gray-800 hover:border-blue-500/50 transition-all duration-300">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
            🔔
          </div>
          <h3 class="text-xl font-bold text-white">Smart Notifications</h3>
          <p class="text-gray-400">Get notified before your subscriptions renew so you never miss a deadline.</p>
        </div>

        <!-- Feature 3 -->
        <div class="space-y-4 p-6 rounded-xl bg-gray-900/50 border border-gray-800 hover:border-blue-500/50 transition-all duration-300">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
            💰
          </div>
          <h3 class="text-xl font-bold text-white">Spending Analytics</h3>
          <p class="text-gray-400">Track your spending patterns and identify opportunities to save money.</p>
        </div>

        <!-- Feature 4 -->
        <div class="space-y-4 p-6 rounded-xl bg-gray-900/50 border border-gray-800 hover:border-blue-500/50 transition-all duration-300">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
            🔐
          </div>
          <h3 class="text-xl font-bold text-white">Bank-level Security</h3>
          <p class="text-gray-400">Your data is encrypted and secured with industry-leading security standards.</p>
        </div>
      </div>
    </div>

    <!-- CTA Section -->
    <div class="max-w-4xl mx-auto px-6 py-20">
      <div class="rounded-2xl bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/30 p-12 text-center space-y-6">
        <h2 class="text-3xl md:text-4xl font-bold text-white">Ready to take control?</h2>
        <p class="text-gray-400 text-lg">Start managing your subscriptions today, completely free.</p>
        <button
          @click="handleGetStarted"
          class="px-8 py-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 text-lg inline-block"
        >
          Get started free
        </button>
      </div>
    </div>
  </div>
</template>