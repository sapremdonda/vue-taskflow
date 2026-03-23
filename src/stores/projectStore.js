import { defineStore } from 'pinia';
import { ref } from 'vue';
import { initDB } from '../database/index';

export const useProjectStore = defineStore('project', () => {
  const projects = ref([]);
  const activeBoards = ref([]); // The columns for the currently viewed project
  const isLoading = ref(false);

  const getDb = async () => await initDB();

  // Fetch all projects for a specific workspace
  const fetchProjects = async (workspaceId) => {
    isLoading.value = true;
    try {
      const db = await getDb();
      const allProjects = await db.getAllFromIndex('projects', 'workspace_id', workspaceId);
      projects.value = allProjects.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      isLoading.value = false;
    }
  };

  // Create a project AND its default columns 
  const createProject = async (workspaceId, name, description) => {
    isLoading.value = true;
    try {
      const db = await getDb();
      const projectId = crypto.randomUUID();

      const newProject = {
        id: projectId,
        workspace_id: workspaceId,
        name,
        description,
        created_at: new Date().toISOString()
      };

      await db.add('projects', newProject);
      projects.value.unshift(newProject);

      // Automatically generate default columns
      const defaultColumns = ['To Do', 'In Progress', 'Review', 'Done'];
      for (let i = 0; i < defaultColumns.length; i++) {
        await db.add('boards', {
          id: crypto.randomUUID(),
          project_id: projectId,
          name: defaultColumns[i],
          position: i
        });
      }
      return projectId;
    } catch (err) {
      console.error("Error creating project:", err);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  // Fetch columns for the Kanban board
  const fetchBoards = async (projectId) => {
    try {
      const db = await getDb();
      const boards = await db.getAllFromIndex('boards', 'project_id', projectId);
      activeBoards.value = boards.sort((a, b) => a.position - b.position);
    } catch (err) {
      console.error("Error fetching boards:", err);
    }
  };

  return { projects, activeBoards, isLoading, fetchProjects, createProject, fetchBoards };
});