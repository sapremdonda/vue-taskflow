import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

export function useAppSystem() {
  const router = useRouter();

  // FEATURE: Browser Notifications 
  const triggerNotification = (title, options = {}) => {
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
      new Notification(title, options);
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification(title, options);
        }
      });
    }
  };

  // FEATURE: Keyboard Shortcuts 
  const handleKeydown = (e) => {
    // Prevent shortcuts from triggering if the user is typing in an input or textarea
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

    switch (e.key.toLowerCase()) {
      case 'd':
        e.preventDefault();
        router.push('/dashboard'); 
        break;
      case '/':
        e.preventDefault();
        // Assuming your search input in App.vue has an id="global-search"
        document.getElementById('global-search')?.focus(); 
        break;
      case 'n':
        e.preventDefault();
        // You can emit an event here or use a global store state to open the Task modal
        window.dispatchEvent(new CustomEvent('open-new-task-modal')); // 
        break;
    }
  };

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
    // Request notification permission on load just in case
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
  });

  return { triggerNotification };
}