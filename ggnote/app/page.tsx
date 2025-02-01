'use client'

import { useState, useCallback, useEffect } from "react";
import NoteEditor from "@/components/NoteEditor";
import NoteContent from "@/components/NoteContent";
import FolderList from "@/components/FolderList";

export default function Home() {
  const [leftWidth, setLeftWidth] = useState<number>(250); // Sidebar width in px
  const [middleWidth, setMiddleWidth] = useState<number>(33); // Middle section width in %
  const [rightWidth, setRightWidth] = useState<number>(33); // Right section width in %
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);


  // Handle resizing middle section
  const handleMiddleResize = useCallback((event: MouseEvent) => {
    setMiddleWidth((prev) => Math.max(20, Math.min(50, prev + event.movementX * 0.1)));
  }, []);

  // Handle resizing right section
  const handleRightResize = useCallback((event: MouseEvent) => {
    setRightWidth((prev) => Math.max(20, Math.min(50, prev - event.movementX * 0.1)));
  }, []);

  // Start dragging the resizer
  const handleMouseDown = (resizeFunction: (event: MouseEvent) => void) => {
    document.addEventListener("mousemove", resizeFunction);
    document.addEventListener("mouseup", () => {
      document.removeEventListener("mousemove", resizeFunction);
    }, { once: true });
  };

  return (
    <div className="flex h-screen">
      {/* Folder Sidebar (Resizable) */}
      <FolderList onSelectFolder={setSelectedFolder} width={leftWidth} setWidth={setLeftWidth} />

      {/* If No Folder is Selected, Show Welcome Page */}
      {selectedFolder === null ? (
        <div className="flex-1 flex flex-col justify-center items-center text-center p-8">
          <h1 className="text-3xl font-bold text-gray-700">Welcome to GG Note 📒</h1>
          <p className="text-lg text-gray-500 mt-2">Select or create a folder to start taking notes.</p>
        </div>
      ) : (
        <>
          {/* Resizable Divider (Middle) */}
          <div
            className="w-2 bg-gray-400 cursor-ew-resize"
            onMouseDown={() => handleMouseDown(handleMiddleResize)}
          ></div>

          {/* Middle Section */}
          <div style={{ width: `${middleWidth}%` }} className="p-4">
            <NoteContent selectedFolder={selectedFolder}/>
          </div>

          {/* Resizable Divider (Right) */}
          <div
            className="w-2 bg-gray-400 cursor-ew-resize"
            onMouseDown={() => handleMouseDown(handleRightResize)}
          ></div>

          {/* Right Section */}
          <div style={{ width: `${rightWidth}%` }} className="p-4 bg-gray-100">
            <NoteEditor selectedFolder={selectedFolder}/>
          </div>
        </>
      )}
    </div>
  );
}
