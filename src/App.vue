<template>
  <div class="bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 transition-colors duration-200">

    <div v-if="authStore.currentUser" class="min-h-screen grid grid-cols-[250px_1fr] overflow-hidden">

      <aside class="flex flex-col justify-between bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-4 h-screen">
        
        <div>
          <div class="flex items-center gap-3 mb-8 px-2 mt-2">
            <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">T</div>
            <h1 class="text-xl font-bold tracking-tight">TaskFlow</h1>
          </div>

          <nav class="space-y-1">
            <router-link to="/dashboard" class="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" active-class="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
              Dashboard
            </router-link>
            <router-link to="/workspaces" class="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" active-class="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
              Workspaces
            </router-link>
          </nav>
        </div>

        <div class="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
          <router-link to="/settings" class="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" active-class="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
            Settings
          </router-link>
          <button @click="toggleDarkMode" class="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
            <span>Dark Mode</span>
            <span class="text-xs bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded">⌘D</span>
          </button>
          <button @click="handleLogout" class="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-colors">
            Log Out
          </button>
        </div>
      </aside>

      <main class="flex flex-col h-screen overflow-hidden relative">
        <header class="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-8 shrink-0">
          <div class="flex-1 max-w-xl">
            <div class="relative">
              <input id="global-search" type="text" placeholder="Search tasks, projects... (Press '/')" class="w-full bg-slate-100 dark:bg-slate-900 border-transparent rounded-lg pl-10 pr-4 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white placeholder-slate-400 outline-none transition-all">
              <span class="absolute left-3 top-2.5 text-slate-400">⌕</span>
            </div>
          </div>
          <div class="ml-4 flex items-center gap-4">
            <button class="text-slate-400 hover:text-slate-500 transition-colors">🔔</button>
            <Avatar :name="authStore.currentUser.name" size="md" />
          </div>
        </header>

        <div class="flex-1 overflow-auto p-8">
          <router-view></router-view>
        </div>
      </main>

    </div>

    <div v-else>
      <router-view></router-view>
    </div>

  </div>
</template>

<script setup>
import { useDark, useToggle } from '@vueuse/core';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { initDB } from './database/index';
import { useAuthStore } from './stores/authStore';
import { useAppSystem } from './composables/useAppSystem';
import Avatar from './components/Avatar.vue';

const router = useRouter();
const authStore = useAuthStore();

useAppSystem();

const isDark = useDark();
const toggleDark = useToggle(isDark);

const toggleDarkMode = () => {
  toggleDark();
};

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

onMounted(async () => {
  await initDB();
});
</script>
