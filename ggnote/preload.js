const { contextBridge, ipcRenderer } = require('electron');

// No need for additional DOM manipulations in preload.js
// since we're handling all path adjustments in main.js by modifying the HTML directly

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  // Folder operations
  getFolders: () => ipcRenderer.invoke('get-folders'),
  createFolder: (params) => ipcRenderer.invoke('create-folder', params),
  deleteFolder: (params) => ipcRenderer.invoke('delete-folder', params),
  onFoldersUpdated: (callback) => {
    const subscription = (_event) => callback();
    ipcRenderer.on('folders-updated', subscription);
    return () => ipcRenderer.removeListener('folders-updated', subscription);
  },
  
  // Note operations
  createNote: (params) => ipcRenderer.invoke('create-note', params),
  getNotes: (folderId) => ipcRenderer.invoke('get-notes', { folderId }),
  getNote: (id) => ipcRenderer.invoke('get-note', id),
  updateNote: (params) => ipcRenderer.invoke('update-note', params),
  deleteNote: (id) => ipcRenderer.invoke('delete-note', id),
  onNotesUpdated: (callback) => {
    const subscription = (_event) => callback();
    ipcRenderer.on('notes-updated', subscription);
    return () => ipcRenderer.removeListener('notes-updated', subscription);
  },
  
  // File upload operations
  uploadImage: (formData) => ipcRenderer.invoke('upload-image', formData)
});