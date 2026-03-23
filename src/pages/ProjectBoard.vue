<template>
  <div class="h-full flex flex-col relative">
    
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0">
      <div>
        <div class="flex items-center gap-2 mb-1 text-sm text-slate-500 dark:text-slate-400 font-medium">
          <router-link to="/projects" class="hover:text-indigo-600 dark:hover:text-indigo-400">Projects</router-link>
          <span>/</span>
          <span>Current Board</span>
        </div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Project Board</h2>
      </div>
      
      <div class="flex items-center gap-3">
        <button class="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <span class="text-lg">⌕</span> Search
          <kbd class="px-1.5 py-0.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 text-xs">esc</kbd>
        </button>
        
        <button 
          @click="isTaskModalOpen = true"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <span>+</span> New Task
        </button>
      </div>
    </header>

    <div v-if="projectStore.isLoading || taskStore.isLoading" class="flex-1 flex justify-center items-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>

    <div v-else class="flex-1 overflow-x-auto overflow-y-hidden pb-4 custom-scrollbar">
      <div class="flex gap-6 h-full items-start px-1 min-w-max">
        
        <BoardColumn 
          v-for="board in projectStore.activeBoards" 
          :key="board.id"
          :column="board"
          :tasks="getTasksForBoard(board.id)"
          @update-tasks="handleTaskMove"
        />

      </div>
    </div>

    <Modal :isOpen="isTaskModalOpen" @close="closeTaskModal">
      <template #header>Create New Task</template>
      <template #body>
        <form @submit.prevent="handleCreateTask" id="task-form" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Task Title</label>
            <input v-model="newTask.title" type="text" required class="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea v-model="newTask.description" rows="3" class="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
              <select v-model="newTask.priority" class="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
              <input v-model="newTask.dueDate" type="date" class="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none">
            </div>
          </div>
        </form>
      </template>
      <template #footer>
        <button @click="closeTaskModal" class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Cancel</button>
        <button type="submit" form="task-form" :disabled="!newTask.title.trim()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
          Save Task
        </button>
      </template>
    </Modal>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useProjectStore } from '../stores/projectStore';
import { useTaskStore } from '../stores/taskStore';
import BoardColumn from '../components/BoardColumn.vue';
import Modal from '../components/Modal.vue';

const route = useRoute();
const projectStore = useProjectStore();
const taskStore = useTaskStore();

const isTaskModalOpen = ref(false);
const newTask = ref({
  title: '',
  description: '',
  priority: 'Low',
  dueDate: ''
});

// Load boards and tasks when the component mounts
onMounted(async () => {
  const projectId = route.params.id; // Assuming route is like /projects/:id
  if (projectId) {
    await projectStore.fetchBoards(projectId);
    const boardIds = projectStore.activeBoards.map(b => b.id);
    await taskStore.fetchTasksForProject(boardIds);
  }
});

// Filter tasks for a specific column
const getTasksForBoard = (boardId) => {
  return taskStore.tasks.filter(task => task.board_id === boardId);
};

// Handle the drag and drop event emitted from BoardColumn
const handleTaskMove = async ({ columnId, event }) => {
  // vue-draggable-next triggers an 'added' event when an item drops into a new list
  if (event.added) {
    const taskId = event.added.element.id;
    // Update the database to reflect the new column 
    await taskStore.moveTask(taskId, columnId);
  }
};

// Handle modal and form
const closeTaskModal = () => {
  isTaskModalOpen.value = false;
  newTask.value = { title: '', description: '', priority: 'Low', dueDate: '' };
};

const handleCreateTask = async () => {
  if (!newTask.value.title.trim() || projectStore.activeBoards.length === 0) return;
  
  // Create task in the first column by default (usually "To Do")
  const firstBoardId = projectStore.activeBoards[0].id;
  
  await taskStore.createTask(
    firstBoardId,
    newTask.value.title,
    newTask.value.description,
    newTask.value.priority,
    newTask.value.dueDate
  );
  
  closeTaskModal();
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 8px;
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