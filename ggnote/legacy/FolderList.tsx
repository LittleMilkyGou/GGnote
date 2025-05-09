'use client'

import { useState, useEffect,  useRef } from "react";
import { fetchFolders, createFolder, deleteFolder } from "@/lib/folderAPI";
import { Folder } from "@/interface/folderInterface";
import { FolderIcon, FolderPlus } from "lucide-react";

interface FolderListProps {
  onSelectFolder: (folderId: number | null) => void;
  width: number;
}

export default function FolderList({ onSelectFolder, width }: FolderListProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreateNewFolder, setIsCreateNewFolder] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    const data = await fetchFolders();
    setFolders(data); 
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setIsCreateNewFolder(false);
      return;
    }

    const success = await createFolder(newFolderName);
    if (success) {
      setNewFolderName("");
      setIsCreateNewFolder(false);
      loadFolders();
    }
  };

  const handleDeleteFolder = async (id: number) => {
    const success = await deleteFolder(id);
    if (success) {
      if (selectedFolder === id) {
        setSelectedFolder(null);
        onSelectFolder(null);
      }
      loadFolders();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        handleCreateFolder();
      }
    };

    if (isCreateNewFolder) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCreateNewFolder, newFolderName]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleCreateFolder();
    }
  };


  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div style={{ width: `${width}px` }} className=" p-4 h-screen overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">GG Note</h2>

        {/* Create New Folder Button */}
        <div className="flex mb-4 justify-end">
          <FolderPlus
            fontSize="large"
            className="cursor-pointer"
            onClick={() => setIsCreateNewFolder((prev) => !prev)}
          />
        </div>

        {/* Folder List */}
        <ul className="space-y-2">
          {folders.map((folder) => (
            <li
              key={folder.id}
              className={`flex justify-between items-center cursor-pointer p-2 rounded ${
                selectedFolder === folder.id ? "bg-blue-200" : "hover:bg-gray-200"
              }`}
              onClick={() => {
                setSelectedFolder(folder.id);
                onSelectFolder(folder.id);
              }}
            >
              <span>
                <FolderIcon /> {folder.name}
              </span>
              <button
                className="text-red-500 hover:text-red-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFolder(folder.id);
                }}
              >
                ✖
              </button>
            </li>
          ))}
        </ul>

        {/* Folder Name Input (Shows when creating a new folder) */}
        {isCreateNewFolder && (
          <input
            ref={inputRef}
            type="text"
            className="border p-2 flex-1 rounded mt-4 w-full"
            placeholder="New Folder"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        )}
      </div>

    </div>
  );
}
