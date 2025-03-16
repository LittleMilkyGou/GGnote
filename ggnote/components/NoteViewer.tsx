'use client';

import { useEffect, useState } from "react";
import { ScrollArea } from "./ui/scroll-area";

interface Note {
  id: number;
  title: string;
  content: string;
  updated_at: string;
}

interface NoteViewerProps {
  selectedNoteId: number | null;
  handleEditNote: (note: Note) => void; // Passes the note to edit mode
}

export default function NoteViewer({ selectedNoteId, handleEditNote }: NoteViewerProps) {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedNoteId) {
      fetchNoteDetails(selectedNoteId);
    } else {
      setNote(null);
      setError(null);
    }
  }, [selectedNoteId]);

  const fetchNoteDetails = async (noteId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use Electron IPC instead of fetch
      const data = await window.api.getNote(noteId);
      
      // Explicitly type the result to resolve the issue
      setNote(data as React.SetStateAction<Note | null>);
  
    } catch (error) {
      // Add error handling here
      setError("Failed to fetch note details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollArea className="h-screen rounded-md pb-6">
      <div className="rounded h-full bg-white p-4">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-gray-500">Loading note...</p>
          </div>
        ) : error ? (
          <div className="text-red-500 p-4">
            <p>{error}</p>
            <button 
              onClick={() => selectedNoteId && fetchNoteDetails(selectedNoteId)}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        ) : note ? (
          <div className="h-full" onDoubleClick={() => handleEditNote(note)}>
            <h3 className="text-sm text-gray-500 mt-2">
              Last updated: {new Date(note.updated_at).toLocaleString()}
            </h3>

            <h2 className="text-2xl font-bold mb-2 cursor-pointer p-1 rounded">
              {note.title}
            </h2>
            
            <div className="border-t pt-3 cursor-pointer text-gray-700 p-1 rounded rich-text">
              <div dangerouslySetInnerHTML={{ __html: note.content }} />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-40">
            <p className="text-gray-500">Select a note to view its content.</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}