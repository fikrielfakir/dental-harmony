const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getPatients: () => ipcRenderer.invoke('get-patients'),
  addPatient: (patient) => ipcRenderer.invoke('add-patient', patient),
  getAppointments: () => ipcRenderer.invoke('get-appointments'),
  // Backup functions
  backupDatabase: () => ipcRenderer.invoke('backup-database'),
  listBackups: () => ipcRenderer.invoke('list-backups'),
  restoreBackup: (backupPath) => ipcRenderer.invoke('restore-backup', backupPath),
  deleteBackup: (backupName) => ipcRenderer.invoke('delete-backup', backupName),
  exportBackup: (backupPath) => ipcRenderer.invoke('export-backup', backupPath)
});
