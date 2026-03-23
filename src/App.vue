<template>
  <div class="bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 transition-colors duration-200">

    <div v-if="authStore.currentUser" class="flex h-screen overflow-hidden">

      <div 
        v-if="isSidebarOpen" 
        @click="isSidebarOpen = false" 
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
      ></div>

      <aside 
        :class="[isSidebarOpen ? 'translate-x-0' : '-translate-x-full']"
        class="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-4 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0"
      >
        <div>
          <div class="flex items-center justify-between mb-8 px-2 mt-2">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">T</div>
              <h1 class="text-xl font-bold tracking-tight">TaskFlow</h1>
            </div>
            <button @click="isSidebarOpen = false" class="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <nav class="space-y-1">
            <router-link to="/dashboard" class="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" active-class="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">Dashboard</router-link>
            <router-link to="/workspaces" class="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" active-class="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">Workspaces</router-link>
          </nav>
        </div>

        <div class="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
          <router-link to="/settings" class="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">Settings</router-link>
          <button @click="toggleDarkMode" class="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
            <span>Dark Mode</span>
            <span class="text-xs bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded hidden lg:inline-block">⌘D</span>
          </button>
          <button @click="handleLogout" class="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-colors cursor-pointer">Log Out</button>
        </div>
      </aside>

      <main class="flex-1 flex flex-col h-screen overflow-hidden min-w-0 relative">
        <header class="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 lg:px-8 shrink-0 z-20">
          
          <div class="flex items-center flex-1 max-w-xl relative gap-2 sm:gap-4">
            <button @click="isSidebarOpen = true" class="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
            </button>

            <div class="relative flex items-center w-full">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 sm:w-5 sm:h-5 text-slate-400"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
              </div>
              <input v-model="searchQuery" id="global-search" type="text" placeholder="Search..." class="w-full bg-slate-100 dark:bg-slate-900 border-transparent rounded-lg pl-9 sm:pl-10 pr-4 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white placeholder-slate-400 outline-none transition-all">
            </div>

            <div v-if="searchQuery" class="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
              <div class="p-2">
                <div v-if="searchResults.projects.length === 0 && searchResults.tasks.length === 0" class="p-3 text-sm text-slate-500 text-center">No results found</div>
                <div v-if="searchResults.projects.length > 0" class="mb-2">
                  <div class="text-xs font-bold text-slate-400 uppercase px-3 py-1">Projects</div>
                  <router-link v-for="p in searchResults.projects" :key="p.id" :to="'/projects/' + p.id" @click="searchQuery = ''" class="block px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer">{{ p.name }}</router-link>
                </div>
                <div v-if="searchResults.tasks.length > 0">
                  <div class="text-xs font-bold text-slate-400 uppercase px-3 py-1">Tasks</div>
                  <router-link v-for="t in searchResults.tasks" :key="t.id" :to="'/projects/' + t.project_id" @click="searchQuery = ''" class="block px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer">{{ t.title }}</router-link>
                </div>
              </div>
            </div>
          </div>

          <div class="ml-2 sm:ml-4 flex items-center gap-2 sm:gap-4">
            <button @click="showTaskStatusNotification" class="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer relative p-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 sm:w-6 sm:h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>
              <span v-if="taskStore.tasks.length > 0" class="absolute top-1 right-1 block h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-800"></span>
            </button>
            <Avatar :name="authStore.currentUser.name" size="sm" class="sm:hidden" />
            <Avatar :name="authStore.currentUser.name" size="md" class="hidden sm:flex" />
          </div>
        </header>

        <div class="flex-1 overflow-auto p-4 lg:p-8">
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
import { ref, watch, onMounted } from 'vue';
import { useDark, useToggle } from '@vueuse/core';
import { useRoute, useRouter } from 'vue-router';
import { initDB } from './database/index';
import { useAuthStore } from './stores/authStore';
import { useTaskStore } from './stores/taskStore';
import { useAppSystem } from './composables/useAppSystem';
import { useSearch } from './composables/useSearch';
import Avatar from './components/Avatar.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const taskStore = useTaskStore();

const isSidebarOpen = ref(false);
watch(() => route.path, () => { isSidebarOpen.value = false; });

const { triggerNotification } = useAppSystem();
const { searchQuery, searchResults } = useSearch();

const isDark = useDark();
const toggleDark = useToggle(isDark);
const toggleDarkMode = () => toggleDark();

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const showTaskStatusNotification = () => {
  const totalTasks = taskStore.tasks.length;
  const highPriority = taskStore.tasks.filter(t => t.priority === 'High').length;

  if (totalTasks === 0) {
    triggerNotification('All Caught Up! 🌟', { body: 'You have no active tasks in this project right now.', icon: 'success' });
  } else if (highPriority > 0) {
    triggerNotification('Action Required ⚠️', { body: `You have ${highPriority} High Priority task(s) waiting!`, icon: 'warning' });
  } else {
    triggerNotification('Daily Update 📊', { body: `Tracking ${totalTasks} task(s). Keep up the good work!`, icon: 'info' });
  }
};

onMounted(async () => await initDB());
</script>