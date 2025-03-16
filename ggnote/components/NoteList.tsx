'use client';

import React, { useEffect, useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { NotebookPen } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { SidebarTrigger } from "./ui/sidebar";

interface Note {
  id: number;
  title: string;
  updated_at: string;
}

interface NoteListProps {
  selectedFolder: number | null;
  onAddNote: () => void;
  onSelectNote: (noteId: number | null) => void;
  onCloseEditor: () => void;
}

export default function NoteList({ selectedFolder, onAddNote, onSelectNote, onCloseEditor }: NoteListProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Set up listener for note updates
  useEffect(() => {
    // Listen for note updates from the main process
    const unsubscribe = window.api.onNotesUpdated(() => {
      fetchNotes();
    });
    
    // Cleanup listener on unmount
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Fetch notes when selected folder changes
  useEffect(() => {
    fetchNotes();
  }, [selectedFolder]);

  // Fetch notes based on the selected folder
  // Updated fetchNotes function
const fetchNotes = async () => {
  setIsLoading(true);
  setError(null);
  
  try {
    // Use Electron IPC instead of fetch - convert null to undefined
    const data = await window.api.getNotes(selectedFolder ?? undefined);
    
    // Check if data is an array
    if (!Array.isArray(data)) {
      // Handle case where data is an error object instead of an array
      if (data && typeof data === 'object' && 'error' in data) {
        throw new Error("Error get notes");
      }
      throw new Error('Invalid response format');
    }
    
    setNotes(data);
  } catch (error) {
    console.error("Failed to fetch notes:", error);
    setError("Failed to load notes. Please try again.");
  } finally {
    setIsLoading(false);
  }
};

  const deleteNote = async (id: number) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      // Use Electron IPC instead of fetch
      const result = await window.api.deleteNote(id);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Update local state to remove the deleted note
      setNotes((prevNotes) => prevNotes.filter(note => note.id !== id));
      
      if (selectedNoteId === id) {
        onCloseEditor();
        onSelectNote(null);
        setSelectedNoteId(null);
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
      alert(`Failed to delete note: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Filter notes based on search query
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle note selection and update state
  const handleNoteClick = (noteId: number) => {
    setSelectedNoteId(noteId);
    onSelectNote(noteId);
  };

  return (
    <div>
      <SidebarTrigger className="mb-4"/>
      <div className="flex flex-grow items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="搜索"
            className="border border-b-2 py-1 px-2 rounded-lg shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {/* Add Note Button */}
          <button 
            onClick={onAddNote} 
            className="text-black p-2 rounded flex items-center hover:bg-gray-200"
            disabled={!selectedFolder}
            title={selectedFolder ? "Add new note" : "Select a folder first"}
          >
            <NotebookPen />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <p className="text-gray-500">Loading notes...</p>
        </div>
      ) : error ? (
        <div className="text-red-500 p-4">
          <p>{error}</p>
          <button 
            onClick={fetchNotes}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      ) : filteredNotes.length === 0 ? (
        <p className="text-gray-500">No notes available.</p>
      ) : (
        <ScrollArea className="h-screen rounded-md pr-4">
          <ul className="space-y-2">
            {filteredNotes.map((note) => (
              <div key={note.id}>
                <ContextMenu>
                  <ContextMenuTrigger>
                    <li 
                      className={`p-3 rounded flex flex-col justify-center cursor-pointer ${
                        selectedNoteId === note.id ? "bg-gray-300" : "hover:bg-gray-200"
                      }`}
                      onClick={() => handleNoteClick(note.id)}
                    >
                      <span className="font-semibold text-xl">{note.title}</span>
                      <span className="text-gray-500 text-sm">
                        {new Date(note.updated_at).toLocaleString()}
                      </span>
                    </li>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem onClick={() => deleteNote(note.id)}>Delete</ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              </div>
            ))}
          </ul>
        </ScrollArea>
      )}
    </div>
  );
}