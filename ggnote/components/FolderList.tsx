'use client'

import { useState, useEffect } from "react";

interface Folder {
  id: number;
  name: string;
}

interface FolderListProps {
  onSelectFolder: (folderId: number | null) => void;
}

export default function FolderList({ onSelectFolder }: FolderListProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [newFolderName, setNewFolderName] = useState("");

  // Fetch folders on component mount
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

  // Create a new folder
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
        fetchFolders(); // Refresh folder list
      }
    } catch (error) {
      console.error("Failed to create folder", error);
    }
  };

  // Delete a folder
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

  return (
    <div className="w-64 bg-gray-100 p-4 h-screen overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Folders</h2>

      {/* New Folder Input */}
      <div className="flex mb-4">
        <input
          type="text"
          className="border p-2 flex-1 rounded"
          placeholder="New Folder"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
        />
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
            <span>📁 {folder.name}</span>
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
    </div>
  );
}
