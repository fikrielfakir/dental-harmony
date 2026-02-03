declare global {
  interface Window {
    electronAPI?: {
      getPatients: () => Promise<any>;
      addPatient: (patient: any) => Promise<any>;
      getAppointments: () => Promise<any>;
      backupDatabase: () => Promise<{success: boolean; message?: string; backupPath?: string; fileName?: string}>;
      listBackups: () => Promise<{success: boolean; backups: any[]; message?: string}>;
      restoreBackup: (backupPath: string) => Promise<{success: boolean; message: string}>;
      deleteBackup: (backupName: string) => Promise<{success: boolean; message: string}>;
      exportBackup: (backupPath: string) => Promise<{success: boolean; message: string; exportPath?: string}>;
    };
  }
}

export {};
