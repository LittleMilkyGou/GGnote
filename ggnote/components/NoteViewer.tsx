'use client';

import { useEffect, useState } from "react";

interface Note {
  id: number;
  title: string;
  content: string;
  updated_at: string;
}

interface NoteViewerProps {
  selectedNoteId: number | null;
}

export default function NoteViewer({ selectedNoteId }: NoteViewerProps) {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (selectedNoteId) {
      fetchNoteDetails(selectedNoteId);
    }
  }, [selectedNoteId]);

  // Fetch a single note by ID
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
    <div className="p-4 border rounded h-full">
      {loading ? (
        <p className="text-gray-500">Loading note...</p>
      ) : note ? (
        <>
          <h2 className="text-2xl font-bold mb-2">{note.title}</h2>
          <div className="border-t pt-3 text-gray-700" dangerouslySetInnerHTML={{ __html: note.content }} />
          <p className="text-sm text-gray-500 mt-2">Last updated: {new Date(note.updated_at).toLocaleString()}</p>
        </>
      ) : (
        <p className="text-gray-500">Select a note to view its content.</p>
      )}
    </div>
  );
}
