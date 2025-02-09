"use client";

import { useEffect, useRef, useState } from "react";
import {
  updateActiveFormatsState,
} from "@/utils/EditorUtils"; 
import ToolBar from "@/components/ToolBar";

interface NoteCreatorProps {
  selectedFolder: number | null;
  onCloseCreator: () => void;
}

export default function NoteCreator({
  selectedFolder,
  onCloseCreator,
}: NoteCreatorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeFormats, setActiveFormats] = useState<string[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const updateFormats = () => {
    updateActiveFormatsState(setActiveFormats, setCanUndo, setCanRedo);
  };
  

  // Click outside to trigger save
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
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          folder_id: selectedFolder,
        }),
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
    <div ref={editorRef} className="rounded h-full bg-white p-4">
      <h3 className="text-lg font-semibold mb-2">New Note</h3>

      {/* Title Input */}
      <input
        autoFocus
        type="text"
        placeholder="Enter note title..."
        className="w-full border-b p-2 text-2xl font-bold outline-none focus:border-blue-500"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Formatting Toolbar */}
      <ToolBar 
        canRedo={canRedo}
        canUndo={canUndo}
        updateFormats={updateFormats}
        activeFormats={activeFormats}
        setActiveFormats={setActiveFormats}
      />


      {/* Content Editor */}
      <div
        contentEditable
        ref={editorRef}
        onInput={(e) => {
          setContent(e.currentTarget.innerHTML);
          updateFormats();
        }}
        className="w-full mt-3 p-2 text-gray-700 outline-none focus:border-blue-500"
        style={{ whiteSpace: "pre-wrap" }}
      />
    </div>
  );
}
