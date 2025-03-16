const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');
const fs = require('fs');

// Ensure the data directory exists
const userDataPath = app.getPath('userData');
const dbDir = path.join(userDataPath, 'database');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Connect to SQLite database - use the same filename as your original
const db = new Database(path.join(dbDir, 'ggnote.db'));

// Initialize database tables
function initDatabase() {
  // Create folders table - using your exact schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS folders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create notes table - using your exact schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      content TEXT,
      folder_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
    )
  `);

  // Create a default folder if none exists
  const folderCount = db.prepare('SELECT COUNT(*) as count FROM folders').get();
  if (folderCount.count === 0) {
    db.prepare('INSERT INTO folders (name) VALUES (?)').run('Default');
  }

  // Create uploads directory
  const uploadsDir = path.join(app.getPath('userData'), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}

module.exports = { db, initDatabase };