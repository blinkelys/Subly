<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-gray-950 text-white">
    <!-- Header -->
    <div class="border-b border-gray-800 bg-gray-900/50 backdrop-blur-lg sticky top-0 z-50">
      <div class="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 class="text-xl font-bold">
          Privacy <span class="text-blue-400">Policy</span>
        </h1>

        <button
          @click="goBack"
          class="px-4 py-2 rounded-lg border border-gray-700 hover:border-blue-400 text-gray-300 hover:text-white transition-all"
        >
          Back
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-4xl mx-auto px-6 py-16">
      <div class="space-y-8">

        <div>
          <h2 class="text-4xl font-bold mb-4">Privacy Policy</h2>
          <p class="text-gray-400">
            Effective Date: {{ new Date().toLocaleDateString() }}
          </p>
        </div>

        <p class="text-gray-300 leading-8">
          Your privacy matters to us. This Privacy Policy explains how we collect,
          use, and protect your information when you use our subscription
          management platform.
        </p>

        <section class="space-y-4">
          <h3 class="text-2xl font-semibold text-blue-400">1. Information We Collect</h3>
          <p class="text-gray-300 leading-8">
            We may collect:
          </p>
          <ul class="list-disc list-inside text-gray-400 space-y-2">
            <li>Name and email address</li>
            <li>Account credentials</li>
            <li>Subscription data you manually enter</li>
            <li>Usage analytics and device information</li>
            <li>Payment-related metadata (if premium plans are introduced)</li>
          </ul>
        </section>

        <section class="space-y-4">
          <h3 class="text-2xl font-semibold text-blue-400">2. How We Use Your Information</h3>
          <ul class="list-disc list-inside text-gray-400 space-y-2">
            <li>Provide and maintain our service</li>
            <li>Send renewal reminders and notifications</li>
            <li>Improve platform performance</li>
            <li>Enhance security and fraud prevention</li>
            <li>Communicate important updates</li>
          </ul>
        </section>

        <section class="space-y-4">
          <h3 class="text-2xl font-semibold text-blue-400">3. Data Security</h3>
          <p class="text-gray-300 leading-8">
            We implement industry-standard security measures including encryption,
            secure authentication, and regular infrastructure monitoring.
          </p>
        </section>

        <section class="space-y-4">
          <h3 class="text-2xl font-semibold text-blue-400">4. Data Sharing</h3>
          <p class="text-gray-300 leading-8">
            We do not sell your personal data. We may share limited information
            only with trusted service providers necessary to operate the platform.
          </p>
        </section>

        <section class="space-y-4">
          <h3 class="text-2xl font-semibold text-blue-400">5. Cookies & Analytics</h3>
          <p class="text-gray-300 leading-8">
            We use cookies and analytics tools to improve functionality and
            understand usage trends.
          </p>
        </section>

        <section class="space-y-4">
          <h3 class="text-2xl font-semibold text-blue-400">6. Your Rights</h3>
          <p class="text-gray-300 leading-8">
            You may request access, correction, or deletion of your data at any
            time by contacting support.
          </p>
        </section>

        <section class="space-y-4">
          <h3 class="text-2xl font-semibold text-blue-400">7. Policy Updates</h3>
          <p class="text-gray-300 leading-8">
            We may update this Privacy Policy periodically. Continued use of the
            platform constitutes acceptance of changes.
          </p>
        </section>

        <section class="space-y-4">
          <h3 class="text-2xl font-semibold text-blue-400">8. Contact Us</h3>
          <p class="text-gray-300 leading-8">
            For privacy-related questions, contact us at:
            <span class="text-blue-400">privacy@yoursite.com</span>
          </p>
        </section>
      </div>
    </div>
  </div>
</template>