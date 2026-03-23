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
          <router-link to="/settings" class="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer" active-class="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
            Settings
          </router-link>
          <button @click="toggleDarkMode" class="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
            <span>Dark Mode</span>
            <span class="text-xs bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded">⌘D</span>
          </button>
          <button @click="handleLogout" class="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-colors cursor-pointer">
            Log Out
          </button>
        </div>
      </aside>

      <main class="flex flex-col h-screen overflow-hidden relative">
        <header class="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-8 shrink-0 z-20">
          <div class="flex-1 max-w-xl relative">
            
            <div class="relative flex items-center">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-slate-400">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </div>
              <input 
                v-model="searchQuery"
                id="global-search" 
                type="text" 
                placeholder="Search tasks, projects... (Press '/')" 
                class="w-full bg-slate-100 dark:bg-slate-900 border-transparent rounded-lg pl-10 pr-4 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white placeholder-slate-400 outline-none transition-all"
              >
            </div>

            <div v-if="searchQuery" class="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
              <div class="p-2">
                <div v-if="searchResults.projects.length === 0 && searchResults.tasks.length === 0" class="p-3 text-sm text-slate-500 text-center">
                  No results found for "{{ searchQuery }}"
                </div>
                
                <div v-if="searchResults.projects.length > 0" class="mb-2">
                  <div class="text-xs font-bold text-slate-400 uppercase px-3 py-1">Projects</div>
                  <router-link 
                    v-for="p in searchResults.projects" 
                    :key="p.id" 
                    :to="'/projects/' + p.id" 
                    @click="searchQuery = ''" 
                    class="block px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
                  >
                    {{ p.name }}
                  </router-link>
                </div>

                <div v-if="searchResults.tasks.length > 0">
                  <div class="text-xs font-bold text-slate-400 uppercase px-3 py-1">Tasks</div>
                  <router-link 
                    v-for="t in searchResults.tasks" 
                    :key="t.id" 
                    :to="'/projects/' + t.project_id" 
                    @click="searchQuery = ''" 
                    class="block px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
                  >
                    {{ t.title }}
                  </router-link>
                </div>
              </div>
            </div>
          </div>

          <div class="ml-4 flex items-center gap-4">
            <button class="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>
            </button>
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
import { useSearch } from './composables/useSearch';
import Avatar from './components/Avatar.vue';

const router = useRouter();
const authStore = useAuthStore();

// Initialize global system features (shortcuts & notifications)
useAppSystem();

// Initialize Real-time Search
const { searchQuery, searchResults } = useSearch();

// Dark Mode Toggle
const isDark = useDark();
const toggleDark = useToggle(isDark);

const toggleDarkMode = () => {
  toggleDark();
};

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

// Initialize the complex IndexedDB on app load
onMounted(async () => {
  await initDB();
});
</script>