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
  MedicalService,
  DentalChartEntry,
  Payment,
  PaymentStatus,
  PracticeSettings
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
  dentalChart: DentalChartEntry[];
  settings: PracticeSettings;
  
  // UI State
  sidebarCollapsed: boolean;
  currentUser: Staff | null;
  
  // Actions - Settings
  updateSettings: (settings: Partial<PracticeSettings>) => void;
  
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
  recordPayment: (invoiceId: string, payment: Omit<Payment, 'id' | 'invoiceId' | 'paymentDate' | 'remainingBalance'>) => void;
  generateInvoiceFromAppointment: (appointmentId: string) => void;
  
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
  
  // Actions - Dental Chart
  addDentalChartEntry: (entry: DentalChartEntry) => void;
  updateDentalChartEntry: (id: string, entry: Partial<DentalChartEntry>) => void;
  deleteDentalChartEntry: (id: string) => void;
  
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
      dentalChart: [],
      settings: {
        name: "DentalCare Clinic",
        taxId: "1234567890",
        address: "123 Medical Plaza, Suite 100",
        email: "info@dentalcare.com",
        phone: "(555) 123-4567",
        language: "en",
        businessHours: [
          { day: "Monday", open: "09:00", close: "17:00", isOpen: true },
          { day: "Tuesday", open: "09:00", close: "17:00", isOpen: true },
          { day: "Wednesday", open: "09:00", close: "17:00", isOpen: true },
          { day: "Thursday", open: "09:00", close: "17:00", isOpen: true },
          { day: "Friday", open: "09:00", close: "17:00", isOpen: true },
        ],
        billing: {
          currency: "MAD",
          automaticInvoicing: true,
        },
        notifications: {
          appointmentReminders: true,
          followUpEmails: false,
        }
      },
      
      // UI State
      sidebarCollapsed: false,
      currentUser: mockStaff[0], // Default to first dentist
      
      // Settings actions
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        })),
        
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
      
      recordPayment: (invoiceId, paymentData) =>
        set((state) => {
          const invoice = state.invoices.find((i) => i.id === invoiceId);
          if (!invoice) return state;

          const paymentAmount = paymentData.amount;
          const totalPaid = (invoice.paidAmount || 0) + paymentAmount;
          const remaining = invoice.totalAmount - totalPaid;
          
          const newPayment: Payment = {
            ...paymentData,
            id: crypto.randomUUID(),
            invoiceId,
            patientId: invoice.patientId,
            paymentDate: new Date().toISOString(),
            paymentNumber: `PAY-${new Date().getTime()}`,
            status: 'completed'
          };

          let newStatus: PaymentStatus = invoice.paymentStatus;
          if (totalPaid === 0) {
            newStatus = 'unpaid';
          } else if (remaining <= 0) {
            newStatus = remaining < 0 ? 'overpaid' : 'paid';
          } else {
            newStatus = 'partial';
          }

          const creditNotes = [...(invoice.creditNotes || [])];
          if (remaining < 0) {
            creditNotes.push({
              id: crypto.randomUUID(),
              invoiceId,
              amount: Math.abs(remaining),
              reason: 'Overpayment',
              status: 'active',
              createdAt: new Date().toISOString(),
            });
          }

          const updatedInvoices = state.invoices.map((i) =>
            i.id === invoiceId
              ? {
                  ...i,
                  payments: [...i.payments, newPayment],
                  paidAmount: totalPaid,
                  balanceDue: Math.max(0, remaining),
                  paymentStatus: newStatus,
                  remainingBalance: Math.max(0, remaining), // Support legacy field
                  creditNotes,
                  updatedAt: new Date().toISOString(),
                }
              : i
          );

          return { invoices: updatedInvoices };
        }),

      generateInvoiceFromAppointment: (appointmentId) =>
        set((state) => {
          const appointment = state.appointments.find((a) => a.id === appointmentId);
          if (!appointment || (appointment.status !== 'completed' && appointment.status !== 'confirmed')) return state;

          const service = state.services.find(s => s.name.toLowerCase().includes(appointment.appointmentType.toLowerCase())) || state.services[0];
          
          const invoiceNumber = `INV-${new Date().getFullYear()}-${String(state.invoices.length + 1).padStart(3, '0')}`;
          const newInvoice: Invoice = {
            id: crypto.randomUUID(),
            patientId: appointment.patientId,
            invoiceNumber,
            invoiceDate: new Date().toISOString(),
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            items: [{
              id: crypto.randomUUID(),
              description: `${appointment.appointmentType.charAt(0).toUpperCase() + appointment.appointmentType.slice(1)} Procedure`,
              quantity: 1,
              unitPrice: service.price,
              total: service.price,
            }],
            totalAmount: service.price,
            paidAmount: 0,
            balanceDue: service.price,
            paymentStatus: 'unpaid',
            remainingBalance: service.price,
            payments: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            appointmentId: appointment.id,
          };

          return { invoices: [...state.invoices, newInvoice] };
        }),
      
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
      
      // Dental Chart actions
      addDentalChartEntry: (entry) =>
        set((state) => ({ dentalChart: [...state.dentalChart, entry] })),
      updateDentalChartEntry: (id, updates) =>
        set((state) => ({
          dentalChart: state.dentalChart.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        })),
      deleteDentalChartEntry: (id) =>
        set((state) => ({ dentalChart: state.dentalChart.filter((e) => e.id !== id) })),
      
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
        dentalChart: state.dentalChart,
        sidebarCollapsed: state.sidebarCollapsed,
        settings: state.settings,
      }),
    }
  )
);