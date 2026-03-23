<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-8">
      
      <div class="text-center mb-8">
        <div class="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">T</div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h2>
        <p class="text-slate-500 dark:text-slate-400 text-sm mt-2">Enter your details to access your workspace.</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email address</label>
            <input 
              v-model="email" 
              type="email" 
              required 
              class="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
              placeholder="you@company.com"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <input 
              v-model="password" 
              type="password" 
              required 
              class="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
              placeholder="••••••••"
            >
          </div>

          <div v-if="authStore.error" class="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800">
            {{ authStore.error }}
          </div>

          <button 
            type="submit" 
            :disabled="authStore.isLoading"
            class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors flex justify-center items-center disabled:opacity-70"
          >
            <span v-if="authStore.isLoading" class="animate-spin mr-2">↻</span>
            {{ authStore.isLoading ? 'Signing in...' : 'Sign in' }}
          </button>
        </div>
        
        <div class="my-5 flex items-center">
          <div class="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
          <span class="flex-shrink-0 mx-4 text-slate-400 text-sm">or</span>
          <div class="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
        </div>

        <button 
          @click="fillTestCredentials" 
          type="button"
          class="w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors flex justify-center items-center"
        >
          Login with test credentials
        </button>
      </form>

      <p class="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
        Don't have an account? 
        <router-link to="/register" class="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Sign up</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const email = ref('');
const password = ref('');
const authStore = useAuthStore();
const router = useRouter();

// Auto-fill the inputs when the secondary button is clicked
const fillTestCredentials = () => {
  email.value = 'demo@taskflow.com';
  password.value = 'password123';
};

const handleLogin = async () => {
  let success = await authStore.login(email.value, password.value);
  
  // MAGIC FALLBACK: If the login fails but they are using the demo credentials,
  // it means the browser's database is empty. Auto-register the demo user for them!
  if (!success && email.value === 'demo@taskflow.com' && password.value === 'password123') {
    // Clear the "Invalid credentials" error since we are about to fix it
    authStore.error = null; 
    success = await authStore.register('Demo User', email.value, password.value);
  }

  if (success) {
    router.push('/dashboard');
  }
};
</script>