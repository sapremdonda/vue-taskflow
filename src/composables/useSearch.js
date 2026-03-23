import { ref, computed } from 'vue';
import { useProjectStore } from '../stores/projectStore';
import { useTaskStore } from '../stores/taskStore';

export function useSearch() {
  const searchQuery = ref('');
  const projectStore = useProjectStore();
  const taskStore = useTaskStore();

  // Real-time client-side search across multiple modules 
  const searchResults = computed(() => {
    if (!searchQuery.value.trim()) return { projects: [], tasks: [] };
    
    const query = searchQuery.value.toLowerCase();
    
    const matchedProjects = projectStore.projects.filter(p => 
      p.name.toLowerCase().includes(query) || 
      (p.description && p.description.toLowerCase().includes(query))
    );

    const matchedTasks = taskStore.tasks.filter(t => 
      t.title.toLowerCase().includes(query) || 
      (t.description && t.description.toLowerCase().includes(query))
    );

    return {
      projects: matchedProjects,
      tasks: matchedTasks
    };
  });

  return { searchQuery, searchResults };
}