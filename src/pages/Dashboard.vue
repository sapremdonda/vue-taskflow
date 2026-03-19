<template>
  <div class="max-w-7xl mx-auto">
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h2>
      <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">Overview of your workspace activity and tasks.</p>
    </div>

    <div class="grid gap-5 grid-cols-[repeat(auto-fit,minmax(250px,1fr))] mb-8">
      
      <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div class="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Projects</div>
        <div class="text-3xl font-bold text-slate-900 dark:text-white">{{ stats.totalProjects }}</div>
      </div>
      <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div class="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Tasks</div>
        <div class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{{ stats.totalTasks }}</div>
      </div>
      <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div class="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Completed Tasks</div>
        <div class="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{{ stats.completedTasks }}</div>
      </div>
      <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div class="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Overdue Tasks</div>
        <div class="text-3xl font-bold text-rose-600 dark:text-rose-400">{{ stats.overdueTasks }}</div>
      </div>
      
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-6">Task Completion</h3>
        <div class="h-64 flex justify-center">
          <Doughnut v-if="chartData.datasets[0].data.length > 0" :data="chartData" :options="chartOptions" />
          <div v-else class="flex items-center text-slate-400">Not enough data to display chart.</div>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useProjectStore } from '../stores/projectStore';
import { useTaskStore } from '../stores/taskStore';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'vue-chartjs';

ChartJS.register(ArcElement, Tooltip, Legend);

const projectStore = useProjectStore();
const taskStore = useTaskStore();

const stats = computed(() => {
  const today = new Date();
  const completed = taskStore.tasks.filter(t => t.board_id === 'done_board_id_placeholder').length; 
  
  const overdue = taskStore.tasks.filter(t => {
    if (!t.due_date) return false;
    return new Date(t.due_date) < today && t.board_id !== 'done_board_id_placeholder';
  }).length;

  return {
    totalProjects: projectStore.projects.length,
    totalTasks: taskStore.tasks.length,
    completedTasks: completed,
    overdueTasks: overdue,
    activeTasks: taskStore.tasks.length - completed
  };
});

const chartData = computed(() => ({
  labels: ['Completed', 'Active', 'Overdue'],
  datasets: [
    {
      backgroundColor: ['#10b981', '#6366f1', '#f43f5e'],
      borderWidth: 0,
      data: [stats.value.completedTasks, stats.value.activeTasks - stats.value.overdueTasks, stats.value.overdueTasks]
    }
  ]
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' }
  }
};
</script>
