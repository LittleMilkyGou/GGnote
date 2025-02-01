'use client'

import { useState, useEffect, useCallback } from "react";
import FolderIcon from '@mui/icons-material/Folder';

interface Folder {
  id: number;
  name: string;
}

interface FolderListProps {
  onSelectFolder: (folderId: number | null) => void;
  width: number; // Width of the sidebar
  setWidth: (width: number) => void; // Function to update width
}

export default function FolderList({ onSelectFolder, width, setWidth }: FolderListProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [newFolderName, setNewFolderName] = useState("");

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const response = await fetch("/api/folders");
      const data = await response.json();
      setFolders(data);
    } catch (error) {
      console.error("Failed to fetch folders", error);
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFolderName }),
      });

      if (response.ok) {
        setNewFolderName("");
        fetchFolders();
      }
    } catch (error) {
      console.error("Failed to create folder", error);
    }
  };

  const deleteFolder = async (id: number) => {
    if (!confirm("Are you sure you want to delete this folder?")) return;

    try {
      const response = await fetch("/api/folders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        if (selectedFolder === id) {
          setSelectedFolder(null);
          onSelectFolder(null);
        }
        fetchFolders();
      }
    } catch (error) {
      console.error("Failed to delete folder", error);
    }
  };

  // Handle resizable sidebar
  const handleResize = useCallback((event: MouseEvent) => {
    setWidth((prev) => Math.max(150, Math.min(400, prev + event.movementX)));
  }, [setWidth]);

  const handleMouseDown = () => {
    document.addEventListener("mousemove", handleResize);
    document.addEventListener("mouseup", () => {
      document.removeEventListener("mousemove", handleResize);
    }, { once: true });
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div style={{ width: `${width}px` }} className="bg-gray-100 p-4 h-screen overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Folders</h2>

        {/* New Folder Input */}
        <div className="flex mb-4">
          <button
            type="button"
            className="ml-2 bg-blue-500 text-white px-3 py-2 rounded"
            onClick={createFolder}
          >
            +
          </button>
        </div>

        {/* Folder List */}
        <ul className="space-y-2">
          <li
            className={`cursor-pointer p-2 rounded ${selectedFolder === null ? "bg-blue-200" : "hover:bg-gray-200"}`}
            onClick={() => {
              setSelectedFolder(null);
              onSelectFolder(null);
            }}
          >
            📄 All Notes
          </li>
          {folders.map((folder) => (
            <li
              key={folder.id}
              className={`flex justify-between items-center cursor-pointer p-2 rounded ${selectedFolder === folder.id ? "bg-blue-200" : "hover:bg-gray-200"}`}
              onClick={() => {
                setSelectedFolder(folder.id);
                onSelectFolder(folder.id);
              }}
            >
              <span><FolderIcon /> {folder.name}</span>
              <button
                className="text-red-500 hover:text-red-700"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteFolder(folder.id);
                }}
              >
                ✖
              </button>
            </li>
          ))}
        </ul>

        {/* Folder Name Input */}
        <input
          type="text"
          className="border p-2 flex-1 rounded mt-4 w-full"
          placeholder="New Folder"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
        />
      </div>

      {/* Resizable Divider */}
      <div
        className="w-2 bg-gray-400 cursor-ew-resize"
        onMouseDown={handleMouseDown}
      ></div>
    </div>
  );
}
