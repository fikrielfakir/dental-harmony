const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
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
