<template>
  <div class="bg-slate-100 dark:bg-slate-800/50 rounded-xl flex flex-col w-80 shrink-0 border border-slate-200 dark:border-slate-700 max-h-full">
    
    <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center shrink-0">
      <h3 class="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
        {{ column.name }}
        <span class="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs py-0.5 px-2 rounded-full">{{ tasks.length }}</span>
      </h3>
      <button class="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer">+</button>
    </div>

    <div class="p-3 flex-1 overflow-y-auto custom-scrollbar">
      <draggable 
        :list="tasks" 
        group="tasks" 
        class="min-h-[150px] space-y-3 h-full block"
        @change="onChange"
      >
        <TaskCard 
          v-for="task in tasks" 
          :key="task.id" 
          :task="task" 
        />
      </draggable>
    </div>
    
  </div>
</template>

<script setup>
import { VueDraggableNext as draggable } from 'vue-draggable-next';
import TaskCard from './TaskCard.vue';

const props = defineProps({
  column: Object,
  tasks: Array
});

const emit = defineEmits(['update-tasks']);

const onChange = (event) => {
  emit('update-tasks', { columnId: props.column.id, event });
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.5); border-radius: 20px; }
</style>