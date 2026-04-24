<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'

const route = useRoute()

// Determine if current page is an auth page
const isAuthPage = computed(() => {
  return route.path === '/login' || route.path === '/register' || route.path === '/recover'
})
</script>

<template>
  <div v-if="isAuthPage" class="bg-gray-950">
    <RouterView />
  </div>

  <div v-else class="flex flex-col min-h-screen bg-gray-950">
    <Navbar />
    <main class="flex-grow">
      <RouterView />
    </main>
    <Footer />
  </div>
</template>
