import { Folder } from "@/interface/folderInterface";

/**
 * Fetch all folders from the API.
 */
export const fetchFolders = async (): Promise<Folder[]> => {
  try {
    const response = await fetch("/api/folders");
    if (!response.ok) throw new Error("Failed to fetch folders");
    return response.json();
  } catch (error) {
    console.error("Error fetching folders:", error);
    return [];
  }
};

/**
 * Create a new folder.
 * @param name Folder name
 */
export const createFolder = async (name: string): Promise<boolean> => {
  if (!name.trim()) return false;

  try {
    const response = await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    return response.ok;
  } catch (error) {
    console.error("Error creating folder:", error);
    return false;
  }
};

/**
 * Delete a folder by ID.
 * @param id Folder ID
 */
export const deleteFolder = async (id: number): Promise<boolean> => {
  if (!confirm("Are you sure you want to delete this folder?")) return false;

  try {
    const response = await fetch("/api/folders", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    return response.ok;
  } catch (error) {
    console.error("Error deleting folder:", error);
    return false;
  }
};
