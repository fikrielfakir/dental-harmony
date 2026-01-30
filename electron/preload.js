const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getPatients: () => ipcRenderer.invoke('get-patients'),
  addPatient: (patient) => ipcRenderer.invoke('add-patient', patient),
  getAppointments: () => ipcRenderer.invoke('get-appointments'),
});
