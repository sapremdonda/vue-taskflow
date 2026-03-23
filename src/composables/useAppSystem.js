import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

export function useAppSystem() {
  const router = useRouter();

  const triggerNotification = (title, options = {}) => {
    const isDark = document.documentElement.classList.contains('dark');

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: options.icon || 'info',
      title: title,
      text: options.body || '',
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      background: isDark ? '#1e293b' : '#ffffff',
      color: isDark ? '#f8fafc' : '#0f172a',
      iconColor: '#4f46e5',
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    });
  };

  const handleKeydown = (e) => {
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
    }
  };

  onMounted(() => window.addEventListener('keydown', handleKeydown));
  onUnmounted(() => window.removeEventListener('keydown', handleKeydown));

  return { triggerNotification };
}