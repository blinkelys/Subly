<script setup lang="ts">
import { ref } from 'vue'

const year = ref(new Date().getFullYear())
</script>

<template>
  <footer class="bg-gray-900 border-t border-gray-800 text-gray-400 mt-20">
    <div class="max-w-7xl mx-auto px-6 py-12">
      <!-- Main Footer Content -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <!-- Brand -->
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span class="text-white font-bold text-lg">S</span>
            </div>
            <span class="text-white font-bold text-lg">Subly</span>
          </div>
          <p class="text-sm text-gray-500">
            Your subscription tracker and management platform.
          </p>
        </div>

        <!-- Product Links -->
        <div>
          <h3 class="text-white font-semibold mb-4">Product</h3>
          <ul class="space-y-2 text-sm">
            <li>
              <RouterLink to="/" class="hover:text-blue-400 transition-colors duration-200">
                Home
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/about" class="hover:text-blue-400 transition-colors duration-200">
                About
              </RouterLink>
            </li>
            <li>
              <a href="#" class="hover:text-blue-400 transition-colors duration-200">
                Pricing
              </a>
            </li>
          </ul>
        </div>

        <!-- Support Links -->
        <div>
          <h3 class="text-white font-semibold mb-4">Support</h3>
          <ul class="space-y-2 text-sm">
            <li>
              <a href="#" class="hover:text-blue-400 transition-colors duration-200">
                Documentation
              </a>
            </li>
            <li>
              <a href="#" class="hover:text-blue-400 transition-colors duration-200">
                Help Center
              </a>
            </li>
            <li>
              <a href="#" class="hover:text-blue-400 transition-colors duration-200">
                Contact
              </a>
            </li>
          </ul>
        </div>

        <!-- Legal Links -->
        <div>
          <h3 class="text-white font-semibold mb-4">Legal</h3>
          <ul class="space-y-2 text-sm">
            <li>
              <a href="#" class="hover:text-blue-400 transition-colors duration-200">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" class="hover:text-blue-400 transition-colors duration-200">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="#" class="hover:text-blue-400 transition-colors duration-200">
                Cookie Policy
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Divider -->
      <div class="border-t border-gray-800 mb-8"></div>

      <!-- Bottom Section -->
      <div class="flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
        <p>&copy; {{ year }} Subly. All rights reserved.</p>
        <div class="flex gap-6 mt-4 md:mt-0">
          <a href="#" class="hover:text-blue-400 transition-colors duration-200">Twitter</a>
          <a href="#" class="hover:text-blue-400 transition-colors duration-200">GitHub</a>
          <a href="#" class="hover:text-blue-400 transition-colors duration-200">Discord</a>
        </div>
      </div>
    </div>
  </footer>
</template>
