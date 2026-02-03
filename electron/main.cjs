const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = require('electron-is-dev');
const Database = require('better-sqlite3');

let mainWindow;
let db;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
  });

  mainWindow.loadURL(
    isDev
      ? 'http://localhost:5000'
      : `file://${path.join(__dirname, '../dist/index.html')}`
  );

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => (mainWindow = null));
}

// Initialize Database
function initDb() {
  const dbPath = path.join(app.getPath('userData'), 'database.db');
  db = new Database(dbPath, { verbose: console.log });
  
  // Create tables for the Dental Practice Management System
  db.exec(`
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      firstName TEXT,
      lastName TEXT,
      email TEXT,
      phone TEXT,
      dateOfBirth TEXT,
      gender TEXT,
      address TEXT,
      medicalHistory TEXT,
      allergies TEXT,
      medications TEXT,
      status TEXT,
      lastVisit TEXT,
      nextVisit TEXT,
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      patientId TEXT,
      patientName TEXT,
      dentistId TEXT,
      dentistName TEXT,
      date TEXT,
      startTime TEXT,
      endTime TEXT,
      status TEXT,
      type TEXT,
      notes TEXT,
      createdAt TEXT
    );
  `);
}

ipcMain.handle('get-patients', () => {
  return db.prepare('SELECT * FROM patients').all();
});

ipcMain.handle('add-patient', (event, patient) => {
  const stmt = db.prepare(`
    INSERT INTO patients (id, firstName, lastName, email, phone, dateOfBirth, gender, address, medicalHistory, allergies, medications, status, lastVisit, nextVisit, createdAt)
    VALUES (@id, @firstName, @lastName, @email, @phone, @dateOfBirth, @gender, @address, @medicalHistory, @allergies, @medications, @status, @lastVisit, @nextVisit, @createdAt)
  `);
  return stmt.run(patient);
});

// Backup functionality
const getBackupDir = () => {
  const backupDir = path.join(app.getPath('userData'), 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  return backupDir;
};

const getDbPath = () => path.join(app.getPath('userData'), 'database.db');

ipcMain.handle('backup-database', async () => {
  try {
    const backupDir = getBackupDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T').join('_').split('.')[0];
    const backupFileName = `database-backup-${timestamp}.db`;
    const backupPath = path.join(backupDir, backupFileName);
    const dbPath = getDbPath();

    // Close database connection for safe copy
    if (db) {
      db.close();
    }

    // Copy database file
    fs.copyFileSync(dbPath, backupPath);

    // Reopen database
    db = new Database(dbPath, { verbose: console.log });

    // Clean up old backups (keep last 10)
    const backups = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('database-backup-') && file.endsWith('.db'))
      .map(file => ({
        name: file,
        path: path.join(backupDir, file),
        time: fs.statSync(path.join(backupDir, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

    if (backups.length > 10) {
      backups.slice(10).forEach(backup => {
        fs.unlinkSync(backup.path);
      });
    }

    return {
      success: true,
      backupPath,
      fileName: backupFileName,
      message: 'Backup created successfully'
    };
  } catch (error) {
    console.error('Backup error:', error);
    
    // Reopen database if it was closed
    if (!db) {
      const dbPath = getDbPath();
      db = new Database(dbPath, { verbose: console.log });
    }
    
    return {
      success: false,
      message: `Backup failed: ${error.message}`
    };
  }
});

ipcMain.handle('list-backups', async () => {
  try {
    const backupDir = getBackupDir();
    
    const backups = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('database-backup-') && file.endsWith('.db'))
      .map(file => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          path: filePath,
          size: stats.size,
          date: stats.mtime,
          formattedSize: (stats.size / 1024).toFixed(2) + ' KB'
        };
      })
      .sort((a, b) => b.date - a.date);

    return { success: true, backups };
  } catch (error) {
    console.error('List backups error:', error);
    return { success: false, backups: [], message: error.message };
  }
});

ipcMain.handle('restore-backup', async (event, backupPath) => {
  try {
    if (!fs.existsSync(backupPath)) {
      return { success: false, message: 'Backup file not found' };
    }

    const dbPath = getDbPath();
    
    // Create a safety backup before restoring
    const safetyBackupPath = path.join(getBackupDir(), `database-before-restore-${Date.now()}.db`);
    if (db) {
      db.close();
    }
    fs.copyFileSync(dbPath, safetyBackupPath);

    // Restore from backup
    fs.copyFileSync(backupPath, dbPath);

    // Reopen database
    db = new Database(dbPath, { verbose: console.log });

    return {
      success: true,
      message: 'Database restored successfully. Please restart the application for changes to take effect.'
    };
  } catch (error) {
    console.error('Restore error:', error);
    
    // Try to reopen database
    if (!db) {
      const dbPath = getDbPath();
      db = new Database(dbPath, { verbose: console.log });
    }
    
    return {
      success: false,
      message: `Restore failed: ${error.message}`
    };
  }
});

ipcMain.handle('delete-backup', async (event, backupName) => {
  try {
    const backupPath = path.join(getBackupDir(), backupName);
    
    if (!fs.existsSync(backupPath)) {
      return { success: false, message: 'Backup file not found' };
    }

    fs.unlinkSync(backupPath);

    return { success: true, message: 'Backup deleted successfully' };
  } catch (error) {
    console.error('Delete backup error:', error);
    return { success: false, message: `Delete failed: ${error.message}` };
  }
});

ipcMain.handle('export-backup', async (event, backupPath) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Export Backup',
      defaultPath: path.basename(backupPath),
      filters: [
        { name: 'Database Files', extensions: ['db'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (result.canceled || !result.filePath) {
      return { success: false, message: 'Export cancelled' };
    }

    fs.copyFileSync(backupPath, result.filePath);

    return {
      success: true,
      message: 'Backup exported successfully',
      exportPath: result.filePath
    };
  } catch (error) {
    console.error('Export backup error:', error);
    return { success: false, message: `Export failed: ${error.message}` };
  }
});


// App lifecycle
app.on('ready', () => {
  initDb();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
