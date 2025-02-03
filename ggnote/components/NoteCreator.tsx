'use client';

import { useState, useRef, useEffect } from "react";

interface NoteCreatorProps {
  selectedFolder: number | null;
  onCloseCreator: () => void;
}

export default function NoteCreator({ selectedFolder, onCloseCreator }: NoteCreatorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Auto-save when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(event.target as Node)) {
        handleSave();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [title, content]);

  // Save function
  const handleSave = async () => {
    if (isSaving) return;
    if (!title.trim() && !content.trim()) {
      onCloseCreator();
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), content: content.trim(), folder_id: selectedFolder }),
      });

      if (!response.ok) throw new Error("Failed to save note");

      console.log("Note saved successfully");
      onCloseCreator();
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Failed to save note");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div ref={editorRef} className="rounded h-full bg-white">
      <h3 className="text-lg font-semibold mb-2">New Note</h3>

      {/* Title Input */}
      <input
        type="text"
        placeholder="Enter note title..."
        className="w-full border-b p-2 text-2xl font-bold outline-none focus:border-blue-500"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Content Editor */}
      <div
        contentEditable
        ref={editorRef}
        onInput={(e) => setContent(e.currentTarget.innerHTML)}
        className="w-full mt-3 p-2 text-gray-700 outline-none focus:border-blue-500"
        style={{ whiteSpace: "pre-wrap" }}
      />
    </div>
  );
}
