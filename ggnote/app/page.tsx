'use client'

import React, { useRef, useState } from "react";

export default function Home() {
  const editorRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState("");

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

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          const data = await response.json();
          const imageUrl = data.filePath;

          // Insert the image into the content at the cursor position
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
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!content.trim()) {
      alert("Content cannot be empty");
      return;
    }
  
    const response = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
  
    if (!response.ok) {
      alert("Failed to save note");
      return;
    }
  
    const data = await response.json();
    console.log("Note saved with ID:", data.noteId);
  
    setContent("");
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
  };
  

  return (
    <form onSubmit={handleSubmit}>
      <div
        ref={editorRef}
        contentEditable
        onInput={(e) => setContent(e.currentTarget.innerHTML)}
        onPaste={handlePaste}
        className="w-full border rounded p-2 min-h-[200px]"
        style={{ whiteSpace: "pre-wrap" }}
      />
      <button type="submit" className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
        Save Note
      </button>
    </form>
  );
}
