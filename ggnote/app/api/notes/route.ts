import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Invalid content" }, { status: 400 });
    }

    const statement = db.prepare("INSERT INTO notes (content) VALUES (?)");
    const result = statement.run(content);

    return NextResponse.json({ message: "Note saved", noteId: result.lastInsertRowid });
  } catch (error) {
    console.error("Error saving note:", error);
    return NextResponse.json({ error: "Failed to save note" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const statement = db.prepare("SELECT * FROM notes ORDER BY id DESC");
    const notes = statement.all();

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}
