import { defineStore } from 'pinia';
import { ref } from 'vue';
import { initDB } from '../database/index';
import bcrypt from 'bcryptjs';

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  // Helper to get database instance
  const getDb = async () => await initDB();

  // FEATURE: User Registration 
  const register = async (name, email, password) => {
    isLoading.value = true;
    error.value = null;
    try {
      const db = await getDb();
      
      // Check if email already exists using the IndexedDB index
      const existingUser = await db.getFromIndex('users', 'email', email);
      if (existingUser) {
        throw new Error('An account with this email already exists.');
      }

      // Hash the password securely on the client side 
      const salt = bcrypt.genSaltSync(10);
      const password_hash = bcrypt.hashSync(password, salt);

      // Construct the new user object 
      const newUser = {
        id: crypto.randomUUID(),
        name,
        email,
        password_hash,
        created_at: new Date().toISOString()
      };

      // Save to IndexedDB 
      await db.add('users', newUser);
      
      // Log the user in immediately after registration
      await setSession(newUser);
      
      return true;
    } catch (err) {
      error.value = err.message;
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // FEATURE: User Login 
  const login = async (email, password) => {
    isLoading.value = true;
    error.value = null;
    try {
      const db = await getDb();
      const user = await db.getFromIndex('users', 'email', email);
      
      if (!user) throw new Error('Invalid email or password.');

      // Compare provided password with stored hash
      const isMatch = bcrypt.compareSync(password, user.password_hash);
      if (!isMatch) throw new Error('Invalid email or password.');

      await setSession(user);
      return true;
    } catch (err) {
      error.value = err.message;
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // FEATURE: User Logout 
  const logout = () => {
    currentUser.value = null;
    localStorage.removeItem('taskflow_session_id');
  };

  // FEATURE: Stay logged in after refresh 
  const initAuth = async () => {
    const sessionId = localStorage.getItem('taskflow_session_id');
    if (!sessionId) return;

    try {
      const db = await getDb();
      const user = await db.get('users', sessionId);
      if (user) {
        currentUser.value = { 
          id: user.id, 
          name: user.name, 
          email: user.email 
        };
      } else {
        logout(); // Session invalid, clear it out
      }
    } catch (err) {
      console.error("Failed to restore session:", err);
    }
  };

  // Internal helper to set state and persistence
  const setSession = async (user) => {
    // We omit the password_hash from the active state for security
    currentUser.value = {
      id: user.id,
      name: user.name,
      email: user.email
    };
    // Save user ID to localStorage to simulate a persistent session token 
    localStorage.setItem('taskflow_session_id', user.id);
  };

  return {
    currentUser,
    isLoading,
    error,
    register,
    login,
    logout,
    initAuth
  };
});