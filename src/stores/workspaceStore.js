import { defineStore } from 'pinia';
import { ref } from 'vue';
import { initDB } from '../database/index';
import { useAuthStore } from './authStore';

export const useWorkspaceStore = defineStore('workspace', () => {
  const workspaces = ref([]);
  const isLoading = ref(false);

  const getDb = async () => await initDB();

  const fetchWorkspaces = async () => {
    isLoading.value = true;
    try {
      const db = await getDb();
      const authStore = useAuthStore();
      if (!authStore.currentUser) return;

      const all = await db.getAllFromIndex('workspaces', 'created_by', authStore.currentUser.id);
      workspaces.value = all;
    } catch (err) {
      console.error("Error fetching workspaces:", err);
    } finally {
      isLoading.value = false;
    }
  };

  const createWorkspace = async (name) => {
    try {
      const db = await getDb();
      const authStore = useAuthStore();
      const newWorkspace = {
        id: crypto.randomUUID(),
        name,
        created_by: authStore.currentUser.id,
        created_at: new Date().toISOString()
      };
      await db.add('workspaces', newWorkspace);
      workspaces.value.push(newWorkspace);
    } catch (err) {
      console.error("Error creating workspace:", err);
    }
  };

  const deleteWorkspace = async (workspaceId) => {
    try {
      const db = await getDb();
      await db.delete('workspaces', workspaceId);
      workspaces.value = workspaces.value.filter(w => w.id !== workspaceId);
    } catch (err) {
      console.error("Error deleting workspace:", err);
    }
  };

  return { workspaces, isLoading, fetchWorkspaces, createWorkspace, deleteWorkspace };
});