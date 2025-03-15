"use client";

import { invoke  } from "@tauri-apps/api/core";




// Types
export interface Folder {
  id: number;
  name: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  updated_at: string;
  folder_id?: number;
}

export interface NotePreview {
  id: number;
  title: string;
  updated_at: string;
}

// Folder Operations
export async function getFolders(): Promise<Folder[]> {
  try {
    const folders =  await invoke<Folder[]>("get_folders");
    console.log(folders)
    return folders;
  } catch (error) {
    console.error("Error fetching folders:", error);
    throw error;
  }
}

export async function createFolder(name: string): Promise<number> {
  try {
    return await invoke<number>("create_folder", { name });
  } catch (error) {
    console.error("Error creating folder:", error);
    throw error;
  }
}

export async function deleteFolder(id: number): Promise<void> {
  try {
    await invoke<void>("delete_folder", { id });
  } catch (error) {
    console.error("Error deleting folder:", error);
    throw error;
  }
}

export async function getNotes(folderId?: number): Promise<NotePreview[]> {
  try {
    return await invoke<NotePreview[]>("get_notes", { folderId });
  } catch (error) {
    console.error("Error fetching notes:", error);
    throw error;
  }
}

export async function getNote(id: number): Promise<Note> {
  try {
    return await invoke<Note>("get_note", { id });
  } catch (error) {
    console.error("Error fetching note:", error);
    throw error;
  }
}

export async function createNote(
  title: string,
  content: string,
  folderId?: number
): Promise<number> {
  try {
    return await invoke<number>("create_note", { title, content, folderId });
  } catch (error) {
    console.error("Error creating note:", error);
    throw error;
  }
}

export async function updateNote(
  id: number,
  title: string,
  content: string
): Promise<void> {
  try {
    await invoke<void>("update_note", { id, title, content });
  } catch (error) {
    console.error("Error updating note:", error);
    throw error;
  }
}

export async function deleteNote(id: number): Promise<void> {
  try {
    await invoke<void>("delete_note", { id });
  } catch (error) {
    console.error("Error deleting note:", error);
    throw error;
  }
}

export async function uploadImage(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const fileData = Array.from(new Uint8Array(arrayBuffer));
    return await invoke<string>("save_image", { fileData, fileName: file.name });
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

export async function getImagePath(fileName: string): Promise<string> {
  try {
    return await invoke<string>("get_image_path", { fileName });
  } catch (error) {
    console.error("Error getting image path:", error);
    throw error;
  }
}

// Helper to check if the app is running in a Tauri environment
export function isTauriApp(): boolean {
  return typeof window !== "undefined" && !!(window as any).__TAURI__;
}
