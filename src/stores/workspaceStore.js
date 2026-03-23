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

      const all = await db.getAll('workspaces');
      workspaces.value = all.filter(w => w.created_by === authStore.currentUser.id);
    } catch (err) {
      console.error(err);
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
      console.error(err);
    }
  };

  const updateWorkspace = async (workspaceId, newName) => {
    try {
      const db = await getDb();
      const workspace = await db.get('workspaces', workspaceId);
      if (workspace) {
        workspace.name = newName;
        await db.put('workspaces', workspace);
        const index = workspaces.value.findIndex(w => w.id === workspaceId);
        if (index !== -1) workspaces.value[index].name = newName;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteWorkspace = async (workspaceId) => {
    try {
      const db = await getDb();
      
      const allProjects = await db.getAll('projects');
      const workspaceProjects = allProjects.filter(p => p.workspace_id === workspaceId);
      
      for (const project of workspaceProjects) {
        const allBoards = await db.getAll('boards');
        const boards = allBoards.filter(b => b.project_id === project.id);
        const boardIds = boards.map(b => b.id);
        
        const allTasks = await db.getAll('tasks');
        const tasksToDelete = allTasks.filter(t => boardIds.includes(t.board_id));
        
        for (const task of tasksToDelete) {
          await db.delete('tasks', task.id);
        }
        
        for (const board of boards) {
          await db.delete('boards', board.id);
        }
        
        await db.delete('projects', project.id);
      }
      
      await db.delete('workspaces', workspaceId);
      workspaces.value = workspaces.value.filter(w => w.id !== workspaceId);
      
    } catch (err) {
      console.error(err);
    }
  };

  return { workspaces, isLoading, fetchWorkspaces, createWorkspace, updateWorkspace, deleteWorkspace };
});