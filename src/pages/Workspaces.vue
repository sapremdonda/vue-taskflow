<template>
  <div class="max-w-7xl mx-auto">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Workspaces</h2>
        <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your personal and team environments.</p>
      </div>
      <button @click="isModalOpen = true" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer shadow-sm">
        <span>+</span> New Workspace
      </button>
    </div>

    <div v-if="workspaceStore.workspaces.length === 0" class="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center">
      <div class="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🏢</div>
      <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">No workspaces yet</h3>
      <p class="text-slate-500 dark:text-slate-400 text-sm mb-4">Create your first workspace to start organizing your projects.</p>
      <a @click="isModalOpen = true" class="text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer hover:underline">Create a workspace →</a>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="workspace in workspaceStore.workspaces" :key="workspace.id" class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow relative group">
        
        <div class="absolute top-4 right-4 relative">
          <button @click.stop="toggleMenu(workspace.id)" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" /></svg>
          </button>
          
          <div v-if="activeMenu === workspace.id" class="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-10 overflow-hidden">
            <button @click="handleDeleteWorkspace(workspace.id)" class="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 cursor-pointer">Delete</button>
          </div>
        </div>

        <div class="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center font-bold text-xl mb-4">
          {{ workspace.name.charAt(0).toUpperCase() }}
        </div>
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">{{ workspace.name }}</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">Created {{ new Date(workspace.created_at).toLocaleDateString() }}</p>
        
        <router-link :to="'/workspaces/' + workspace.id" class="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer">
          View Projects →
        </router-link>
      </div>
    </div>

    <Modal :isOpen="isModalOpen" @close="isModalOpen = false">
      <template #header>Create New Workspace</template>
      <template #body>
        <form @submit.prevent="handleCreateWorkspace" id="workspace-form">
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Workspace Name</label>
          <input v-model="newWorkspaceName" type="text" required class="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none">
        </form>
      </template>
      <template #footer>
        <button @click="isModalOpen = false" type="button" class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">Cancel</button>
        <button type="submit" form="workspace-form" :disabled="!newWorkspaceName.trim() || isCreating" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg cursor-pointer disabled:opacity-50 flex items-center gap-2">
          <span v-if="isCreating" class="animate-spin">↻</span>
          {{ isCreating ? 'Creating...' : 'Create Workspace' }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useWorkspaceStore } from '../stores/workspaceStore';
import Modal from '../components/Modal.vue';
import Swal from 'sweetalert2';

const workspaceStore = useWorkspaceStore();
const isModalOpen = ref(false);
const newWorkspaceName = ref('');
const isCreating = ref(false);
const activeMenu = ref(null);

onMounted(async () => {
  await workspaceStore.fetchWorkspaces();
});

const toggleMenu = (id) => {
  activeMenu.value = activeMenu.value === id ? null : id;
};

const handleDeleteWorkspace = async (id) => {
  activeMenu.value = null; // Close menu
  const isDark = document.documentElement.classList.contains('dark');
  
  const result = await Swal.fire({
    title: 'Delete workspace?',
    text: "This will remove the workspace and all associated projects.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#e11d48',
    cancelButtonColor: isDark ? '#475569' : '#94a3b8',
    confirmButtonText: 'Yes, delete it!',
    background: isDark ? '#1e293b' : '#ffffff',
    color: isDark ? '#f8fafc' : '#0f172a',
  });

  if (result.isConfirmed) {
    await workspaceStore.deleteWorkspace(id);
    Swal.fire({
      toast: true, position: 'top-end', icon: 'success', title: 'Workspace deleted',
      showConfirmButton: false, timer: 2000,
      background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a',
    });
  }
};

const handleCreateWorkspace = async () => {
  if (!newWorkspaceName.value.trim()) return;
  isCreating.value = true;
  await workspaceStore.createWorkspace(newWorkspaceName.value);
  
  setTimeout(() => {
    isCreating.value = false;
    newWorkspaceName.value = '';
    isModalOpen.value = false;
  }, 400);
};
</script>