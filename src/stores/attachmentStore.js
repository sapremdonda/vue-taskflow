import { defineStore } from 'pinia';
import { ref } from 'vue';
import { initDB } from '../database/index';

export const useAttachmentStore = defineStore('attachment', () => {
  const attachments = ref([]);
  const getDb = async () => await initDB();

  // Fetch attachments for a specific task
  const fetchAttachments = async (taskId) => {
    const db = await getDb();
    const records = await db.getAllFromIndex('attachments', 'task_id', taskId);
    
    // Convert Blobs back to usable URLs for the browser
    attachments.value = records.map(record => ({
      ...record,
      url: URL.createObjectURL(record.file_blob)
    }));
  };

  // Upload file as Blob to IndexedDB 
  const uploadFile = async (taskId, file) => {
    const db = await getDb();
    const newAttachment = {
      id: crypto.randomUUID(),
      task_id: taskId,
      file_name: file.name,
      file_type: file.type,
      file_blob: new Blob([file], { type: file.type }), // Store as Blob
      created_at: new Date().toISOString()
    };

    await db.add('attachments', newAttachment);
    attachments.value.push({
      ...newAttachment,
      url: URL.createObjectURL(newAttachment.file_blob)
    });
  };

  return { attachments, fetchAttachments, uploadFile };
});