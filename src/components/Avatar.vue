<template>
  <div 
    class="flex items-center justify-center rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 font-semibold"
    :class="sizeClasses"
  >
    <img v-if="src" :src="src" :alt="alt" class="w-full h-full object-cover" />
    <span v-else class="uppercase">{{ initials }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: 'User avatar' },
  name: { type: String, default: 'User' },
  size: { type: String, default: 'md' } // sm, md, lg
});

const initials = computed(() => {
  return props.name.substring(0, 2);
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'w-6 h-6 text-xs';
    case 'lg': return 'w-12 h-12 text-lg';
    case 'md':
    default: return 'w-8 h-8 text-sm';
  }
});
</script>