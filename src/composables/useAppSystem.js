import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

export function useAppSystem() {
  const router = useRouter();

  // FEATURE: In-Page Notifications (SweetAlert2)
  const triggerNotification = (title, options = {}) => {
    // Check if the app is currently in Dark Mode to style the popup accordingly
    const isDark = document.documentElement.classList.contains('dark');

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: options.icon || 'info', // Can be 'success', 'error', 'warning', 'info'
      title: title,
      text: options.body || '',
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      
      // Theming to match TaskFlow's Tailwind colors perfectly
      background: isDark ? '#1e293b' : '#ffffff', // slate-800 or white
      color: isDark ? '#f8fafc' : '#0f172a',      // slate-50 or slate-900
      iconColor: '#4f46e5',                       // indigo-600
      
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    });
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
        document.getElementById('global-search')?.focus();
        break;
      case 'n':
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('open-new-task-modal'));
        break;
    }
  };

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
  });

  return { triggerNotification };
}