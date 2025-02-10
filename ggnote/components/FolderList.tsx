"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { fetchFolders, createFolder, deleteFolder } from "@/lib/folderAPI";
import { Folder } from "@/interface/folderInterface";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSkeleton } from "./ui/sidebar";
import { useFolder } from "@/context/FolderContext";
import { FolderIcon, FolderPlus } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";



export default function FolderList() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreateNewFolder, setIsCreateNewFolder] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const {setSelectedFolderId} = useFolder();
  
  // Fetch folders
  const { data, error, mutate } = useSWR("/api/folders", fetchFolders, { refreshInterval: 5000 });

  useEffect(() => {
    if (data) setFolders(data);
  }, [data]);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setIsCreateNewFolder(false);
      return;
    }

    const success = await createFolder(newFolderName);
    if (success) {
      setNewFolderName("");
      setIsCreateNewFolder(false);
      mutate(); // Re-fetch folders
    }
  };

  const handleDeleteFolder = async (id: number) => {
    const success = await deleteFolder(id);
    if (success) {
      if (selectedFolder === id) {
        setSelectedFolder(null);
        setSelectedFolderId(null);
      }
      mutate(); // Re-fetch folders
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

  if (error) return <div>Failed to load folders</div>;

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

      {/* Loading State */}

        {!folders ? (
          Array.from({ length: 5 }).map((_, index) => (
            <SidebarMenuItem key={index}>
              <SidebarMenuSkeleton showIcon />
            </SidebarMenuItem>
          ))
        ) : folders.length === 0 ? (
          <div>No Folders Found</div>
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
                    <FolderIcon className="mr-2 " />
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
