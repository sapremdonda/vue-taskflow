<template>
  <div class="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group">
    
    <div class="flex justify-between items-start mb-2">
      <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
        :class="{
          'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400': task.priority === 'High',
          'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400': task.priority === 'Medium',
          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400': task.priority === 'Low' || !task.priority
        }"
      >
        {{ task.priority || 'Low' }}
      </span>
      
      <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button @click.stop="$emit('edit', task)" class="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
        </button>
        <button @click.stop="$emit('delete', task.id)" class="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
        </button>
      </div>
    </div>

    <h4 class="text-sm font-semibold text-slate-900 dark:text-white mb-1">{{ task.title }}</h4>
    <p v-if="task.description" class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{{ task.description }}</p>

    <div class="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
      <div class="flex items-center gap-1" v-if="task.dueDate">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{{ new Date(task.dueDate).toLocaleDateString() }}</span>
      </div>
      <div v-else></div>
      <div class="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
        {{ (task.created_by || 'U').substring(0, 1).toUpperCase() }}
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  task: {
    type: Object,
    required: true
  }
});
defineEmits(['edit', 'delete']);
</script>