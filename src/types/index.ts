// Patient types
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  address: string;
  socialSecurityNumber?: string;
  insuranceProvider?: string;
  policyNumber?: string;
  medicalHistory: MedicalHistory;
  allergies: string[];
  medications: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalHistory {
  conditions: string[];
  surgeries: string[];
  familyHistory: string[];
}

// Appointment types
export interface Appointment {
  id: string;
  patientId: string;
  patient?: Patient;
  practitionerId: string;
  practitioner?: Staff;
  appointmentType: AppointmentType;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string;
  treatment?: Treatment;
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentType = 
  | 'consultation'
  | 'cleaning'
  | 'filling'
  | 'extraction'
  | 'root-canal'
  | 'crown'
  | 'checkup'
  | 'emergency'
  | 'whitening'
  | 'other';

export type AppointmentStatus = 
  | 'scheduled'
  | 'confirmed'
  | 'in-progress'
  | 'completed'
  | 'cancelled'
  | 'no-show';

export interface Treatment {
  procedures: string[];
  teethInvolved: number[];
  notes: string;
}

// Staff types
export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: StaffRole;
  specialization?: string;
  licenseNumber?: string;
  certificationDate?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export type StaffRole = 
  | 'admin'
  | 'dentist'
  | 'hygienist'
  | 'assistant'
  | 'receptionist';

// Clinical notes types
export interface ClinicalNote {
  id: string;
  patientId: string;
  appointmentId?: string;
  practitionerId: string;
  practitioner?: Staff;
  diagnosis: string;
  treatmentPlan: TreatmentPlan;
  notes: string;
  teethStatus: ToothRecord[];
  attachments: Attachment[];
  signature?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TreatmentPlan {
  procedures: PlannedProcedure[];
  estimatedCost: number;
  estimatedDuration: string;
}

export interface PlannedProcedure {
  name: string;
  tooth?: number;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: 'planned' | 'in-progress' | 'completed';
}

export interface ToothRecord {
  fdiNumber: number;
  status: ToothStatus;
  treatments: string[];
  notes?: string;
}

export type ToothStatus = 
  | 'healthy'
  | 'cavity'
  | 'filling'
  | 'crown'
  | 'extraction'
  | 'root-canal'
  | 'bridge'
  | 'implant'
  | 'missing';

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'radiograph' | 'document';
  url: string;
  uploadedAt: string;
}

// Invoice types
export interface Invoice {
  id: string;
  patientId: string;
  patient?: Patient;
  invoiceNumber: string;
  items: InvoiceItem[];
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  paymentStatus: PaymentStatus;
  remainingBalance?: number;
  payments: Payment[];
  invoiceDate: string;
  dueDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  insuranceClaim?: InsuranceClaim;
  appointmentId?: string; // Link to procedure
  creditNotes?: CreditNote[];
}

export interface InvoiceItem {
  id: string;
  serviceId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  tooth?: number;
}

export type PaymentStatus = 
  | 'pending'
  | 'partial'
  | 'paid'
  | 'overdue'
  | 'overpaid';

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  notes?: string;
  remainingBalance?: number;
}

export interface CreditNote {
  id: string;
  invoiceId: string;
  amount: number;
  reason: string;
  status: 'active' | 'used' | 'cancelled';
  createdAt: string;
}

export type PaymentMethod = 
  | 'cash'
  | 'card'
  | 'check'
  | 'transfer'
  | 'insurance';

// Quotation types
export interface Quotation {
  id: string;
  patientId: string;
  patient?: Patient;
  quotationNumber: string;
  items: InvoiceItem[];
  totalAmount: number;
  status: 'draft' | 'sent' | 'accepted' | 'declined' | 'converted';
  validUntil: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Insurance types
export interface InsuranceClaim {
  id: string;
  invoiceId: string;
  provider: string;
  claimNumber: string;
  status: 'draft' | 'submitted' | 'processing' | 'paid' | 'rejected';
  reimbursementAmount?: number;
  submittedAt?: string;
  processedAt?: string;
}

// Service Catalog
export interface MedicalService {
  id: string;
  name: string;
  code: string;
  price: number;
  category: string;
}

// Prescription types
export interface Prescription {
  id: string;
  patientId: string;
  patient?: Patient;
  practitionerId: string;
  practitioner?: Staff;
  appointmentId?: string;
  medications: PrescriptionMedication[];
  instructions: string;
  createdDate: string;
  expiryDate: string;
  status: PrescriptionStatus;
}

export interface PrescriptionMedication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
}

export type PrescriptionStatus = 
  | 'active'
  | 'dispensed'
  | 'expired';

// Dashboard types
export interface DashboardStats {
  todayAppointments: number;
  todayRevenue: number;
  monthlyRevenue: number;
  totalPatients: number;
  pendingInvoices: number;
  upcomingAppointments: Appointment[];
}
