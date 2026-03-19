import { defineStore } from 'pinia';
import { ref } from 'vue';
import { initDB } from '../database/index';

export const useActivityStore = defineStore('activity', () => {
  const activities = ref([]);

  const getDb = async () => await initDB();

  // Fetch activities for a specific reference (like a Project ID or Task ID) 
  const fetchActivities = async (referenceId) => {
    try {
      const db = await getDb();
      const allActivities = await db.getAllFromIndex('activities', 'reference_id', referenceId);
      // Sort newest first
      activities.value = allActivities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return activities.value;
    } catch (err) {
      console.error("Error fetching activities:", err);
      return [];
    }
  };

  // Log a new activity 
  const logActivity = async (type, referenceId, message) => {
    try {
      const db = await getDb();
      const newActivity = {
        id: crypto.randomUUID(),
        type, // e.g., 'task_created', 'task_moved' 
        reference_id: referenceId, // The ID of the task or project 
        message, // e.g., 'John moved task to In Progress' 
        created_at: new Date().toISOString() 
      };

      await db.add('activities', newActivity);
      activities.value.unshift(newActivity);
    } catch (err) {
      console.error("Error logging activity:", err);
    }
  };

  return { activities, fetchActivities, logActivity };
});