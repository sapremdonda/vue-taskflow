import { defineStore } from 'pinia';
import { ref } from 'vue';
import { initDB } from '../database/index';
import { useAuthStore } from './authStore';

export const useTaskStore = defineStore('task', () => {
  const tasks = ref([]);
  const isLoading = ref(false);

  const getDb = async () => await initDB();

  // Fetch tasks for all boards in a project
  const fetchTasksForProject = async (boardIds) => {
    isLoading.value = true;
    try {
      const db = await getDb();
      let allTasks = [];
      // Fetch tasks for each column
      for (const boardId of boardIds) {
        const boardTasks = await db.getAllFromIndex('tasks', 'board_id', boardId);
        allTasks = [...allTasks, ...boardTasks];
      }
      tasks.value = allTasks;
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      isLoading.value = false;
    }
  };

  // Create a new task 
  const createTask = async (boardId, title, description, priority, dueDate) => {
    try {
      const db = await getDb();
      const authStore = useAuthStore();
      
      const newTask = {
        id: crypto.randomUUID(),
        board_id: boardId,
        title,
        description,
        priority,
        due_date: dueDate,
        created_by: authStore.currentUser.name,
        created_at: new Date().toISOString()
      };

      await db.add('tasks', newTask);
      tasks.value.push(newTask);
      return newTask;
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  // Handle Drag & Drop updates 
  const moveTask = async (taskId, newBoardId) => {
    try {
      const db = await getDb();
      const task = await db.get('tasks', taskId);
      
      if (task) {
        task.board_id = newBoardId;
        await db.put('tasks', task); // Update IndexedDB
        
        // Update local state
        const index = tasks.value.findIndex(t => t.id === taskId);
        if (index !== -1) tasks.value[index].board_id = newBoardId;
      }
    } catch (err) {
      console.error("Error moving task:", err);
    }
  };

  return { tasks, isLoading, fetchTasksForProject, createTask, moveTask };
});