"use client";

import { useState, useEffect, useRef } from "react";
import { Folder } from "@/interface/folderInterface";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSkeleton } from "./ui/sidebar";
import { useFolder } from "@/context/FolderContext";
import { FolderIcon, FolderPlus } from "lucide-react";
import { getFolders, createFolder, deleteFolder } from "@/lib/api";

export default function FolderList() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreateNewFolder, setIsCreateNewFolder] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { setSelectedFolderId } = useFolder();

  useEffect(() => {
    loadFolders();
  }, []);

  async function loadFolders() {
    try {
      const folders = await getFolders();
      console.log(folders); // Array of Folder objects
      setFolders(folders);
    } catch (err) {
      console.error("Error loading folders:", err);
    }
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setIsCreateNewFolder(false);
      return;
    }

    try {
      await createFolder(newFolderName);
      setNewFolderName("");
      setIsCreateNewFolder(false);
      // Refresh the folders list
      await loadFolders();
    } catch (err) {
      console.error("Error creating folder:", err);
      setError("Failed to create folder");
    }
  };

  const handleDeleteFolder = async (id: number) => {
    try {
      await deleteFolder(id);
      if (selectedFolder === id) {
        setSelectedFolder(null);
        setSelectedFolderId(null);
      }
      // Refresh the folders list
      await loadFolders();
    } catch (err) {
      console.error("Error deleting folder:", err);
      setError("Failed to delete folder");
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
    <SidebarMenu>
      {/* Create New Folder Button */}
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <div onClick={() => setIsCreateNewFolder((prev) => !prev)} className="flex items-center">
            <FolderPlus fontSize="large" className="cursor-pointer mr-2" />
            <span>Create Folder</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {/* Error Message */}
      {error && (
        <SidebarMenuItem>
          <div className="text-red-500 p-2">{error}</div>
        </SidebarMenuItem>
      )}
{folders.map((folder) => (
          <SidebarMenuItem key={folder.id}>
            <div
              className={`flex justify-between w-full items-center cursor-pointer p-2 rounded ${
                selectedFolder === folder.id ? "bg-blue-200" : "hover:bg-gray-200"
              }`}
              onClick={() => {
                setSelectedFolder(folder.id);
                setSelectedFolderId(folder.id);
              }}
            >
              <span className="flex items-center">
                <FolderIcon className="mr-2" />
                {folder.name}
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
            </div>
            {isLoading.toString()}
          </SidebarMenuItem>
        ))}
      {/* Loading State */}
      {isLoading ? (
        Array.from({ length: 5 }).map((_, index) => (
          <SidebarMenuItem key={index}>
            <SidebarMenuSkeleton showIcon />
          </SidebarMenuItem>
        ))
      ) : folders.length === 0 ? (
        <div className="p-2">No Folders Found</div>
      ) : (
        folders.map((folder) => (
          <SidebarMenuItem key={folder.id}>
            <div
              className={`flex justify-between w-full items-center cursor-pointer p-2 rounded ${
                selectedFolder === folder.id ? "bg-blue-200" : "hover:bg-gray-200"
              }`}
              onClick={() => {
                setSelectedFolder(folder.id);
                setSelectedFolderId(folder.id);
              }}
            >
              <span className="flex items-center">
                <FolderIcon className="mr-2" />
                {folder.name}
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
            </div>
          </SidebarMenuItem>
        ))
      )}

      {/* Folder Name Input (Shows when creating a new folder) */}
      {isCreateNewFolder && (
        <SidebarMenuItem>
          <input
            ref={inputRef}
            type="text"
            className="border p-2 flex-1 rounded mt-2 w-full"
            placeholder="New Folder"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </SidebarMenuItem>
      )}
    </SidebarMenu>
  );
}