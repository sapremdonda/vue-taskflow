<template>
  <div class="max-w-7xl mx-auto">
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h2>
      <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">Overview of your workspace activity and tasks.</p>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>

    <div v-else>
      <div class="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
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
            <Doughnut v-if="stats.totalTasks > 0" :data="chartData" :options="chartOptions" />
            <div v-else class="flex items-center text-slate-400 text-sm">Create some tasks to see statistics.</div>
          </div>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { initDB } from '../database/index';
import { useAuthStore } from '../stores/authStore';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'vue-chartjs';

ChartJS.register(ArcElement, Tooltip, Legend);
const authStore = useAuthStore();

const isLoading = ref(true);
const stats = ref({
  totalProjects: 0,
  totalTasks: 0,
  completedTasks: 0,
  overdueTasks: 0,
  activeTasks: 0
});

onMounted(async () => {
  try {
    const db = await initDB();
    const userId = authStore.currentUser?.id;
    if (!userId) return;

    // 1. Get ALL projects belonging to the user
    const projects = await db.getAllFromIndex('projects', 'created_by', userId);
    const projectIds = projects.map(p => p.id);

    // 2. Get ALL boards belonging to those specific projects
    const allBoards = await db.getAll('boards');
    const userBoards = allBoards.filter(b => projectIds.includes(b.project_id));
    const userBoardIds = userBoards.map(b => b.id);
    
    // Find specifically the "Done" boards for completion tracking
    const doneBoardIds = userBoards.filter(b => b.name === 'Done').map(b => b.id);

    // 3. Get ALL tasks belonging to those specific boards (Bulletproof mapping!)
    const allTasks = await db.getAll('tasks');
    const userTasks = allTasks.filter(t => userBoardIds.includes(t.board_id));

    // 4. Calculate accurate statistics
    const completed = userTasks.filter(t => doneBoardIds.includes(t.board_id)).length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdue = userTasks.filter(t => {
      if (!t.dueDate || doneBoardIds.includes(t.board_id)) return false;
      const due = new Date(t.dueDate);
      due.setHours(0, 0, 0, 0);
      return due < today;
    }).length;

    stats.value = {
      totalProjects: projects.length,
      totalTasks: userTasks.length,
      completedTasks: completed,
      overdueTasks: overdue,
      activeTasks: userTasks.length - completed
    };
  } catch (error) {
    console.error("Dashboard failed to load stats:", error);
  } finally {
    isLoading.value = false;
  }
});

const chartData = computed(() => ({
  labels: ['Completed', 'Active', 'Overdue'],
  datasets: [{
    backgroundColor: ['#10b981', '#6366f1', '#f43f5e'],
    borderWidth: 0,
    data: [
      stats.value.completedTasks, 
      Math.max(0, stats.value.activeTasks - stats.value.overdueTasks), 
      stats.value.overdueTasks
    ]
  }]
}));

const chartOptions = { 
  responsive: true, 
  maintainAspectRatio: false, 
  plugins: { legend: { position: 'bottom' } } 
};
</script>