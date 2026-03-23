<template>
  <div v-if="isOpen && task" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" @click.self="$emit('close')">
    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
      
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-start shrink-0">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 mb-2 inline-block">
            {{ task.priority }} Priority
          </span>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white">{{ task.title }}</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            Created by {{ task.created_by }} • <span v-if="task.due_date">Due {{ new Date(task.due_date).toLocaleDateString() }}</span>
          </p>
        </div>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors text-xl">✕</button>
      </div>

      <div class="px-6 py-4 overflow-y-auto flex-1 space-y-8 custom-scrollbar">
        
        <section>
          <h4 class="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">📝 Description</h4>
          <p class="text-slate-600 dark:text-slate-300 text-sm bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700/50">
            {{ task.description || 'No description provided.' }}
          </p>
        </section>

        <section>
          <h4 class="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">⏱ Activity Timeline</h4>
          <ul class="space-y-3 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
            <li v-for="activity in activityStore.activities" :key="activity.id" class="relative flex items-center gap-4 text-sm">
              <div class="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800 z-10 shrink-0"></div>
              <div>
                <span class="text-slate-700 dark:text-slate-300">{{ activity.message }}</span>
                <span class="text-xs text-slate-400 ml-2">{{ new Date(activity.created_at).toLocaleString() }}</span>
              </div>
            </li>
            <li v-if="activityStore.activities.length === 0" class="text-sm text-slate-500 ml-8">No recent activity.</li>
          </ul>
        </section>

        <section>
          <h4 class="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">💬 Comments</h4>
          <div class="space-y-4 mb-4">
            <div v-for="comment in commentStore.comments" :key="comment.id" class="flex gap-3">
              <div class="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-xs shrink-0">
                {{ comment.user_id.substring(0, 2).toUpperCase() }}
              </div>
              <div class="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg rounded-tl-none border border-slate-100 dark:border-slate-700/50 w-full">
                <div class="flex justify-between items-center mb-1">
                  <span class="text-xs font-semibold text-slate-900 dark:text-white">{{ comment.user_id }}</span>
                  <span class="text-xs text-slate-400">{{ new Date(comment.created_at).toLocaleDateString() }}</span>
                </div>
                <p class="text-sm text-slate-600 dark:text-slate-300">{{ comment.message }}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 shrink-0">
        <form @submit.prevent="submitComment" class="flex gap-2">
          <input 
            v-model="newComment" 
            type="text" 
            placeholder="Write a comment..." 
            required
            class="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
          >
          <button type="submit" :disabled="!newComment.trim()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
            Post
          </button>
        </form>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useCommentStore } from '../stores/commentStore';
import { useActivityStore } from '../stores/activityStore';

const props = defineProps({
  isOpen: Boolean,
  task: Object
});

defineEmits(['close']);

const commentStore = useCommentStore();
const activityStore = useActivityStore();
const newComment = ref('');

// When the modal opens and a task is provided, fetch its specific data
watch(() => props.task, async (newTask) => {
  if (newTask) {
    await commentStore.fetchComments(newTask.id);
    await activityStore.fetchActivities(newTask.id);
  }
});

const submitComment = async () => {
  if (!newComment.value.trim() || !props.task) return;
  await commentStore.addComment(props.task.id, newComment.value);
  
  // Bonus: Log the comment creation in the activity timeline!
  await activityStore.logActivity('comment_added', props.task.id, 'Added a new comment');
  
  newComment.value = '';
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.5); border-radius: 20px; }
</style>