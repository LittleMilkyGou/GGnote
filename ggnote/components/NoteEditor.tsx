'use client';

import { useRef, useState, useEffect } from "react";
import ToolBar from "./ToolBar";
import { updateActiveFormatsState } from "@/utils/EditorUtils";

interface NoteEditorProps {
  selectedNote: { id: number; title: string; content: string };
  onCloseEditor: () => void;
}

export default function NoteEditor({ selectedNote, onCloseEditor }: NoteEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState<string>(selectedNote.title);
  const [content, setContent] = useState<string>(selectedNote.content);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeFormats, setActiveFormats] = useState<string[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const updateFormats = () => {
    updateActiveFormatsState(setActiveFormats, setCanUndo, setCanRedo);
  };
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.focus();
    }
  }, []);
  // Update state when a new note is selected.
  useEffect(() => {
    setTitle(selectedNote.title);
    setContent(selectedNote.content);
    // Also update the contentEditable's inner HTML directly.
    if (contentRef.current) {
      contentRef.current.innerHTML = selectedNote.content;
    }
  }, [selectedNote]);

  // Click outside detection using the container ref.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        handleSave();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [title, content]);

  // Save function.
  const handleSave = async () => {
    if (isSaving) return;

    // If both fields are empty, simply close the editor.
    if (!title.trim() && !content.trim()) {
      onCloseEditor();
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/notes/${selectedNote.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
        }),
      });

      if (!response.ok) throw new Error("Failed to update note");

      console.log("Note updated successfully");
      onCloseEditor();
    } catch (error) {
      console.error("Error updating note:", error);
      alert("Failed to update note");
    } finally {
      setIsSaving(false);
    }
  };

  

  return (
    <div ref={containerRef} className="rounded h-full bg-white">
      <h3 className="text-sm text-gray-500 font-semibold mb-2">Edit Note</h3>

      {/* Title Input */}
      <input
        type="text"
        className="w-full border-b p-2 text-2xl font-bold outline-none focus:border-blue-500"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <ToolBar 
        canRedo={canRedo}
        canUndo={canUndo}
        updateFormats={updateFormats}
        activeFormats={activeFormats}
        setActiveFormats={setActiveFormats}
      />

      {/* Uncontrolled Content Editable */}
      <div
        contentEditable
        ref={contentRef}
        onInput={(e) => {
          setContent(e.currentTarget.innerHTML);
          updateFormats();
        }}
        className="w-full mt-3 p-2 text-gray-700 min-h-[200px] outline-none focus:border-blue-500"
        style={{ whiteSpace: "pre-wrap" }}
        suppressContentEditableWarning
      />
    </div>
  );
}
