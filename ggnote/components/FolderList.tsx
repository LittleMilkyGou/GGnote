"use client";

import { useState, useEffect, useRef } from "react";
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { setSelectedFolderId } = useFolder();
  
  const fetchFolders = async () => {
    setIsLoading(true);
    try {
      const data = await window.api.getFolders();
      setFolders(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch folders:', err);
      setError('Failed to load folders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
    console.log("yes")
    const unsubscribe = window.api.onFoldersUpdated(() => {
      fetchFolders();
    });
    
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setIsCreateNewFolder(false);
      return;
    }

    try {
      const result = await window.api.createFolder({name:newFolderName});
      if (result.error) {
        console.error('Error creating folder:', result.error);
      } else {
        setNewFolderName("");
        setIsCreateNewFolder(false);
        fetchFolders(); 
      }
    } catch (err) {
      console.error('Failed to create folder:', err);
    }
  };

  const handleDeleteFolder = async (id: number) => {
    try {
      const result = await window.api.deleteFolder({id:id});
      if (result.error) {
        console.error('Error deleting folder:', result.error);
        if (result.status === 400) {
          alert(result.error);
        }
      } else {
        if (selectedFolder === id) {
          setSelectedFolder(null);
          setSelectedFolderId(null);
        }
        fetchFolders(); 
      }
    } catch (err) {
      console.error('Failed to delete folder:', err);
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
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <div onClick={() => setIsCreateNewFolder((prev) => !prev)} className="flex items-center">
            <FolderPlus fontSize="large" className="cursor-pointer mr-2" />
            <span>Create Folder</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {isLoading ? (
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