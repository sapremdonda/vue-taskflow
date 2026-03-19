// src/database/index.js
import { openDB } from 'idb';

const DB_NAME = 'TaskFlowDB';
const DB_VERSION = 1;

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Users
      if (!db.objectStoreNames.contains('users')) {
        const userStore = db.createObjectStore('users', { keyPath: 'id' });
        userStore.createIndex('email', 'email', { unique: true });
      }
      
      // Workspaces 
      if (!db.objectStoreNames.contains('workspaces')) {
        const wsStore = db.createObjectStore('workspaces', { keyPath: 'id' });
        wsStore.createIndex('owner_id', 'owner_id');
      }

      // Projects
      if (!db.objectStoreNames.contains('projects')) {
        const projStore = db.createObjectStore('projects', { keyPath: 'id' });
        projStore.createIndex('workspace_id', 'workspace_id');
      }

      // Boards / Columns 
      if (!db.objectStoreNames.contains('boards')) {
        const boardStore = db.createObjectStore('boards', { keyPath: 'id' });
        boardStore.createIndex('project_id', 'project_id');
      }

      // Tasks 
      if (!db.objectStoreNames.contains('tasks')) {
        const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
        taskStore.createIndex('board_id', 'board_id');
      }

      // Comments 
      if (!db.objectStoreNames.contains('comments')) {
        const commentStore = db.createObjectStore('comments', { keyPath: 'id', autoIncrement: true });
        commentStore.createIndex('task_id', 'task_id');
      }

      // Activity Timeline 
      if (!db.objectStoreNames.contains('activities')) {
        const activityStore = db.createObjectStore('activities', { keyPath: 'id', autoIncrement: true });
        activityStore.createIndex('reference_id', 'reference_id');
      }
    },
  });
};