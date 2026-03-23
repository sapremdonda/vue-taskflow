<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" @click.self="close">
    
    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
      
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center shrink-0">
        <h3 class="text-lg font-bold"><slot name="header">Modal Title</slot></h3>
        <button @click="close" class="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
          ✕
        </button>
      </div>

      <div class="px-6 py-4 overflow-y-auto flex-1">
        <slot name="body">Modal Content</slot>
      </div>

      <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 shrink-0">
        <slot name="footer">
          <button @click="close" class="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">Close</button>
        </slot>
      </div>
      
    </div>
  </div>
</template>

<script setup>
defineProps({
  isOpen: { type: Boolean, required: true }
});

const emit = defineEmits(['close']);

const close = () => {
  emit('close');
};
</script>