import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// Create a new note with title
export async function POST(req: NextRequest) {
  try {
    const { title, content, folder_id } = await req.json();

    // Ensure at least title or content is not empty
    if ((!title || title.trim() === "") && (!content || content.trim() === "")) {
      return NextResponse.json({ error: "Title or content must not be empty" }, { status: 400 });
    }

    const statement = db.prepare(`
      INSERT INTO notes (title, content, folder_id) VALUES (?, ?, ?)
    `);
    const result = statement.run(title || "Untitled Note", content || "", folder_id || null);

    return NextResponse.json({ message: "Note saved", noteId: result.lastInsertRowid });
  } catch (error) {
    console.error("Error saving note:", error);
    return NextResponse.json({ error: "Failed to save note" }, { status: 500 });
  }
}


// Get all notes with titles and updateTime
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const folderId = url.searchParams.get("folder_id");

    let statement;
    let notes;

    if (folderId) {
      statement = db.prepare("SELECT id, title, updated_at FROM notes WHERE folder_id = ? ORDER BY updated_at DESC");
      notes = statement.all(folderId);
    } else {
      statement = db.prepare("SELECT id, title, updated_at FROM notes ORDER BY updated_at DESC");
      notes = statement.all();
    }

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

