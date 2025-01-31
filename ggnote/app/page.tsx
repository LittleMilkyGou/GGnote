'use client'

import { useState, useCallback } from "react";
import NoteEditor from "@/components/NoteEditor";
import NoteContent from "@/components/NoteContent";

export default function Home() {
  const [leftWidth, setLeftWidth] = useState<number>(33); // Width of left section in %
  const [rightWidth, setRightWidth] = useState<number>(33); // Width of right section in %

  // Handle mouse move for resizing left section
  const handleLeftResize = useCallback((event: MouseEvent) => {
    setLeftWidth((prev) => Math.max(10, Math.min(50, prev + event.movementX * 0.1)));
  }, []);

  // Handle mouse move for resizing right section
  const handleRightResize = useCallback((event: MouseEvent) => {
    setRightWidth((prev) => Math.max(10, Math.min(50, prev - event.movementX * 0.1)));
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
      {/* Left Section */}
      <div style={{ width: `${leftWidth}%` }} className="p-4 bg-gray-100">
        <h2>Section 1</h2>
        <p>Content for the first section.</p>
      </div>

      {/* Resizable Divider (Left) */}
      <div
        className="w-2 bg-gray-400 cursor-ew-resize"
        onMouseDown={() => handleMouseDown(handleLeftResize)}
      ></div>

      {/* Middle Section */}
      <div className="flex-1 p-4">
        <NoteEditor />
      </div>

      {/* Resizable Divider (Right) */}
      <div
        className="w-2 bg-gray-400 cursor-ew-resize"
        onMouseDown={() => handleMouseDown(handleRightResize)}
      ></div>

      {/* Right Section */}
      <div style={{ width: `${rightWidth}%` }} className="p-4 bg-gray-100">
        <NoteContent />
      </div>
    </div>
  );
}
