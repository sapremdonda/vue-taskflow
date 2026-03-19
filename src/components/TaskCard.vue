<template>
  <div class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600 transition-all cursor-grab active:cursor-grabbing group">
    
    <div class="flex justify-between items-start mb-2">
      <span 
        class="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
        :class="priorityClasses"
      >
        {{ task.priority || 'Low' }}
      </span>
      <button class="text-slate-400 hover:text-slate-600 dark:hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
        ⋮
      </button>
    </div>

    <h4 class="font-medium text-slate-900 dark:text-slate-100 mb-1 line-clamp-2">
      {{ task.title }}
    </h4>
    
    <p v-if="task.description" class="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-1">
      {{ task.description }}
    </p>

    <div class="flex items-center justify-between mt-4">
      <Avatar :name="task.created_by || 'User'" size="sm" />
      <span v-if="task.due_date" class="text-xs text-slate-400 flex items-center gap-1">
        🗓 {{ formatDate(task.due_date) }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import Avatar from './Avatar.vue';

const props = defineProps({
  task: { 
    type: Object, 
    required: true 
  }
});

const priorityClasses = computed(() => {
  switch (props.task.priority?.toLowerCase()) {
    case 'high': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
    case 'medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    case 'low':
    default: return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
  }
});

const formatDate = (dateString) => {
  const options = { month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};
</script>