<template>
  <div class="max-w-7xl mx-auto">
    
    <header class="mb-8">
      <div class="flex items-center gap-2 mb-1 text-sm text-slate-500 font-medium">
        <router-link to="/workspaces" class="hover:text-indigo-600 cursor-pointer">Workspaces</router-link>
        <span>/</span>
        <span>Projects</span>
      </div>
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Workspace Projects</h2>
        <button @click="createDummyProject" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer shadow-sm">
          <span>+</span> New Project
        </button>
      </div>
    </header>

    <div v-if="projectStore.projects.length === 0" class="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center">
      <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">No projects found</h3>
      <p class="text-slate-500 dark:text-slate-400 text-sm mb-4">Create a project to access your Kanban task boards.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <router-link 
        v-for="project in projectStore.projects" 
        :key="project.id" 
        :to="'/projects/' + project.id" 
        class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow cursor-pointer block"
      >
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">{{ project.name }}</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">{{ project.description || 'No description provided.' }}</p>
        <span class="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">Open Task Board →</span>
      </router-link>
    </div>

  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useProjectStore } from '../stores/projectStore';

const route = useRoute();
const projectStore = useProjectStore();

onMounted(async () => {
  // Fetch projects for this specific workspace
  await projectStore.fetchProjects(route.params.id);
});

// A quick helper to let you create a project instantly and start testing tasks!
const createDummyProject = async () => {
  await projectStore.createProject(route.params.id, "My First Project", "A place to test my Kanban board!");
  await projectStore.fetchProjects(route.params.id);
};
</script>