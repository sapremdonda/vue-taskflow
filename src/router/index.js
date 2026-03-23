import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const routes = [
  // Public Routes
  { 
    path: '/login', 
    component: () => import('../pages/Login.vue'),
    meta: { requiresGuest: true }
  },
  { 
    path: '/register', 
    component: () => import('../pages/Register.vue'),
    meta: { requiresGuest: true }
  },
  
  // Protected Routes
  { 
    path: '/dashboard', 
    component: () => import('../pages/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  { 
    path: '/workspaces', 
    component: () => import('../pages/Workspaces.vue'),
    meta: { requiresAuth: true }
  },
  { 
    path: '/workspaces/:id', 
    component: () => import('../pages/WorkspaceDetails.vue'),
    meta: { requiresAuth: true }
  },
  { 
    path: '/projects/:id', 
    component: () => import('../pages/ProjectBoard.vue'),
    meta: { requiresAuth: true }
  },
  { 
    path: '/settings', 
    component: () => import('../pages/Settings.vue'),
    meta: { requiresAuth: true }
  },
  
  // Redirect root to dashboard
  { path: '/', redirect: '/dashboard' }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation Guards
router.beforeEach((to, from) => {
  const authStore = useAuthStore();
  const isAuthenticated = !!authStore.currentUser;

  if (to.meta.requiresAuth && !isAuthenticated) {
    // If route requires auth and user isn't logged in, send to login
    return '/login';
  } else if (to.meta.requiresGuest && isAuthenticated) {
    // If route requires guest (like login page) and user IS logged in, send to dashboard
    return '/dashboard';
  }

});

export default router;