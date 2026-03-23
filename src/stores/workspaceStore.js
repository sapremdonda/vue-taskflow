import { defineStore } from 'pinia';
import { ref } from 'vue';
import { initDB } from '../database/index';
import { useAuthStore } from './authStore';

export const useWorkspaceStore = defineStore('workspace', () => {
  const workspaces = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  const getDb = async () => await initDB();

  // Fetch workspaces belonging to the logged-in user
  const fetchWorkspaces = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const authStore = useAuthStore();
      if (!authStore.currentUser) throw new Error('User not authenticated');

      const db = await getDb();
      // Use the IndexedDB index we created earlier to find workspaces by owner_id
      const allWorkspaces = await db.getAllFromIndex('workspaces', 'owner_id', authStore.currentUser.id);
      workspaces.value = allWorkspaces.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } catch (err) {
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  };

  // Create a new workspace with the exact required fields 
  const createWorkspace = async (name) => {
    isLoading.value = true;
    error.value = null;
    try {
      const authStore = useAuthStore();
      const db = await getDb();

      const newWorkspace = {
        id: crypto.randomUUID(),
        name: name,
        owner_id: authStore.currentUser.id,
        created_at: new Date().toISOString()
      };

      await db.add('workspaces', newWorkspace);
      workspaces.value.unshift(newWorkspace); // Add to local state
      
      return newWorkspace;
    } catch (err) {
      error.value = err.message;
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    workspaces,
    isLoading,
    error,
    fetchWorkspaces,
    createWorkspace
  };
});