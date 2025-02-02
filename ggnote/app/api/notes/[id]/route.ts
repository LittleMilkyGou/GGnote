import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// GET a single note by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid note ID" }, { status: 400 });
    }

    const statement = db.prepare("SELECT id, title, content, updated_at FROM notes WHERE id = ?");
    const note = statement.get(id);

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error("Error fetching note:", error);
    return NextResponse.json({ error: "Failed to fetch note" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid note ID" }, { status: 400 });
    }

    const statement = db.prepare("DELETE FROM notes WHERE id = ?");
    statement.run(id);

    return NextResponse.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}


export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extract `id` correctly from params
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid note ID" }, { status: 400 });
    }

    const { title, content } = await req.json();

    if (!title && !content) {
      return NextResponse.json({ error: "Title or content must be provided" }, { status: 400 });
    }

    const statement = db.prepare("UPDATE notes SET title = ?, content = ? WHERE id = ?");
    statement.run(title || "Untitled Note", content || "", id);

    return NextResponse.json({ message: "Note updated successfully" });
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
  }
}

