<template>
  <div class="h-full flex flex-col relative">
    
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6 shrink-0">
      <div>
        <div class="flex items-center gap-2 mb-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          <router-link to="/workspaces" class="hover:text-indigo-600 dark:hover:text-indigo-400">Workspaces</router-link>
          <span>/</span>
          <span>Current Board</span>
        </div>
        <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Project Board</h2>
      </div>
      
      <div class="flex items-center gap-3 w-full sm:w-auto">
        <button 
          @click="openCreateModal"
          class="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 sm:py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          <span>+</span> New Task
        </button>
      </div>
    </header>

    <div v-if="projectStore.isLoading || taskStore.isLoading" class="flex-1 flex justify-center items-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>

    <div v-else class="flex-1 overflow-x-auto overflow-y-hidden pb-4 custom-scrollbar snap-x snap-mandatory">
      <div class="flex gap-4 sm:gap-6 h-full items-start px-1 min-w-max pb-2">
        
        <BoardColumn 
          v-for="board in projectStore.activeBoards" 
          :key="board.id"
          :column="board"
          :tasks="getTasksForBoard(board.id)"
          @update-tasks="handleTaskMove"
          @edit-task="openEditModal"
          @delete-task="handleDeleteTask"
          class="snap-center sm:snap-align-none" 
        />
        </div>
    </div>

    <Modal :isOpen="isTaskModalOpen" @close="closeTaskModal">
        </Modal>
  </div>
</template>

<script setup>
import Swal from 'sweetalert2';
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useProjectStore } from '../stores/projectStore';
import { useTaskStore } from '../stores/taskStore';
import BoardColumn from '../components/BoardColumn.vue';
import Modal from '../components/Modal.vue';

const route = useRoute();
const projectStore = useProjectStore();
const taskStore = useTaskStore();

const isTaskModalOpen = ref(false);
const isEditMode = ref(false);
const editingTaskId = ref(null);

const newTask = ref({
  title: '',
  description: '',
  priority: 'Low',
  dueDate: ''
});

onMounted(async () => {
  const projectId = route.params.id;
  if (projectId) {
    await projectStore.fetchBoards(projectId);
    const boardIds = projectStore.activeBoards.map(b => b.id);
    await taskStore.fetchTasksForProject(boardIds);
  }
});

const getTasksForBoard = (boardId) => {
  return taskStore.tasks.filter(task => task.board_id === boardId);
};

const handleTaskMove = async ({ columnId, event }) => {
  if (event.added) {
    const taskId = event.added.element.id;
    await taskStore.moveTask(taskId, columnId);
  }
};

const openCreateModal = () => {
  isEditMode.value = false;
  editingTaskId.value = null;
  newTask.value = { title: '', description: '', priority: 'Low', dueDate: '' };
  isTaskModalOpen.value = true;
};

const openEditModal = (task) => {
  isEditMode.value = true;
  editingTaskId.value = task.id;
  newTask.value = { 
    title: task.title, 
    description: task.description, 
    priority: task.priority || 'Low', 
    dueDate: task.dueDate || '' 
  };
  isTaskModalOpen.value = true;
};

const handleDeleteTask = async (taskId) => {
  const isDark = document.documentElement.classList.contains('dark');

  const result = await Swal.fire({
    title: 'Delete this task?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#e11d48', 
    cancelButtonColor: isDark ? '#475569' : '#94a3b8', 
    confirmButtonText: 'Yes, delete it!',
    background: isDark ? '#1e293b' : '#ffffff',
    color: isDark ? '#f8fafc' : '#0f172a',
  });

  if (result.isConfirmed) {
    await taskStore.deleteTask(taskId);
    
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Task deleted',
      showConfirmButton: false,
      timer: 2000,
      background: isDark ? '#1e293b' : '#ffffff',
      color: isDark ? '#f8fafc' : '#0f172a',
    });
  }
};

const closeTaskModal = () => {
  isTaskModalOpen.value = false;
};

const handleSaveTask = async () => {
  if (!newTask.value.title.trim() || projectStore.activeBoards.length === 0) return;
  
  if (isEditMode.value) {
    await taskStore.updateTask(editingTaskId.value, {
      title: newTask.value.title,
      description: newTask.value.description,
      priority: newTask.value.priority,
      dueDate: newTask.value.dueDate
    });
  } else {
    const firstBoardId = projectStore.activeBoards[0].id;
    await taskStore.createTask(
      firstBoardId,
      newTask.value.title,
      newTask.value.description,
      newTask.value.priority,
      newTask.value.dueDate
    );
  }
  
  closeTaskModal();
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { height: 8px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.5); border-radius: 20px; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(71, 85, 105, 0.8); }
</style>
