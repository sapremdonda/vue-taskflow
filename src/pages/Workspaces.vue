<template>
  <div class="max-w-6xl mx-auto">
    
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Workspaces</h2>
        <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your personal and team environments.</p>
      </div>
      <button 
        @click="isModalOpen = true" 
        class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        New Workspace
      </button>
    </div>

    <div v-if="workspaceStore.isLoading && workspaceStore.workspaces.length === 0" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>

    <div v-else-if="workspaceStore.workspaces.length === 0" class="bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
      <div class="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🏢</div>
      <h3 class="text-lg font-medium text-slate-900 dark:text-white">No workspaces yet</h3>
      <p class="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">Create your first workspace to start organizing your projects and tasks.</p>
      <button @click="isModalOpen = true" class="mt-6 text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
        Create a workspace →
      </button>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <router-link 
        v-for="workspace in workspaceStore.workspaces" 
        :key="workspace.id"
        :to="`/workspaces/${workspace.id}`"
        class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600 transition-all group cursor-pointer flex flex-col h-full"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center font-bold text-xl">
            {{ workspace.name.substring(0, 1).toUpperCase() }}
          </div>
          <button class="text-slate-400 hover:text-slate-600 dark:hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" @click.prevent>
            ⋮
          </button>
        </div>
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">{{ workspace.name }}</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-auto pt-4 flex items-center gap-1">
          Created {{ new Date(workspace.created_at).toLocaleDateString() }}
        </p>
      </router-link>
    </div>

    <Modal :isOpen="isModalOpen" @close="closeModal">
      <template #header>Create New Workspace</template>
      <template #body>
        <form @submit.prevent="handleCreateWorkspace" id="workspace-form">
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Workspace Name</label>
          <input 
            v-model="newWorkspaceName" 
            type="text" 
            required 
            class="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="e.g. Marketing Team"
          >
        </form>
      </template>
      <template #footer>
        <button @click="closeModal" class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Cancel</button>
        <button 
          type="submit" 
          form="workspace-form" 
          :disabled="workspaceStore.isLoading || !newWorkspaceName.trim()"
          class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          Create Workspace
        </button>
      </template>
    </Modal>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useWorkspaceStore } from '../stores/workspaceStore';
import Modal from '../components/Modal.vue';

const workspaceStore = useWorkspaceStore();
const isModalOpen = ref(false);
const newWorkspaceName = ref('');

// Load workspaces when page mounts
onMounted(() => {
  workspaceStore.fetchWorkspaces();
});

const closeModal = () => {
  isModalOpen.value = false;
  newWorkspaceName.value = '';
};

const handleCreateWorkspace = async () => {
  if (!newWorkspaceName.value.trim()) return;
  
  const success = await workspaceStore.createWorkspace(newWorkspaceName.value);
  if (success) {
    closeModal();
  }
};
</script>