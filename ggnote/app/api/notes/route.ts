import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// Save a new note with optional folder_id
export async function POST(req: NextRequest) {
  try {
    const { content, folder_id } = await req.json();

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Invalid content" }, { status: 400 });
    }

    const statement = db.prepare(`
      INSERT INTO notes (content, folder_id) VALUES (?, ?)
    `);
    const result = statement.run(content, folder_id || null);

    return NextResponse.json({ message: "Note saved", noteId: result.lastInsertRowid });
  } catch (error) {
    console.error("Error saving note:", error);
    return NextResponse.json({ error: "Failed to save note" }, { status: 500 });
  }
}

// Get all notes, optionally filtered by folder
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const folderId = url.searchParams.get("folder_id");

    let notes;
    if (folderId) {
      const statement = db.prepare("SELECT * FROM notes WHERE folder_id = ? ORDER BY id DESC");
      notes = statement.all(folderId);
    } else {
      const statement = db.prepare("SELECT * FROM notes ORDER BY id DESC");
      notes = statement.all();
    }

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}
