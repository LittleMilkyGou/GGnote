'use client'

import React, { useEffect, useState } from "react";

interface Note {
  id: number;
  content: string;
  folder_id: number | null;
}

interface NoteContentProps {
  selectedFolder: number | null;
}

export default function NoteContent({ selectedFolder }: NoteContentProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNote, setEditingNote] = useState<{ id: number; content: string } | null>(null);

  useEffect(() => {
    fetchNotes();
  }, [selectedFolder]);

  // Fetch notes based on the selected folder
  const fetchNotes = async () => {
    try {
      const url = selectedFolder ? `/api/notes?folder_id=${selectedFolder}` : "/api/notes";
      const response = await fetch(url, { method: "GET" });

      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    }
  };

  // Handle note deletion
  const deleteNote = async (id: number) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      const response = await fetch(`/api/notes/${id}`, { method: "DELETE" });

      if (response.ok) {
        setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  // Handle note editing
  const startEditing = (note: Note) => {
    setEditingNote({ id: note.id, content: note.content });
  };

  const saveEdit = async () => {
    if (!editingNote) return;

    try {
      const response = await fetch(`/api/notes/${editingNote.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editingNote.content }),
      });

      if (response.ok) {
        setNotes((prevNotes) =>
          prevNotes.map((note) =>
            note.id === editingNote.id ? { ...note, content: editingNote.content } : note
          )
        );
        setEditingNote(null);
      }
    } catch (error) {
      console.error("Failed to update note:", error);
    }
  };

  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold mb-2">
        {selectedFolder ? `Notes in Folder #${selectedFolder}` : "All Notes"}
      </h2>

      {notes.length === 0 ? (
        <p className="text-gray-500">No notes available.</p>
      ) : (
        notes.map((note) => (
          <div key={note.id} className="p-4 border rounded mb-4 flex flex-col">
            {editingNote && editingNote.id === note.id ? (
              <textarea
                className="border p-2 w-full"
                value={editingNote.content}
                onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
              />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: note.content }} />
            )}

            <div className="flex justify-end space-x-2 mt-2">
              {editingNote && editingNote.id === note.id ? (
                <>
                  <button className="bg-green-500 text-white px-3 py-1 rounded" onClick={saveEdit}>
                    Save
                  </button>
                  <button
                    className="bg-gray-400 text-white px-3 py-1 rounded"
                    onClick={() => setEditingNote(null)}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => startEditing(note)}>
                    Edit
                  </button>
                  <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => deleteNote(note.id)}>
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
