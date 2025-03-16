const { app, BrowserWindow, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const url = require('url');
const { db, initDatabase } = require('./db');
const { setupIpcHandlers } = require('./ipc-handlers');

// Setup logging for debugging 
const logPath = path.join(app.getPath('userData'), 'app.log');
console.log(`Logging to: ${logPath}`);

// Override console.log, error, etc. to also write to a file
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

console.log = function() {
  const args = Array.from(arguments);
  try {
    fs.appendFileSync(logPath, `[LOG] ${args.join(' ')}\n`);
  } catch (err) {
  }
  originalConsoleLog.apply(console, args);
};

console.error = function() {
  const args = Array.from(arguments);
  try {
    fs.appendFileSync(logPath, `[ERROR] ${args.join(' ')}\n`);
  } catch (err) {
  }
  originalConsoleError.apply(console, args);
};

console.log(`App starting at ${new Date().toISOString()}`);
console.log(`App path: ${app.getAppPath()}`);
console.log(`__dirname: ${__dirname}`);
console.log(`process.cwd(): ${process.cwd()}`);

const isDev = process.env.NODE_ENV === 'development';
let mainWindow;

// Handle Next.js static files with a custom protocol
function registerNextStaticProtocol() {
  protocol.registerBufferProtocol('static', (request, callback) => {
    
    let filePath = request.url.replace('static://', '');
    
    filePath = filePath.replace(/^\/+/, '');
    
    if (filePath.startsWith('_next/_next/')) {
      filePath = filePath.replace('_next/_next/', '_next/');
    }
    
    // In production builds, resources are in the resources/app.asar (or resources/app) directory
    let basePath = __dirname;
    if (app.isPackaged) {

      if (__dirname.includes('app.asar')) {
        basePath = path.join(process.resourcesPath, 'app.asar');
      } else {
        basePath = path.join(process.resourcesPath, 'app');
      }
    }
    
    const absolutePath = path.join(basePath, 'out', filePath);
    
    console.log(`Loading static resource: ${filePath}`);
    console.log(`Absolute path: ${absolutePath}`);
    
    try {
      if (!fs.existsSync(absolutePath)) {
        console.error(`File not found: ${absolutePath}`);

        const altPath = path.join(process.resourcesPath, 'app', 'out', filePath);
        console.log(`Trying alternative path: ${altPath}`);
        
        if (fs.existsSync(altPath)) {
          const data = fs.readFileSync(altPath);
          const extension = path.extname(altPath).toLowerCase();
          let mimeType = getMimeType(extension);
          console.log(`Found file at alternative path: ${altPath}`);
          return callback({ mimeType, data });
        }
        
        return callback(null);
      }
      
      const data = fs.readFileSync(absolutePath);
      const extension = path.extname(absolutePath).toLowerCase();
      let mimeType = getMimeType(extension);
      
      callback({ mimeType, data });
    } catch (error) {
      console.error(`Failed to load file: ${absolutePath}`, error);
      callback(null);
    }
  });
}

function getMimeType(extension) {
  let mimeType = 'text/plain';
  
  // Set correct MIME type based on file extension
  if (extension === '.js') mimeType = 'text/javascript';
  else if (extension === '.css') mimeType = 'text/css';
  else if (extension === '.html') mimeType = 'text/html';
  else if (extension === '.svg') mimeType = 'image/svg+xml';
  else if (extension === '.png') mimeType = 'image/png';
  else if (extension === '.jpg' || extension === '.jpeg') mimeType = 'image/jpeg';
  else if (extension === '.woff') mimeType = 'font/woff';
  else if (extension === '.woff2') mimeType = 'font/woff2';
  else if (extension === '.ttf') mimeType = 'font/ttf';
  else if (extension === '.eot') mimeType = 'application/vnd.ms-fontobject';
  else if (extension === '.otf') mimeType = 'font/otf';
  else if (extension === '.json') mimeType = 'application/json';
  
  return mimeType;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      devTools: true // Enable DevTools in production for debugging
    }
  });

  if (isDev) {
    console.log('Running in development mode...');
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    console.log('Running in production mode...');
    
    // In packaged apps, the out directory should be in the resources folder
    let outDir = path.join(__dirname, 'out');
    if (app.isPackaged) {
      if (__dirname.includes('app.asar')) {
        outDir = path.join(process.resourcesPath, 'app.asar', 'out');
      } else {
        outDir = path.join(process.resourcesPath, 'app', 'out');
      }
    }
    
    console.log(`Looking for out directory at: ${outDir}`);
    
    if (fs.existsSync(outDir)) {
      console.log('Loading from out directory...');
      
      // Read the index.html content
      const indexPath = path.join(outDir, 'index.html');
      console.log(`Index path: ${indexPath}`);
      
      if (!fs.existsSync(indexPath)) {
        console.error(`ERROR: index.html not found at ${indexPath}`);
        mainWindow.loadFile(path.join(__dirname, 'error.html'));
        return;
      }
      
      let htmlContent = fs.readFileSync(indexPath, 'utf8');
      
      // Replace all occurrences of /_next/ with static://_next/
      // Use a regex that ensures we're not doubling up replacements
      htmlContent = htmlContent.replace(/(href|src)=(['"])(\/?_next\/)/g, '$1=$2static://$3');
      
      // Update any URLs in inline styles
      htmlContent = htmlContent.replace(/url\(['"]?\/?_next\//g, "url('static://_next/");
      
      // Write to a temp file in userData directory (which is writable in packaged apps)
      const tempDir = app.getPath('userData');
      const tempHtmlPath = path.join(tempDir, 'temp-index.html');
      
      fs.writeFileSync(tempHtmlPath, htmlContent);
      console.log(`Wrote modified HTML to: ${tempHtmlPath}`);
      
      // Load the modified HTML file
      mainWindow.loadFile(tempHtmlPath);
      
      // Open DevTools in production for debugging
      mainWindow.webContents.openDevTools();
    } else {
      console.error(`Error: out directory not found at ${outDir}!`);
      
      // Try to list the contents of the app directory
      try {
        const appDir = app.isPackaged 
          ? (path.join(process.resourcesPath, 'app.asar'))
          : __dirname;
        
        console.log(`Listing contents of app directory: ${appDir}`);
        const files = fs.readdirSync(appDir);
        console.log('Directory contents:', files);
      } catch (error) {
        console.error('Failed to list directory:', error);
      }
      
      mainWindow.loadFile(path.join(__dirname, 'error.html'));
    }
  }

  // Debug loading issues
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error(`Failed to load: ${errorDescription} (${errorCode})`);
  });
  
  // Log resource loading errors
  mainWindow.webContents.session.webRequest.onErrorOccurred((details) => {
    console.log(`Resource error: ${details.error} for ${details.url}`);
  });

  // Add event to show the window when the web contents are fully loaded
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Window content finished loading');
    mainWindow.show();
  });

  // Set up IPC handlers for database operations
  setupIpcHandlers(mainWindow);
}

app.whenReady().then(() => {
  initDatabase();
  
  registerNextStaticProtocol();
  
  createWindow();
  
  const errorHtmlPath = path.join(app.getPath('userData'), 'error.html');
  fs.writeFileSync(errorHtmlPath, `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Error</title>
    <style>
      body { font-family: sans-serif; padding: 20px; }
      h1 { color: #e53e3e; }
    </style>
  </head>
  <body>
    <h1>Build Error</h1>
    <p>Could not find Next.js build output.</p>
    <p>Please run "npm run build" before starting the application.</p>
    <p>Check the log file at: ${logPath}</p>
  </body>
  </html>
  `);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Handle shutdown
app.on('before-quit', () => {
  if (db) {
    db.close();
  }
  
  console.log('Application shutting down');
});