'use client';

import { useState, useCallback } from "react";
import NoteEditor from "@/components/NoteEditor";
import NoteList from "@/components/NoteList";
import NoteViewer from "@/components/NoteViewer";
import NoteCreator from "@/components/NoteCreator";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { useFolder } from "@/context/FolderContext";
 

export default function Home() {

  const {selectedFolderId} = useFolder();
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingNote, setEditingNote] = useState<{ id: number; title: string; content: string } | null>(null);
  const [isCreatorOpen, setIsCreatorOpen] = useState<boolean>(false);



  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setEditingNote(null);
    setIsCreatorOpen(false);
  };

  const handleOpenCreator = () => {
    setEditingNote(null);
    setIsEditorOpen(false);
    setIsCreatorOpen(true);
  };

  const handleCloseCreator = () => {
    setIsEditorOpen(false);
    setEditingNote(null);
    setIsCreatorOpen(false);
  };

  const handleSelectNote = (noteId: number | null) => {
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
      
      {/* <FolderList onSelectFolder={setSelectedFolderId} width={leftWidth} /> */}

      {selectedFolderId === null ? (
        <div className="flex-1 flex flex-col justify-center items-center text-center p-8">
          <h1 className="text-3xl font-bold text-gray-700">Welcome to GG Note 📒</h1>
          <p className="text-lg text-gray-500 mt-2">Select or create a folder to start taking notes.</p>
        </div>
      ) : (
        <>
          <ResizablePanelGroup direction="horizontal">
            
            <ResizablePanel defaultSize={33}>
              <div className="p-4">
                <NoteList
                  selectedFolder={selectedFolderId}
                  onAddNote={handleOpenCreator}
                  onSelectNote={handleSelectNote}
                  onCloseEditor={handleCloseEditor}
                />
              </div>
            </ResizablePanel>
            <ResizableHandle />

            <ResizablePanel>

              <div className="p-8">
                {isEditorOpen && editingNote ? (
                  <NoteEditor
                    selectedNote={editingNote}
                    onCloseEditor={handleCloseEditor}
                  />
                ) : isCreatorOpen ? (
                  <NoteCreator selectedFolder={selectedFolderId} setSelectedNoteId={setSelectedNoteId} onCloseCreator={handleCloseCreator}/>
                ) : (
                  <NoteViewer selectedNoteId={selectedNoteId} handleEditNote={handleEditNote} />
                )}

              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </>
      )}
    </div>
  );
}
