'use client';

import React, { useEffect, useState } from "react";
import BorderColorIcon from '@mui/icons-material/BorderColor';

interface Note {
  id: number;
  title: string;
  updated_at: string;
}

interface NoteListProps {
  selectedFolder: number | null;
  onAddNote: () => void;
  onSelectNote: (noteId: number) => void;
}

export default function NoteList({ selectedFolder, onAddNote, onSelectNote }: NoteListProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null); // Track selected note

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
    <div className="mt-4">
      <div className=" flex flex-grow items-center justify-between mb-2">
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
          <button onClick={onAddNote} className="text-black p-2 rounded flex items-center">
            <BorderColorIcon />
          </button>
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <p className="text-gray-500">No notes available.</p>
      ) : (
        <ul className="space-y-2">
          {filteredNotes.map((note) => (
            <li 
              key={note.id} 
              className={`p-3 rounded flex flex-col justify-center cursor-pointer ${
                selectedNoteId === note.id ? "bg-gray-300 " : "hover:bg-gray-200"
              }`}
              onClick={() => handleNoteClick(note.id)} // Select note on click
            >
              <span className="font-semibold text-xl">{note.title}</span>
              <span className="text-gray-500 text-sm">{new Date(note.updated_at).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
