<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-8">
      
      <div class="text-center mb-8">
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Create an account</h2>
        <p class="text-slate-500 dark:text-slate-400 text-sm mt-2">Start managing your projects with TaskFlow today.</p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
          <input v-model="name" type="text" required class="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" placeholder="Jane Doe">
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
          <input v-model="email" type="email" required class="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" placeholder="you@company.com">
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
          <input v-model="password" type="password" required class="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" placeholder="••••••••">
        </div>

        <div v-if="authStore.error" class="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          {{ authStore.error }}
        </div>

        <button type="submit" :disabled="authStore.isLoading" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors flex justify-center items-center disabled:opacity-70">
          <span v-if="authStore.isLoading" class="animate-spin mr-2">↻</span>
          {{ authStore.isLoading ? 'Creating account...' : 'Create account' }}
        </button>
      </form>

      <p class="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
        Already have an account? 
        <router-link to="/login" class="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Log in</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const name = ref('');
const email = ref('');
const password = ref('');
const authStore = useAuthStore();
const router = useRouter();

const handleRegister = async () => {
  const success = await authStore.register(name.value, email.value, password.value);
  if (success) {
    router.push('/dashboard');
  }
};
</script>