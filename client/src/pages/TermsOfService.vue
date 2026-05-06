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
          Terms <span class="text-blue-400">of Service</span>
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
          <h2 class="text-4xl font-bold mb-4">Terms of Service</h2>
          <p class="text-gray-400">
            Effective Date: {{ new Date().toLocaleDateString() }}
          </p>
        </div>

        <p class="text-gray-300 leading-8">
          These Terms of Service govern your access to and use of our
          subscription management platform. By using the service, you agree to
          these terms.
        </p>

        <section class="space-y-4">
          <h3 class="text-2xl font-semibold text-blue-400">1. Acceptance of Terms</h3>
          <p class="text-gray-300 leading-8">
            By creating an account or using our platform, you agree to comply
            with these Terms of Service and all applicable laws.
          </p>
        </section>

        <section class="space-y-4">
          <h3 class="text-2xl font-semibold text-blue-400">2. Use of the Service</h3>
          <p class="text-gray-300 leading-8">
            You agree to use the platform only for lawful purposes and in a way
            that does not interfere with the operation of the service.
          </p>

          <ul class="list-disc list-inside text-gray-400 space-y-2">
            <li>No unauthorized access attempts</li>
            <li>No misuse or abuse of platform features</li>
            <li>No uploading malicious code or harmful content</li>
          </ul>
        </section>

        <section class="space-y-4">
          <h3 class="text-2xl font-semibold text-blue-400">3. User Accounts</h3>
          <p class="text-gray-300 leading-8">
            You are responsible for maintaining the confidentiality of your
            account credentials and for all activity under your account.
          </p>
        </section>

        <section class="space-y-4">
          <h3 class="text-2xl font-semibold text-blue-400">4. Subscription Information</h3>
          <p class="text-gray-300 leading-8">
            Our platform helps organize and track subscription data you provide.
            We do not guarantee accuracy if information entered by users is
            incomplete or incorrect.
          </p>
        </section>

        <section class="space-y-4">
          <h3 class="text-2xl font-semibold text-blue-400">5. Service Availability</h3>
          <p class="text-gray-300 leading-8">
            We aim for high availability but do not guarantee uninterrupted
            access. Maintenance, updates, or technical issues may temporarily
            affect service availability.
          </p>
        </section>

        <section class="space-y-4">
          <h3 class="text-2xl font-semibold text-blue-400">6. Limitation of Liability</h3>
          <p class="text-gray-300 leading-8">
            We are not liable for financial losses, missed renewals, or damages
            resulting from use of the platform.
          </p>
        </section>

        <section class="space-y-4">
          <h3 class="text-2xl font-semibold text-blue-400">7. Account Termination</h3>
          <p class="text-gray-300 leading-8">
            We reserve the right to suspend or terminate accounts that violate
            these terms or misuse the platform.
          </p>
        </section>

        <section class="space-y-4">
          <h3 class="text-2xl font-semibold text-blue-400">8. Changes to Terms</h3>
          <p class="text-gray-300 leading-8">
            We may update these Terms of Service at any time. Continued use of
            the service after changes constitutes acceptance.
          </p>
        </section>

        <section class="space-y-4">
          <h3 class="text-2xl font-semibold text-blue-400">9. Governing Law</h3>
          <p class="text-gray-300 leading-8">
            These terms are governed by applicable laws in your jurisdiction.
          </p>
        </section>

        <section class="space-y-4">
          <h3 class="text-2xl font-semibold text-blue-400">10. Contact</h3>
          <p class="text-gray-300 leading-8">
            Questions about these terms can be sent to:
            <span class="text-blue-400">legal@yoursite.com</span>
          </p>
        </section>

      </div>
    </div>
  </div>
</template>