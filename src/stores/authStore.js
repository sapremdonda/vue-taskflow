import { defineStore } from 'pinia';
import { ref } from 'vue';
import { initDB } from '../database/index';

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref(JSON.parse(localStorage.getItem('taskflow_user')) || null);
  const isLoading = ref(false);
  const error = ref(null);

  const login = async (email, password) => {
    isLoading.value = true;
    error.value = null;
    try {
      const db = await initDB();
      const user = await db.getFromIndex('users', 'email', email);
      if (user && user.password_hash === password) {
        currentUser.value = user;
        localStorage.setItem('taskflow_user', JSON.stringify(user));
        return true;
      }
      error.value = 'Invalid credentials';
      return false;
    } catch (err) {
      error.value = 'Login failed';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (name, email, password) => {
    isLoading.value = true;
    error.value = null;
    try {
      const db = await initDB();
      const existing = await db.getFromIndex('users', 'email', email);
      if (existing) {
        error.value = 'Email already exists';
        return false;
      }
      const newUser = { id: crypto.randomUUID(), name, email, password_hash: password };
      await db.add('users', newUser);
      currentUser.value = newUser;
      localStorage.setItem('taskflow_user', JSON.stringify(newUser));
      return true;
    } catch (err) {
      error.value = 'Registration failed';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = () => {
    currentUser.value = null;
    localStorage.removeItem('taskflow_user');
  };

  return { currentUser, isLoading, error, login, register, logout };
});