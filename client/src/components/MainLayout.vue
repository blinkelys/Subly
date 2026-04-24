<script setup lang="ts">
import Navbar from './Navbar.vue'
import Footer from './Footer.vue'
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-950">
    <Navbar />
    <main class="flex-grow">
      <slot />
    </main>
    <Footer />
  </div>
</template>
