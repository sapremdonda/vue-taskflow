<template>
  <div class="max-w-4xl mx-auto">
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Settings</h2>
      <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your account and data preferences.</p>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div class="p-6 border-b border-slate-200 dark:border-slate-700">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Data Management</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400">Export your workspaces, projects, and tasks as a JSON backup, or restore from a previous file.</p>
      </div>
      
      <div class="p-6 flex flex-col sm:flex-row gap-4 bg-slate-50 dark:bg-slate-900/50">
        
        <button 
          @click="exportData" 
          :disabled="isExporting"
          class="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-500 text-slate-700 dark:text-slate-200 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
        >
          <span v-if="isExporting" class="animate-spin">↻</span>
          <span v-else>↓</span>
          Export JSON Backup
        </button>

        <label class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer">
          <span>↑</span>
          Import Backup
          <input type="file" accept=".json" class="hidden" @change="importData" :disabled="isImporting">
        </label>

      </div>
      
      <div v-if="statusMessage" class="p-4 text-sm font-medium text-center border-t border-slate-200 dark:border-slate-700" :class="statusIsError ? 'text-red-600 bg-red-50 dark:bg-red-900/20' : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'">
        {{ statusMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { initDB } from '../database/index';
import { useAppSystem } from '../composables/useAppSystem';

const isExporting = ref(false);
const isImporting = ref(false);
const statusMessage = ref('');
const statusIsError = ref(false);
const { triggerNotification } = useAppSystem();

// Gather all data from IndexedDB and trigger a download 
const exportData = async () => {
  isExporting.value = true;
  statusMessage.value = '';
  try {
    const db = await initDB();
    const backup = {
      workspaces: await db.getAll('workspaces'),
      projects: await db.getAll('projects'),
      boards: await db.getAll('boards'),
      tasks: await db.getAll('tasks'),
      comments: await db.getAll('comments'),
      activities: await db.getAll('activities')
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", `taskflow_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

    statusIsError.value = false;
    statusMessage.value = 'Backup exported successfully!';
  } catch (err) {
    statusIsError.value = true;
    statusMessage.value = 'Failed to export data.';
    console.error(err);
  } finally {
    isExporting.value = false;
  }
};

// Parse uploaded JSON and push it into IndexedDB 
const importData = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  isImporting.value = true;
  statusMessage.value = '';
  
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const backup = JSON.parse(e.target.result);
      const db = await initDB();
      
      // Iterate through keys and restore data 
      for (const storeName of Object.keys(backup)) {
        if (db.objectStoreNames.contains(storeName)) {
           // Optional: You could clear the store first with db.clear(storeName)
           for (const item of backup[storeName]) {
             await db.put(storeName, item); 
           }
        }
      }

      statusIsError.value = false;
      statusMessage.value = 'Data restored successfully! Please refresh the page.';
      triggerNotification('Import Complete', { body: 'Your data has been successfully restored.' }); // 
      
    } catch (err) {
      statusIsError.value = true;
      statusMessage.value = 'Invalid JSON file or failed to import.';
      console.error(err);
    } finally {
      isImporting.value = false;
      event.target.value = ''; // Reset input
    }
  };
  reader.readAsText(file);
};
</script>