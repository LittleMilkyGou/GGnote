'use client'

import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { Folder } from "@/interface/folderInterface";

interface FolderContextProps {
  selectedFolderId: number | null;
  setSelectedFolderId: (folderId: number | null) => void;
  defaultFolderId: number | null;
}

// No need to redeclare global Window interface here
// It's already defined in folderInterface.ts

const FolderContext = createContext<FolderContextProps | undefined>(undefined);

export function FolderProvider({children}:{children:ReactNode}) {
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [defaultFolderId, setDefaultFolderId] = useState<number | null>(null);
  
  // Get the default folder on initial load
  useEffect(() => {
    const getDefaultFolder = async () => {
      try {
        const folders = await window.api.getFolders();
        if (folders) {
          // Use the first folder as default
          const defaultId = folders[0].id;
          setDefaultFolderId(defaultId);
          
          // If no folder is currently selected, select the default one
          if (!selectedFolderId) {
            setSelectedFolderId(defaultId);
          }
        }
      } catch (error) {
        console.error("Error fetching default folder:", error);
      }
    };

    getDefaultFolder();
  }, [selectedFolderId]);
  
  return (
    <FolderContext.Provider value={{
      selectedFolderId,
      setSelectedFolderId,
      defaultFolderId
    }}>
      {children}
    </FolderContext.Provider>
  )
}

export function useFolder() {
  const context = useContext(FolderContext);
  if (!context) {
    throw new Error("useFolder must be used within a FolderProvider");
  }
  return context;
}