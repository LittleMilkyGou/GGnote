import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// Create a new note with title
export async function POST(req: NextRequest) {
  try {
    const { title, content, folder_id } = await req.json();

    if (!title || typeof title !== "string" || title.trim() === "") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const statement = db.prepare(`
      INSERT INTO notes (title, content, folder_id) VALUES (?, ?, ?)
    `);
    const result = statement.run(title, content, folder_id || null);

    return NextResponse.json({ message: "Note saved", noteId: result.lastInsertRowid });
  } catch (error) {
    console.error("Error saving note:", error);
    return NextResponse.json({ error: "Failed to save note" }, { status: 500 });
  }
}

// Get all notes with titles
export async function GET() {
  try {
    const statement = db.prepare("SELECT id, title, content, folder_id FROM notes ORDER BY id DESC");
    const notes = statement.all();

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}
