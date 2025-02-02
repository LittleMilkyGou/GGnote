'use client';

import { useRef, useState, useEffect } from "react";

interface NoteEditorProps {
  selectedFolder: number | null;
  onCloseEditor: () => void; // Function to close the editor after saving
}

export default function NoteEditor({ selectedFolder, onCloseEditor }: NoteEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Handle saving when clicking outside the input fields
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        editorRef.current &&
        !editorRef.current.contains(event.target as Node)
      ) {
        handleSave();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [title, content]); // Runs when title or content changes

  // Auto-save function
  const handleSave = async () => {
    if (isSaving) return; // Prevent multiple saves
    if (!title.trim() && !content.trim()) {
      onCloseEditor(); // Close editor if both fields are empty
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          folder_id: selectedFolder,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save note");
      }

      console.log("Note saved successfully");

      onCloseEditor(); // Close editor after successful save
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Failed to save note");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div ref={editorRef} className="p-4 border rounded h-full bg-white shadow">
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
        className="w-full mt-3 border-t p-2 text-gray-700 min-h-[200px] outline-none focus:border-blue-500"
        style={{ whiteSpace: "pre-wrap" }}
      />
    </div>
  );
}
