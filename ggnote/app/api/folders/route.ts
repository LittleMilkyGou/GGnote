import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// Create a new folder
export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Invalid folder name" }, { status: 400 });
    }

    const statement = db.prepare("INSERT INTO folders (name) VALUES (?)");
    const result = statement.run(name);

    return NextResponse.json({ message: "Folder created", folderId: result.lastInsertRowid });
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
  }
}

// Get all folders
export async function GET() {
  try {
    const statement = db.prepare("SELECT * FROM folders ORDER BY id DESC");
    const folders = statement.all();

    return NextResponse.json(folders);
  } catch (error) {
    console.error("Error fetching folders:", error);
    return NextResponse.json({ error: "Failed to fetch folders" }, { status: 500 });
  }
}

// Delete a folder (also sets associated notes' folder_id to NULL)
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id || typeof id !== "number") {
      return NextResponse.json({ error: "Invalid folder ID" }, { status: 400 });
    }

    const statement = db.prepare("DELETE FROM folders WHERE id = ?");
    statement.run(id);

    return NextResponse.json({ message: "Folder deleted" });
  } catch (error) {
    console.error("Error deleting folder:", error);
    return NextResponse.json({ error: "Failed to delete folder" }, { status: 500 });
  }
}
