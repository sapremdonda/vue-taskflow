<template>
  <div class="flex flex-col bg-slate-100/80 dark:bg-slate-800/50 rounded-xl w-80 shrink-0 max-h-full border border-slate-200 dark:border-slate-700/50">
    
    <div class="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 shrink-0 cursor-grab active:cursor-grabbing">
      <h3 class="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
        {{ column.name }}
        <span class="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs py-0.5 px-2 rounded-full font-medium">
          {{ tasks.length }}
        </span>
      </h3>
      
      <button class="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-3 custom-scrollbar">
      <draggable
        class="flex flex-col gap-3 min-h-[150px]"
        :list="localTasks"
        group="tasks"
        item-key="id"
        ghost-class="opacity-40"
        drag-class="cursor-grabbing"
        @change="handleDragChange"
      >
        <template #item="{ element }">
          <TaskCard :task="element" />
        </template>
      </draggable>
    </div>

  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import draggable from 'vue-draggable-next';
import TaskCard from './TaskCard.vue';

const props = defineProps({
  column: { 
    type: Object, 
    required: true // Board fields: id, project_id, name, position
  },
  tasks: { 
    type: Array, 
    required: true 
  }
});

const emit = defineEmits(['update-tasks']);

// Use a local ref to handle the immediate drag UI updates smoothly
const localTasks = ref([...props.tasks]);

// Sync local tasks if the parent passes down new props (e.g., from an IndexedDB refresh)
watch(() => props.tasks, (newTasks) => {
  localTasks.value = [...newTasks];
}, { deep: true });

const handleDragChange = (event) => {
  // Emit the change to the parent view so it can update the database
  // The event object contains 'added', 'removed', or 'moved' properties
  emit('update-tasks', {
    columnId: props.column.id,
    event: event,
    newTasks: localTasks.value
  });
};
</script>

<style scoped>
/* Sleek, thin scrollbars for the column to match a premium SaaS feel */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 20px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(71, 85, 105, 0.8);
}
</style>