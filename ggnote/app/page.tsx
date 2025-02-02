'use client';

import { useState, useCallback } from "react";
import NoteEditor from "@/components/NoteEditor";
import NoteList from "@/components/NoteList";
import NoteViewer from "@/components/NoteViewer";
import FolderList from "@/components/FolderList";

export default function Home() {
  const [leftWidth, setLeftWidth] = useState<number>(250); // Sidebar width (px)
  const [middleWidth, setMiddleWidth] = useState<number>(33); // Middle section width (%)
  const [rightWidth, setRightWidth] = useState<number>(100 - (250 / window.innerWidth) * 100 - 33); // Right section width (%)
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);

  // Handle resizing FolderList and NoteList 
  const handleLeftResize = useCallback((event: MouseEvent) => {
    setLeftWidth((prevLeft) => {
      const newLeftWidth = Math.max(150, Math.min(400, prevLeft + event.movementX)); // Restrict size
      setMiddleWidth(Math.max(20, Math.min(50, 100 - (newLeftWidth / window.innerWidth) * 100 - rightWidth))); // Adjust NoteList width
      return newLeftWidth;
    });
  }, [rightWidth]);

  // Handle resizing NoteList and NoteDisplay
  const handleRightResize = useCallback((event: MouseEvent) => {
    setRightWidth((prevRight) => {
      const newRightWidth = Math.max(20, Math.min(50, prevRight - event.movementX * 0.1));
      setMiddleWidth(100 - newRightWidth - (leftWidth / window.innerWidth) * 100); // Adjust NoteList width
      return newRightWidth;
    });
  }, [leftWidth]);

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
      {/* Folder Sidebar (Resizable with Middle Section) */}
      <div style={{ width: `${leftWidth}px` }}>
        <FolderList onSelectFolder={setSelectedFolder} width={leftWidth} setWidth={setLeftWidth} />
      </div>

      {/* Resizable Divider (Middle - Fixed to adjust FolderList & NoteList) */}
      <div
        className="w-[0.1rem] bg-gray-300 cursor-ew-resize"
        onMouseDown={() => handleMouseDown(handleLeftResize )}
      ></div>

      {/* Middle Section - Note List */}
      <div style={{ width: `${middleWidth}%` }} className="p-4">
        <NoteList 
          selectedFolder={selectedFolder} 
          onAddNote={handleOpenEditor} 
          onSelectNote={handleSelectNote} 
        />
      </div>

      {/* Resizable Divider (Right - Fixed Behavior) */}
      <div
        className="w-[0.1rem] bg-gray-300 cursor-ew-resize"
        onMouseDown={() => handleMouseDown(handleRightResize)}
      ></div>

      {/* Right Section - Display Editor or Viewer */}
      <div style={{ width: `${rightWidth}%` }} className="p-4">
        {isEditorOpen ? (
          <NoteEditor selectedFolder={selectedFolder} onCloseEditor={handleCloseEditor} />
        ) : (
          <NoteViewer selectedNoteId={selectedNoteId} />
        )}
      </div>
    </div>
  );
}
