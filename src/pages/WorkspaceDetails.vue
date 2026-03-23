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
        <button @click="openProjectModal" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer shadow-sm">
          <span>+</span> New Project
        </button>
      </div>
    </header>

    <div v-if="projectStore.projects.length === 0" class="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center">
      <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">No projects found</h3>
      <p class="text-slate-500 dark:text-slate-400 text-sm mb-4">Create a project to access your Kanban task boards.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="project in projectStore.projects" :key="project.id" class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow relative">
        
        <div class="absolute top-4 right-4 relative">
          <button @click.stop="toggleMenu(project.id)" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" /></svg>
          </button>
          
          <div v-if="activeMenu === project.id" class="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-10 overflow-hidden">
            <button @click="handleDeleteProject(project.id)" class="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 cursor-pointer">Delete</button>
          </div>
        </div>

        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2 pr-6">{{ project.name }}</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">{{ project.description || 'No description provided.' }}</p>
        
        <router-link :to="'/projects/' + project.id" class="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 inline-block mt-2">
          Open Task Board →
        </router-link>
      </div>
    </div>

    <Modal :isOpen="isProjectModalOpen" @close="closeProjectModal">
      <template #header>Create New Project</template>
      <template #body>
        <form @submit.prevent="handleCreateProject" id="project-form" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project Name</label>
            <input v-model="newProject.name" type="text" required placeholder="e.g. Website Redesign" class="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description (Optional)</label>
            <textarea v-model="newProject.description" rows="3" placeholder="What is this project about?" class="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"></textarea>
          </div>
        </form>
      </template>
      <template #footer>
        <button @click="closeProjectModal" type="button" class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">Cancel</button>
        <button type="submit" form="project-form" :disabled="!newProject.name.trim() || isCreating" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2">
          <span v-if="isCreating" class="animate-spin">↻</span>
          {{ isCreating ? 'Creating...' : 'Create Project' }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useProjectStore } from '../stores/projectStore';
import Modal from '../components/Modal.vue';
import Swal from 'sweetalert2';

const route = useRoute();
const projectStore = useProjectStore();

const isProjectModalOpen = ref(false);
const isCreating = ref(false);
const newProject = ref({ name: '', description: '' });
const activeMenu = ref(null);

onMounted(async () => {
  await projectStore.fetchProjects(route.params.id);
});

const toggleMenu = (id) => {
  activeMenu.value = activeMenu.value === id ? null : id;
};

const handleDeleteProject = async (id) => {
  activeMenu.value = null; // Close menu
  const isDark = document.documentElement.classList.contains('dark');
  
  const result = await Swal.fire({
    title: 'Delete project?',
    text: "This will permanently delete this project and all its tasks.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#e11d48',
    cancelButtonColor: isDark ? '#475569' : '#94a3b8',
    confirmButtonText: 'Yes, delete it!',
    background: isDark ? '#1e293b' : '#ffffff',
    color: isDark ? '#f8fafc' : '#0f172a',
  });

  if (result.isConfirmed) {
    await projectStore.deleteProject(id);
    Swal.fire({
      toast: true, position: 'top-end', icon: 'success', title: 'Project deleted',
      showConfirmButton: false, timer: 2000,
      background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a',
    });
  }
};

const openProjectModal = () => {
  newProject.value = { name: '', description: '' };
  isProjectModalOpen.value = true;
};

const closeProjectModal = () => {
  isProjectModalOpen.value = false;
};

const handleCreateProject = async () => {
  if (!newProject.value.name.trim()) return;
  
  isCreating.value = true; 
  await projectStore.createProject(route.params.id, newProject.value.name, newProject.value.description);
  await projectStore.fetchProjects(route.params.id);
  
  setTimeout(() => {
    isCreating.value = false;
    closeProjectModal();
  }, 400);
};
</script>