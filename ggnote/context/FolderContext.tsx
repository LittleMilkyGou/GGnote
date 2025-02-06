'use client'

import { createContext, ReactNode, useContext, useState } from "react";

interface FolderContextProps{
  selectedFolderId: number | null;
  setSelectedFolderId: (folderId: number | null) => void;
}

const FolderContext = createContext<FolderContextProps | undefined>(undefined);

export function FolderProvider({children}:{children:ReactNode}){
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  
  return(
    <FolderContext.Provider value={{selectedFolderId,setSelectedFolderId}}>
      {children}
    </FolderContext.Provider>
  )

} 

export function useFolder(){
  const context = useContext(FolderContext);
  if (!context) {
    throw new Error("useFolder must be used within a FolderProvider");
  }
  return context;
}