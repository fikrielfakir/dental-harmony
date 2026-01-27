import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Patient, 
  Appointment, 
  Staff, 
  ClinicalNote, 
  Invoice, 
  Prescription,
  Quotation,
  MedicalService
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
  quotations: Quotation[];
  services: MedicalService[];
  
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

  // Actions - Quotations
  addQuotation: (quotation: Quotation) => void;
  updateQuotation: (id: string, quotation: Partial<Quotation>) => void;
  deleteQuotation: (id: string) => void;

  // Actions - Services
  addService: (service: MedicalService) => void;
  updateService: (id: string, service: Partial<MedicalService>) => void;
  deleteService: (id: string) => void;
  
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
      quotations: [],
      services: [
        { id: '1', name: 'General Consultation', code: 'CONS-01', price: 50, category: 'General' },
        { id: '2', name: 'Professional Cleaning', code: 'CLEAN-01', price: 80, category: 'Hygiene' },
        { id: '3', name: 'Composite Filling', code: 'FILL-01', price: 150, category: 'Restorative' },
        { id: '4', name: 'Root Canal Therapy', code: 'ROOT-01', price: 600, category: 'Endodontics' },
      ],
      
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

      // Quotation actions
      addQuotation: (quotation) =>
        set((state) => ({ quotations: [...state.quotations, quotation] })),
      updateQuotation: (id, updates) =>
        set((state) => ({
          quotations: state.quotations.map((q) =>
            q.id === id ? { ...q, ...updates, updatedAt: new Date().toISOString() } : q
          ),
        })),
      deleteQuotation: (id) =>
        set((state) => ({ quotations: state.quotations.filter((q) => q.id !== id) })),

      // Service actions
      addService: (service) =>
        set((state) => ({ services: [...state.services, service] })),
      updateService: (id, updates) =>
        set((state) => ({
          services: state.services.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),
      deleteService: (id) =>
        set((state) => ({ services: state.services.filter((s) => s.id !== id) })),
      
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
        quotations: state.quotations,
        services: state.services,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);