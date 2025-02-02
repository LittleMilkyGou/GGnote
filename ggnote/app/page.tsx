'use client';

import { useState, useCallback } from "react";
import NoteEditor from "@/components/NoteEditor";
import NoteContent from "@/components/NoteContent";
import NoteViewer from "@/components/NoteViewer";
import FolderList from "@/components/FolderList";

export default function Home() {
  const [leftWidth, setLeftWidth] = useState<number>(250);
  const [middleWidth, setMiddleWidth] = useState<number>(33);
  const [rightWidth, setRightWidth] = useState<number>(33);
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);

  const handleMiddleResize = useCallback((event: MouseEvent) => {
    setMiddleWidth((prev) => Math.max(20, Math.min(50, prev + event.movementX * 0.1)));
  }, []);

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

  return (
    <div className="flex h-screen">
      <FolderList onSelectFolder={setSelectedFolder} width={leftWidth} setWidth={setLeftWidth} />

      {selectedFolder === null ? (
        <div className="flex-1 flex flex-col justify-center items-center text-center p-8">
          <h1 className="text-3xl font-bold text-gray-700">Welcome to GG Note 📒</h1>
          <p className="text-lg text-gray-500 mt-2">Select or create a folder to start taking notes.</p>
        </div>
      ) : (
        <>
          <div className="w-2 bg-gray-400 cursor-ew-resize" onMouseDown={() => handleMouseDown(handleMiddleResize)}></div>

          <div style={{ width: `${middleWidth}%` }} className="p-4">
            <NoteContent selectedFolder={selectedFolder} onAddNote={() => setIsEditorOpen(true)} onSelectNote={setSelectedNoteId} />
          </div>

          <div className="w-2 bg-gray-400 cursor-ew-resize" onMouseDown={() => handleMouseDown(handleRightResize)}></div>

          <div style={{ width: `${rightWidth}%` }} className="p-4">
            {isEditorOpen ? <NoteEditor selectedFolder={selectedFolder} /> : <NoteViewer selectedNoteId={selectedNoteId} />}
          </div>
        </>
      )}
    </div>
  );
}
