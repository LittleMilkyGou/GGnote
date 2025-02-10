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

  useEffect(() => {
    if (selectedNoteId) {
      fetchNoteDetails(selectedNoteId);
    }else {
      setNote(null); 
    }
  }, [selectedNoteId]);

  const fetchNoteDetails = async (noteId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/notes/${noteId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch note details");
      }
      const data = await response.json();
      setNote(data);
    } catch (error) {
      console.error("Error fetching note:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollArea className="h-screen rounded-md pb-6">

      <div className="rounded h-full bg-white" >
        {loading ? (
          <p className="text-gray-500">Loading note...</p>
        ) : note ? (
          <div  className="h-full" onDoubleClick={() => handleEditNote(note)}>
            <h3 className="text-sm text-gray-500 mt-2">Last updated: {new Date(note.updated_at).toLocaleString()}</h3>

            <h2
              className="text-2xl font-bold mb-2 cursor-pointer p-1 rounded"
            >
              {note.title}
            </h2>
            <div
              className="border-t pt-3 cursor-pointer text-gray-700 p-1 rounded rich-text"
            >
              <div dangerouslySetInnerHTML={{ __html: note.content }} />
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Select a note to view its content.</p>
        )}
      </div>
    </ScrollArea>
  );
}
