import { defineStore } from 'pinia';
import { ref } from 'vue';
import { initDB } from '../database/index';
import { useAuthStore } from './authStore';

export const useProjectStore = defineStore('project', () => {
  const projects = ref([]);
  const activeBoards = ref([]);
  const isLoading = ref(false);

  const getDb = async () => await initDB();

  const fetchProjects = async (workspaceId) => {
    isLoading.value = true;
    try {
      const db = await getDb();
      const allProjects = await db.getAllFromIndex('projects', 'workspace_id', workspaceId);
      projects.value = allProjects;
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      isLoading.value = false;
    }
  };

  const createProject = async (workspaceId, name, description) => {
    try {
      const db = await getDb();
      const authStore = useAuthStore();
      const newProject = {
        id: crypto.randomUUID(),
        workspace_id: workspaceId,
        name,
        description,
        created_by: authStore.currentUser?.id,
        created_at: new Date().toISOString()
      };
      await db.add('projects', newProject);

      const boards = [
        { id: crypto.randomUUID(), project_id: newProject.id, name: 'To Do', order: 0 },
        { id: crypto.randomUUID(), project_id: newProject.id, name: 'In Progress', order: 1 },
        { id: crypto.randomUUID(), project_id: newProject.id, name: 'Review', order: 2 },
        { id: crypto.randomUUID(), project_id: newProject.id, name: 'Done', order: 3 }
      ];
      for (const board of boards) {
        await db.add('boards', board);
      }

      projects.value.push(newProject);
    } catch (err) {
      console.error("Error creating project:", err);
    }
  };

  // NEW: Update existing project
  const updateProject = async (projectId, name, description) => {
    try {
      const db = await getDb();
      const project = await db.get('projects', projectId);
      if (project) {
        project.name = name;
        project.description = description;
        await db.put('projects', project);
        const index = projects.value.findIndex(p => p.id === projectId);
        if (index !== -1) {
          projects.value[index].name = name;
          projects.value[index].description = description;
        }
      }
    } catch (err) {
      console.error("Error updating project:", err);
    }
  };

  const deleteProject = async (projectId) => {
    try {
      const db = await getDb();
      await db.delete('projects', projectId);
      projects.value = projects.value.filter(p => p.id !== projectId);
    } catch (err) {
      console.error("Error deleting project:", err);
    }
  };

  const fetchBoards = async (projectId) => {
    isLoading.value = true;
    try {
      const db = await getDb();
      const boards = await db.getAllFromIndex('boards', 'project_id', projectId);
      activeBoards.value = boards.sort((a, b) => a.order - b.order);
    } catch (err) {
      console.error("Error fetching boards:", err);
    } finally {
      isLoading.value = false;
    }
  };

  return { projects, activeBoards, isLoading, fetchProjects, createProject, updateProject, deleteProject, fetchBoards };
});