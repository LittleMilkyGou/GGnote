'use client'

import { useRef, useState } from "react";

interface NoteContentProps {
  selectedFolder: number | null;
}

export default function NoteEditor({ selectedFolder }: NoteContentProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");

  // Handle pasted images
  const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
    const clipboardItems = e.clipboardData.items;

    for (let i = 0; i < clipboardItems.length; i++) {
      const item = clipboardItems[i];

      if (item.type.startsWith("image/")) {
        e.preventDefault();

        const file = item.getAsFile();
        if (file) {
          const formData = new FormData();
          formData.append("image", file);

          try {
            const response = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            });

            if (!response.ok) {
              throw new Error("Failed to upload image");
            }

            const data = await response.json();
            const imageUrl = data.filePath;

            // Insert the image at the cursor position
            const img = document.createElement("img");
            img.src = imageUrl;
            img.style.maxWidth = "100%";

            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              range.deleteContents();
              range.insertNode(img);
            }

            setContent(editorRef.current?.innerHTML || "");
          } catch (error) {
            console.error("Image upload error:", error);
          }
        }
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!title.trim()) {
    alert("Title cannot be empty");
    return;
  }

  try {
    const response = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        title, 
        content, 
        folder_id: selectedFolder // Pass selectedFolder
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save note");
    }

    const data = await response.json();
    console.log("Note saved with ID:", data.noteId);

    setTitle("");
    setContent("");
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
  } catch (error) {
    console.error("Error saving note:", error);
    alert("Failed to save note");
  }
};


  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      {/* Title Input */}
      <input
        type="text"
        placeholder="Enter note title..."
        className="w-full border rounded p-2 text-lg font-semibold"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Content Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={(e) => setContent(e.currentTarget.innerHTML)}
        onPaste={handlePaste}
        className="w-full border rounded p-2 min-h-[200px] outline-none"
        style={{ whiteSpace: "pre-wrap" }}
      />

      {/* Submit Button */}
      <button type="submit" className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
        Save Note
      </button>
    </form>
  );
}
