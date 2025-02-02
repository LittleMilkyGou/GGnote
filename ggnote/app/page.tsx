'use client';

import { useState, useCallback } from "react";
import NoteEditor from "@/components/NoteEditor";
import NoteList from "@/components/NoteList";
import NoteViewer from "@/components/NoteViewer";
import FolderList from "@/components/FolderList";
import NoteCreator from "@/components/NoteCreator";

export default function Home() {
  const [leftWidth, setLeftWidth] = useState<number>(250);
  const [middleWidth, setMiddleWidth] = useState<number>(33);
  const [rightWidth, setRightWidth] = useState<number>(34);

  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingNote, setEditingNote] = useState<{ id: number; title: string; content: string } | null>(null);
  const [isCreatorOpen, setIsCreatorOpen] = useState<boolean>(false);

  const handleLeftResize = useCallback((event: MouseEvent) => {
    setLeftWidth((prevLeft) => {
      const newLeftWidth = Math.max(150, Math.min(400, prevLeft + event.movementX));
      return newLeftWidth;
    });
  }, []);

  const handleRightResize = useCallback((event: MouseEvent) => {
    setRightWidth((prevRight) => {
      const newRightWidth = Math.max(20, Math.min(50, prevRight - event.movementX * 0.1));
      return newRightWidth;
    });
  }, []);

  const handleMouseDown = (resizeFunction: (event: MouseEvent) => void) => {
    document.addEventListener("mousemove", resizeFunction);
    document.addEventListener("mouseup", () => {
      document.removeEventListener("mousemove", resizeFunction);
    }, { once: true });
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setEditingNote(null);
  };

  const handleOpenCreator = () => {
    setEditingNote(null);
    setIsEditorOpen(false);
    setSelectedNoteId(null);
    setIsCreatorOpen(true);
  };

  const handleCloseCreator = () => {
    setIsEditorOpen(false);
    setEditingNote(null);
    setIsCreatorOpen(false);
    setSelectedNoteId(null);
  };

  const handleSelectNote = (noteId: number) => {
    setSelectedNoteId(noteId);
    setIsEditorOpen(false);
  };

  const handleEditNote = (note: { id: number; title: string; content: string }) => {
    setEditingNote(note);
    setIsCreatorOpen(false);
    setIsEditorOpen(true);
  };

  return (
    <div className="flex h-screen">
      <FolderList onSelectFolder={setSelectedFolderId} width={leftWidth} />

      {selectedFolderId === null ? (
        <div className="flex-1 flex flex-col justify-center items-center text-center p-8">
          <h1 className="text-3xl font-bold text-gray-700">Welcome to GG Note 📒</h1>
          <p className="text-lg text-gray-500 mt-2">Select or create a folder to start taking notes.</p>
        </div>
      ) : (
        <>
          <div className="w-[0.1rem] bg-gray-300 cursor-ew-resize" onMouseDown={() => handleMouseDown(handleLeftResize)}></div>

          <div style={{ width: `${middleWidth}%` }} className="p-4">
            <NoteList
              selectedFolder={selectedFolderId}
              onAddNote={handleOpenCreator}
              onSelectNote={handleSelectNote}
            />
          </div>

          <div className="w-[0.1rem] bg-gray-300 cursor-ew-resize" onMouseDown={() => handleMouseDown(handleRightResize)}></div>

          <div style={{ width: `${rightWidth}%` }} className="p-4">
            {isEditorOpen && editingNote ? (
              <NoteEditor
                selectedNote={editingNote}
                onCloseEditor={handleCloseEditor}
              />
            ) : isCreatorOpen ? (
              <NoteCreator selectedFolder={selectedFolderId} onCloseCreator={handleCloseCreator}/>
            ) : (
              <NoteViewer selectedNoteId={selectedNoteId} handleEditNote={handleEditNote} />
            )}

          </div>

        </>
      )}
    </div>
  );
}
