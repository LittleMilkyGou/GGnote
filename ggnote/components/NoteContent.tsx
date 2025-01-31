'use client'

import React, { useEffect, useState } from "react";

export default function NoteContent() {
  const [notes, setNotes] = useState<any[]>([]);

  useEffect(() => {
    const fetchNotes = async () => {
      const response = await fetch("/api/notes", { method: "GET" });
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    };

    fetchNotes();
  }, []);

  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold mb-2">Saved Notes</h2>
      {notes.map((note) => (
        <div key={note.id} className="p-4 border rounded mb-4">
          <div dangerouslySetInnerHTML={{ __html: note.content }} />
        </div>
      ))}
    </div>
  );
};
