const { ipcMain, app } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const { db } = require('./db');

// Set up IPC handlers for all operations
function setupIpcHandlers(mainWindow) {
  // --------- FOLDER OPERATIONS ---------
  
  // Create a new folder
  ipcMain.handle('create-folder', async (event, { name }) => {
    try {
      if (!name || typeof name !== 'string') {
        return { error: 'Invalid folder name', status: 400 };
      }

      const statement = db.prepare('INSERT INTO folders (name) VALUES (?)');
      const result = statement.run(name);

      // Notify renderer about the update
      mainWindow.webContents.send('folders-updated');
      
      return { message: 'Folder created', folderId: result.lastInsertRowid };
    } catch (error) {
      console.error('Error creating folder:', error);
      return { error: 'Failed to create folder', status: 500 };
    }
  });

  // Get all folders
  ipcMain.handle('get-folders', async () => {
    try {
      const statement = db.prepare('SELECT * FROM folders ORDER BY id DESC');
      const folders = statement.all();
      
      return folders;
    } catch (error) {
      console.error('Error fetching folders:', error);
      return { error: 'Failed to fetch folders', status: 500 };
    }
  });

  // Delete a folder
  ipcMain.handle('delete-folder', async (event, { id }) => {
    try {
      if (!id || typeof id !== 'number') {
        return { error: 'Invalid folder ID', status: 400 };
      }

      const statement = db.prepare('DELETE FROM folders WHERE id = ?');
      statement.run(id);

      // Also update any notes that had this folder
      const updateNotes = db.prepare('UPDATE notes SET folder_id = NULL WHERE folder_id = ?');
      updateNotes.run(id);

      // Notify renderer about the update
      mainWindow.webContents.send('folders-updated');
      mainWindow.webContents.send('notes-updated');
      
      return { message: 'Folder deleted' };
    } catch (error) {
      console.error('Error deleting folder:', error);
      return { error: 'Failed to delete folder', status: 500 };
    }
  });

  // --------- NOTE OPERATIONS ---------
  
  // Create a new note
  ipcMain.handle('create-note', async (event, { title, content, folder_id }) => {
    try {
      // Ensure folder_id is provided since it's required in your schema
      if (!folder_id) {
        return { error: 'Folder ID is required', status: 400 };
      }

      const statement = db.prepare(`
        INSERT INTO notes (title, content, folder_id) 
        VALUES (?, ?, ?)
      `);
      
      const result = statement.run(
        title || 'Untitled Note', 
        content || '', 
        folder_id
      );

      // Notify renderer about the update
      mainWindow.webContents.send('notes-updated');
      
      return { message: 'Note saved', noteId: result.lastInsertRowid };
    } catch (error) {
      console.error('Error saving note:', error);
      return { error: 'Failed to save note', status: 500 };
    }
  });

  // Get all notes
  ipcMain.handle('get-notes', async (event, { folderId }) => {
    try {
      let statement;
      let notes;

      if (folderId) {
        statement = db.prepare('SELECT id, title, updated_at FROM notes WHERE folder_id = ? ORDER BY updated_at DESC');
        notes = statement.all(folderId);
      } else {
        statement = db.prepare('SELECT id, title, updated_at FROM notes ORDER BY updated_at DESC');
        notes = statement.all();
      }

      return notes;
    } catch (error) {
      console.error('Error fetching notes:', error);
      return { error: 'Failed to fetch notes', status: 500 };
    }
  });

  // Get a single note by ID
  ipcMain.handle('get-note', async (event, id) => {
    try {
      if (isNaN(id)) {
        return { error: 'Invalid note ID', status: 400 };
      }

      const statement = db.prepare('SELECT id, title, content, updated_at FROM notes WHERE id = ?');
      const note = statement.get(id);

      if (!note) {
        return { error: 'Note not found', status: 404 };
      }

      return note;
    } catch (error) {
      console.error('Error fetching note:', error);
      return { error: 'Failed to fetch note', status: 500 };
    }
  });

  // Update a note
  ipcMain.handle('update-note', async (event, { id, title, content }) => {
    try {
      if (isNaN(id)) {
        return { error: 'Invalid note ID', status: 400 };
      }

      if (!title && !content) {
        return { error: 'Title or content must be provided', status: 400 };
      }

      // First get existing note
      const getNote = db.prepare('SELECT title, content FROM notes WHERE id = ?');
      const existingNote = getNote.get(id);
      
      if (!existingNote) {
        return { error: 'Note not found', status: 404 };
      }

      // Update with new values or keep existing ones
      const statement = db.prepare(`
        UPDATE notes 
        SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      
      statement.run(
        title !== undefined ? title : existingNote.title,
        content !== undefined ? content : existingNote.content,
        id
      );

      // Notify renderer about the update
      mainWindow.webContents.send('notes-updated');
      
      return { message: 'Note updated successfully' };
    } catch (error) {
      console.error('Error updating note:', error);
      return { error: 'Failed to update note', status: 500 };
    }
  });

  // Delete a note
  ipcMain.handle('delete-note', async (event, id) => {
    try {
      if (isNaN(id)) {
        return { error: 'Invalid note ID', status: 400 };
      }

      const statement = db.prepare('DELETE FROM notes WHERE id = ?');
      statement.run(id);

      // Notify renderer about the update
      mainWindow.webContents.send('notes-updated');
      
      return { message: 'Note deleted successfully' };
    } catch (error) {
      console.error('Error deleting note:', error);
      return { error: 'Failed to delete note', status: 500 };
    }
  });

  // --------- FILE UPLOAD OPERATIONS ---------
  
  // Upload an image
  ipcMain.handle('upload-image', async (event, formData) => {
    try {
      // In Electron, we'll receive the file buffer directly
      if (!formData || !formData.buffer) {
        return { error: 'No file uploaded', status: 400 };
      }

      const { buffer, filename } = formData;
      const fileName = `${Date.now()}-${filename}`;
      const uploadsDir = path.join(app.getPath('userData'), 'uploads');
      const filePath = path.join(uploadsDir, fileName);

      // Save the file
      await fs.writeFile(filePath, buffer);

      // Return a path that can be used in the app
      return { filePath: `file://${filePath}` };
    } catch (error) {
      console.error('Error uploading file:', error);
      return { error: 'File upload failed', status: 500 };
    }
  });
}

module.exports = { setupIpcHandlers };