// Define the Folder interface
export interface Folder {
  id: number;
  name: string;
  created_at?: string;
}

// Define the Note interface
export interface Note {
  id: number;
  title: string;
  content?: string;
  updated_at: string;
  folder_id?: number;
}



// Define success response interface
export interface SuccessResponse {
  message: string;
  [key: string]: any; // For additional properties like noteId, folderId, etc.
}

// Define the global window interface with Electron IPC API
declare global {
  interface Window {
    api: {
      // Folder operations
      getFolders: () => Promise<Folder[]>;
      createFolder: (params: { name: string }) => Promise<SuccessResponse>;
      deleteFolder: (params: { id: number }) => Promise<SuccessResponse>;
      onFoldersUpdated: (callback: () => void) => (() => void);
      
      // Note operations
      createNote: (params: { title: string; content: string; folder_id: number }) => Promise<SuccessResponse>;
      getNotes: (folderId?: number) => Promise<Note[] | null>;
      getNote: (id: number) => Promise<Note | null>;
      updateNote: (params: { id: number; title?: string; content?: string; folder_id?: number }) => Promise<SuccessResponse>;
      deleteNote: (id: number) => Promise<SuccessResponse>;
      onNotesUpdated: (callback: () => void) => (() => void);
      
      // File upload operations
      uploadImage: (formData: { buffer: ArrayBuffer; filename: string }) => Promise<{ filePath: string }>;
    }
  }
}