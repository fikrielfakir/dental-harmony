import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Patient, 
  Appointment, 
  Staff, 
  ClinicalNote, 
  Invoice, 
  Prescription 
} from '@/types';
import { mockPatients, mockStaff, mockAppointments } from '@/data/mockData';

interface AppState {
  // Data
  patients: Patient[];
  appointments: Appointment[];
  staff: Staff[];
  clinicalNotes: ClinicalNote[];
  invoices: Invoice[];
  prescriptions: Prescription[];
  
  // UI State
  sidebarCollapsed: boolean;
  currentUser: Staff | null;
  
  // Actions - Patients
  addPatient: (patient: Patient) => void;
  updatePatient: (id: string, patient: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  
  // Actions - Appointments
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  
  // Actions - Staff
  addStaff: (staff: Staff) => void;
  updateStaff: (id: string, staff: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;
  
  // Actions - Clinical Notes
  addClinicalNote: (note: ClinicalNote) => void;
  updateClinicalNote: (id: string, note: Partial<ClinicalNote>) => void;
  deleteClinicalNote: (id: string) => void;
  
  // Actions - Invoices
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  
  // Actions - Prescriptions
  addPrescription: (prescription: Prescription) => void;
  updatePrescription: (id: string, prescription: Partial<Prescription>) => void;
  deletePrescription: (id: string) => void;
  
  // Actions - UI
  toggleSidebar: () => void;
  setCurrentUser: (user: Staff | null) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial data
      patients: mockPatients,
      appointments: mockAppointments,
      staff: mockStaff,
      clinicalNotes: [],
      invoices: [],
      prescriptions: [],
      
      // UI State
      sidebarCollapsed: false,
      currentUser: mockStaff[0], // Default to first dentist
      
      // Patient actions
      addPatient: (patient) =>
        set((state) => ({ patients: [...state.patients, patient] })),
      updatePatient: (id, updates) =>
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        })),
      deletePatient: (id) =>
        set((state) => ({ patients: state.patients.filter((p) => p.id !== id) })),
      
      // Appointment actions
      addAppointment: (appointment) =>
        set((state) => ({ appointments: [...state.appointments, appointment] })),
      updateAppointment: (id, updates) =>
        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
          ),
        })),
      deleteAppointment: (id) =>
        set((state) => ({ appointments: state.appointments.filter((a) => a.id !== id) })),
      
      // Staff actions
      addStaff: (staff) =>
        set((state) => ({ staff: [...state.staff, staff] })),
      updateStaff: (id, updates) =>
        set((state) => ({
          staff: state.staff.map((s) =>
            s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
          ),
        })),
      deleteStaff: (id) =>
        set((state) => ({ staff: state.staff.filter((s) => s.id !== id) })),
      
      // Clinical note actions
      addClinicalNote: (note) =>
        set((state) => ({ clinicalNotes: [...state.clinicalNotes, note] })),
      updateClinicalNote: (id, updates) =>
        set((state) => ({
          clinicalNotes: state.clinicalNotes.map((n) =>
            n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
          ),
        })),
      deleteClinicalNote: (id) =>
        set((state) => ({ clinicalNotes: state.clinicalNotes.filter((n) => n.id !== id) })),
      
      // Invoice actions
      addInvoice: (invoice) =>
        set((state) => ({ invoices: [...state.invoices, invoice] })),
      updateInvoice: (id, updates) =>
        set((state) => ({
          invoices: state.invoices.map((i) =>
            i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i
          ),
        })),
      deleteInvoice: (id) =>
        set((state) => ({ invoices: state.invoices.filter((i) => i.id !== id) })),
      
      // Prescription actions
      addPrescription: (prescription) =>
        set((state) => ({ prescriptions: [...state.prescriptions, prescription] })),
      updatePrescription: (id, updates) =>
        set((state) => ({
          prescriptions: state.prescriptions.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),
      deletePrescription: (id) =>
        set((state) => ({ prescriptions: state.prescriptions.filter((p) => p.id !== id) })),
      
      // UI actions
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setCurrentUser: (user) =>
        set({ currentUser: user }),
    }),
    {
      name: 'dental-practice-storage',
      partialize: (state) => ({
        patients: state.patients,
        appointments: state.appointments,
        staff: state.staff,
        clinicalNotes: state.clinicalNotes,
        invoices: state.invoices,
        prescriptions: state.prescriptions,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
