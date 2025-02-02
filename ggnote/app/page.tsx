'use client';

import { useState, useCallback } from "react";
import NoteEditor from "@/components/NoteEditor";
import NoteList from "@/components/NoteList";
import NoteViewer from "@/components/NoteViewer";
import FolderList from "@/components/FolderList";

export default function Home() {
  const [leftWidth, setLeftWidth] = useState<number>(250);
  const [middleWidth, setMiddleWidth] = useState<number>(33);
  const [rightWidth, setRightWidth] = useState<number>(33);
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);

  // Handle resizing middle section
  const handleMiddleResize = useCallback((event: MouseEvent) => {
    setMiddleWidth((prev) => Math.max(20, Math.min(50, prev + event.movementX * 0.1)));
  }, []);

  // Handle resizing right section
  const handleRightResize = useCallback((event: MouseEvent) => {
    setRightWidth((prev) => Math.max(20, Math.min(50, prev - event.movementX * 0.1)));
  }, []);

  const handleMouseDown = (resizeFunction: (event: MouseEvent) => void) => {
    document.addEventListener("mousemove", resizeFunction);
    document.addEventListener(
      "mouseup",
      () => {
        document.removeEventListener("mousemove", resizeFunction);
      },
      { once: true }
    );
  };

  const handleOpenEditor = () => {
    setIsEditorOpen(true);
    setSelectedNoteId(null); // Deselect any open note
  };
  
  const handleCloseEditor = () => {
    setIsEditorOpen(false);
  };
  

  // Open NoteViewer (Triggered by Clicking a Note)
  const handleSelectNote = (noteId: number) => {
    setSelectedNoteId(noteId);
    setIsEditorOpen(false); // Close editor
  };

  return (
    <div className="flex h-screen">
      {/* Folder Sidebar */}
      <FolderList onSelectFolder={setSelectedFolder} width={leftWidth} setWidth={setLeftWidth} />

      {selectedFolder === null ? (
        <div className="flex-1 flex flex-col justify-center items-center text-center p-8">
          <h1 className="text-3xl font-bold text-gray-700">Welcome to GG Note 📒</h1>
          <p className="text-lg text-gray-500 mt-2">Select or create a folder to start taking notes.</p>
        </div>
      ) : (
        <>
          {/* Resizable Divider (Middle) */}
          <div className="w-2 bg-gray-400 cursor-ew-resize" onMouseDown={() => handleMouseDown(handleMiddleResize)}></div>

          {/* Middle Section - Note List */}
          <div style={{ width: `${middleWidth}%` }} className="p-4">
            <NoteList 
              selectedFolder={selectedFolder} 
              onAddNote={handleOpenEditor} 
              onSelectNote={handleSelectNote} 
            />
          </div>

          {/* Resizable Divider (Right) */}
          <div className="w-2 bg-gray-400 cursor-ew-resize" onMouseDown={() => handleMouseDown(handleRightResize)}></div>

          {/* Right Section - Display Editor or Viewer */}
          <div style={{ width: `${rightWidth}%` }} className="p-4">
            {isEditorOpen ? (
              <NoteEditor selectedFolder={selectedFolder} onCloseEditor={handleCloseEditor} />
            ) : (
              <NoteViewer selectedNoteId={selectedNoteId} />
            )}

          </div>
        </>
      )}
    </div>
  );
}
