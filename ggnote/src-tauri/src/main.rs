// src-tauri/src/main.rs
use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use std::sync::Mutex;
use tauri::{State, Manager};
use chrono::prelude::*;
use uuid::Uuid;

// Define data structures
#[derive(Debug, Serialize, Deserialize, Clone)]
struct Folder {
    id: i64,
    name: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct Note {
    id: i64,
    title: String,
    content: String,
    updated_at: String,
    folder_id: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct NotePreview {
    id: i64,
    title: String,
    updated_at: String,
}

// State to hold database connection
struct AppState {
    db: Mutex<Connection>,
}

// Initialize database
fn init_database(app: &tauri::App) -> Result<Connection, rusqlite::Error> {
    // Get the app data directory
    let app_dir = app.path().app_data_dir()
                  .expect("Failed to get app data directory");
    
    // Create directory if it doesn't exist
    fs::create_dir_all(&app_dir).expect("Failed to create app data directory");
    
    // Connect to SQLite database
    let db_path = app_dir.join("notes.db");
    let conn = Connection::open(db_path)?;
    
    // Create tables if they don't exist
    conn.execute(
        "CREATE TABLE IF NOT EXISTS folders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        )",
        [],
    )?;
    
    conn.execute(
        "CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            folder_id INTEGER,
            FOREIGN KEY (folder_id) REFERENCES folders(id)
        )",
        [],
    )?;
    
    Ok(conn)
}

// Folder operations
#[tauri::command]
fn get_folders(state: State<AppState>) -> Result<Vec<Folder>, String> {
    let conn = state.db.lock().unwrap();
    
    let mut stmt = conn.prepare("SELECT * FROM folders ORDER BY id DESC")
        .map_err(|e| e.to_string())?;
    
    let folder_iter = stmt.query_map([], |row| {
        Ok(Folder {
            id: row.get(0)?,
            name: row.get(1)?,
        })
    }).map_err(|e| e.to_string())?;
    
    let mut folders = Vec::new();
    for folder in folder_iter {
        folders.push(folder.map_err(|e| e.to_string())?);
    }
    
    Ok(folders)
}

#[tauri::command]
fn create_folder(state: State<AppState>, name: String) -> Result<i64, String> {
    if name.trim().is_empty() {
        return Err("Invalid folder name".to_string());
    }
    
    let conn = state.db.lock().unwrap();
    
    conn.execute(
        "INSERT INTO folders (name) VALUES (?)",
        params![name],
    )
    .map_err(|e| e.to_string())?;
    
    let last_id = conn.last_insert_rowid();
    
    Ok(last_id)
}

#[tauri::command]
fn delete_folder(state: State<AppState>, id: i64) -> Result<(), String> {
    let conn = state.db.lock().unwrap();
    
    conn.execute(
        "DELETE FROM folders WHERE id = ?",
        params![id],
    )
    .map_err(|e| e.to_string())?;
    
    // Update any notes that had this folder to have no folder
    conn.execute(
        "UPDATE notes SET folder_id = NULL WHERE folder_id = ?",
        params![id],
    )
    .map_err(|e| e.to_string())?;
    
    Ok(())
}

// Note operations
#[tauri::command]
fn get_notes(state: State<AppState>, folder_id: Option<i64>) -> Result<Vec<NotePreview>, String> {
    let conn = state.db.lock().unwrap();
    
    let sql = match folder_id {
        Some(_) => "SELECT id, title, updated_at FROM notes WHERE folder_id = ? ORDER BY updated_at DESC",
        None => "SELECT id, title, updated_at FROM notes ORDER BY updated_at DESC",
    };
    
    let mut stmt = conn.prepare(sql).map_err(|e| e.to_string())?;
    
    // Extract the row mapping logic into a separate function
    let map_row = |row: &rusqlite::Row| -> rusqlite::Result<NotePreview> {
        Ok(NotePreview {
            id: row.get(0)?,
            title: row.get(1)?,
            updated_at: row.get(2)?,
        })
    };
    
    // Now use the same function in both match arms
    let note_iter = match folder_id {
        Some(id) => stmt.query_map(params![id], map_row),
        None => stmt.query_map([], map_row),
    }.map_err(|e| e.to_string())?;
    
    let mut notes = Vec::new();
    for note in note_iter {
        notes.push(note.map_err(|e| e.to_string())?);
    }
    
    Ok(notes)
}

#[tauri::command]
fn get_note(state: State<AppState>, id: i64) -> Result<Note, String> {
    let conn = state.db.lock().unwrap();
    
    let mut stmt = conn.prepare("SELECT id, title, content, updated_at, folder_id FROM notes WHERE id = ?")
        .map_err(|e| e.to_string())?;
    
    let note = stmt.query_row(params![id], |row| {
        Ok(Note {
            id: row.get(0)?,
            title: row.get(1)?,
            content: row.get(2)?,
            updated_at: row.get(3)?,
            folder_id: row.get(4)?,
        })
    }).map_err(|e| e.to_string())?;
    
    Ok(note)
}

#[tauri::command]
fn create_note(state: State<AppState>, title: String, content: String, folder_id: Option<i64>) -> Result<i64, String> {
    if title.trim().is_empty() && content.trim().is_empty() {
        return Err("Title or content must not be empty".to_string());
    }
    
    let conn = state.db.lock().unwrap();
    
    let title_to_use = if title.trim().is_empty() { "Untitled Note".to_string() } else { title };
    let content_to_use = content;
    
    conn.execute(
        "INSERT INTO notes (title, content, folder_id) VALUES (?, ?, ?)",
        params![title_to_use, content_to_use, folder_id],
    )
    .map_err(|e| e.to_string())?;
    
    let last_id = conn.last_insert_rowid();
    
    Ok(last_id)
}

#[tauri::command]
fn update_note(state: State<AppState>, id: i64, title: String, content: String) -> Result<(), String> {
    if title.trim().is_empty() && content.trim().is_empty() {
        return Err("Title or content must be provided".to_string());
    }
    
    let conn = state.db.lock().unwrap();
    
    let title_to_use = if title.trim().is_empty() { "Untitled Note".to_string() } else { title };
    
    let now = Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();
    
    conn.execute(
        "UPDATE notes SET title = ?, content = ?, updated_at = ? WHERE id = ?",
        params![title_to_use, content, now, id],
    )
    .map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
fn delete_note(state: State<AppState>, id: i64) -> Result<(), String> {
    let conn = state.db.lock().unwrap();
    
    conn.execute(
        "DELETE FROM notes WHERE id = ?",
        params![id],
    )
    .map_err(|e| e.to_string())?;
    
    Ok(())
}

// File upload handling
#[tauri::command]
fn save_image(app: tauri::AppHandle, file_data: Vec<u8>, file_name: String) -> Result<String, String> {
    // Get the app data directory
    let app_dir = app.path().app_data_dir()
                  .expect("Failed to get app data directory");
    
    // Create uploads directory if it doesn't exist
    let uploads_dir = app_dir.join("uploads");
    fs::create_dir_all(&uploads_dir).expect("Failed to create uploads directory");
    
    // Generate unique filename
    let uuid = Uuid::new_v4();
    let extension = Path::new(&file_name)
        .extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or("png");
    
    let unique_name = format!("{}-{}.{}", chrono::Utc::now().timestamp(), uuid, extension);
    let file_path = uploads_dir.join(&unique_name);
    
    // Save the file
    fs::write(&file_path, file_data).map_err(|e| e.to_string())?;
    
    // Return the path relative to uploads
    Ok(unique_name)
}

#[tauri::command]
fn get_image_path(app: tauri::AppHandle, file_name: String) -> Result<String, String> {
    let app_dir = app.path().app_data_dir()
                  .expect("Failed to get app data directory");
    
    let uploads_dir = app_dir.join("uploads");
    let file_path = uploads_dir.join(&file_name);
    
    // Convert to string
    let path_str = file_path.to_str()
        .ok_or("Failed to convert path to string")?
        .to_string();
    
    Ok(path_str)
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Initialize database
            let conn = init_database(app).expect("Failed to initialize database");
            
            // Register app state
            app.manage(AppState {
                db: Mutex::new(conn),
            });
            
            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_log::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            get_folders,
            create_folder,
            delete_folder,
            get_notes,
            get_note,
            create_note,
            update_note,
            delete_note,
            save_image,
            get_image_path,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}