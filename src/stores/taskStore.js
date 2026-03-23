import { defineStore } from 'pinia';
import { ref } from 'vue';
import { initDB } from '../database/index';
import { useAuthStore } from './authStore';

export const useTaskStore = defineStore('task', () => {
  const tasks = ref([]);
  const isLoading = ref(false);

  const getDb = async () => await initDB();

  const fetchTasksForProject = async (boardIds) => {
    isLoading.value = true;
    try {
      const db = await getDb();
      const allTasks = [];
      for (const boardId of boardIds) {
        const boardTasks = await db.getAllFromIndex('tasks', 'board_id', boardId);
        allTasks.push(...boardTasks);
      }
      tasks.value = allTasks;
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      isLoading.value = false;
    }
  };

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
        dueDate,
        created_by: authStore.currentUser?.name || 'User',
        created_at: new Date().toISOString()
      };
      await db.add('tasks', newTask);
      tasks.value.push(newTask);
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  const moveTask = async (taskId, newBoardId) => {
    try {
      const db = await getDb();
      const task = await db.get('tasks', taskId);
      if (task) {
        task.board_id = newBoardId;
        await db.put('tasks', task);
        const index = tasks.value.findIndex(t => t.id === taskId);
        if (index !== -1) tasks.value[index].board_id = newBoardId;
      }
    } catch (err) {
      console.error("Error moving task:", err);
    }
  };

  const updateTask = async (taskId, updatedData) => {
    try {
      const db = await getDb();
      const task = await db.get('tasks', taskId);
      if (task) {
        const newTaskData = { ...task, ...updatedData };
        await db.put('tasks', newTaskData);
        const index = tasks.value.findIndex(t => t.id === taskId);
        if (index !== -1) tasks.value[index] = newTaskData;
      }
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const db = await getDb();
      await db.delete('tasks', taskId);
      tasks.value = tasks.value.filter(t => t.id !== taskId);
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  return { tasks, isLoading, fetchTasksForProject, createTask, moveTask, updateTask, deleteTask };
});