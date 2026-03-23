import { defineStore } from 'pinia';
import { ref } from 'vue';
import { initDB } from '../database/index';
import { useAuthStore } from './authStore';

export const useCommentStore = defineStore('comment', () => {
  const comments = ref([]);
  const isLoading = ref(false);

  const getDb = async () => await initDB();

  // Fetch comments for a specific task 
  const fetchComments = async (taskId) => {
    isLoading.value = true;
    try {
      const db = await getDb();
      const allComments = await db.getAllFromIndex('comments', 'task_id', taskId);
      // Sort oldest first (standard chat flow)
      comments.value = allComments.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      isLoading.value = false;
    }
  };

  // Add a new comment to a task 
  const addComment = async (taskId, message) => {
    try {
      const db = await getDb();
      const authStore = useAuthStore();
      
      const newComment = {
        id: crypto.randomUUID(),
        task_id: taskId,
        user_id: authStore.currentUser.name, // Storing name for easy display 
        message, 
        created_at: new Date().toISOString() 
      };

      await db.add('comments', newComment);
      comments.value.push(newComment);
      return true;
    } catch (err) {
      console.error("Error adding comment:", err);
      return false;
    }
  };

  return { comments, isLoading, fetchComments, addComment };
});