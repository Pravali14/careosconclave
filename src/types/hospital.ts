export type UserRole =
  | 'super_admin'
  | 'hospital_admin'
  | 'receptionist'
  | 'doctor'
  | 'nurse'
  | 'radiology'
  | 'laboratory'
  | 'pharmacist'
  | 'billing'
  | 'patient';

export type DepartmentType =
  | 'Cardiology'
  | 'Orthopedics'
  | 'Pediatrics'
  | 'General Medicine'
  | 'Neurology'
  | 'Radiology'
  | 'Laboratory'
  | 'Emergency'
  | 'Pharmacy';

export type QueueState =
  | 'BOOKED'
  | 'CHECKED_IN'
  | 'WAITING'
  | 'CALLED'
  | 'IN_CONSULTATION'
  | 'COMPLETED'
  | 'NO_SHOW'
  | 'CANCELLED'
  | 'DEFERRED';

export type PriorityClass =
  | 'P1_EMERGENCY'
  | 'P2_TIME_SENSITIVE'
  | 'P3_SCHEDULED'
  | 'P4_WALKIN'
  | 'P2A_ASSISTANCE';

export interface Doctor {
  id: string;
  name: string;
  department: DepartmentType;
  roomNumber: string;
  specialization: string;
  qualifications: string;
  status: 'available' | 'in_consultation' | 'on_break' | 'delayed';
  avgConsultationMinutes: number;
  delayMinutes: number;
  delayReason?: string;
  currentPatientToken?: string;
  avatarUrl?: string;
  consultationStartTime?: string;
}

export interface Patient {
  id: string;
  uhid: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  emergencyContact: string;
  bloodGroup: string;
  address: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  department: DepartmentType;
  scheduledTime: string;
  date: string;
  type: 'scheduled' | 'walkin';
  status: 'scheduled' | 'checked_in' | 'completed' | 'cancelled';
  reason: string;
}

export interface QueueEntry {
  id: string;
  token: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  department: DepartmentType;
  doctorId: string;
  doctorName: string;
  state: QueueState;
  priority: PriorityClass;
  priorityScore: number;
  checkInTime: string;
  calledTime?: string;
  consultationStartTime?: string;
  completionTime?: string;
  estimatedWaitMinutes: number;
  expectedStartTime: string;
  confidenceRange: string;
  delayReason?: string;
  isWalkIn: boolean;
  notes?: string;
  overrideHistory: Array<{
    timestamp: string;
    changedBy: string;
    fromState: QueueState;
    toState: QueueState;
    reason: string;
  }>;
}

export interface ClinicalVitals {
  bp: string;
  pulse: number;
  temperature: number;
  spo2: number;
  weight: number;
}

export interface PrescriptionItem {
  id: string;
  drugName: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  instructions: string;
  dispensed: boolean;
}

export interface Prescription {
  id: string;
  consultationId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  diagnosis: string;
  notes: string;
  vitals: ClinicalVitals;
  medications: PrescriptionItem[];
  status: 'prescribed' | 'partially_dispensed' | 'dispensed';
  pharmacyCharge: number;
}

export interface DiagnosticOrder {
  id: string;
  orderNumber: string;
  consultationId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: 'Radiology' | 'Laboratory';
  testName: string;
  urgency: 'routine' | 'urgent' | 'stat';
  status: 'ordered' | 'sample_collected' | 'processing' | 'completed' | 'cancelled';
  orderedAt: string;
  completedAt?: string;
  findings?: string;
  impression?: string;
  verifiedBy?: string;
  cost: number;
  billed: boolean;
  scanImageUrl?: string;
  fileAttachmentName?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  department: string;
  amount: number;
  referenceId?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  status: 'unpaid' | 'partially_paid' | 'paid';
  paymentMethod?: 'Cash' | 'UPI/QR' | 'Credit/Debit Card' | 'Insurance';
  insuranceClaimId?: string;
  insuranceClaimStatus?: 'Pending' | 'Approved' | 'Settled';
}

export interface PharmacyItem {
  id: string;
  code: string;
  name: string;
  category: string;
  dosageForm: string;
  stockQuantity: number;
  minStockThreshold: number;
  unitPrice: number;
  batchNumber: string;
  expiryDate: string;
}

export interface HospitalBed {
  id: string;
  bedNumber: string;
  ward: 'ICU' | 'General Ward A' | 'General Ward B' | 'Day Care' | 'Post-Op';
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance';
  patientName?: string;
  patientUhid?: string;
  admittedAt?: string;
}

export interface NursingTask {
  id: string;
  patientId: string;
  patientName: string;
  bedNumber: string;
  taskType: 'vitals' | 'iv_fluid' | 'medication' | 'wound_dressing' | 'hygiene';
  description: string;
  dueTime: string;
  status: 'pending' | 'in_progress' | 'completed';
  completedBy?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  reason?: string;
}

export interface AgentActionLog {
  id: string;
  timestamp: string;
  agentName: 'Queue Agent' | 'Scheduling Agent' | 'Diagnostics Agent' | 'Billing Agent' | 'Operations Agent' | 'Voice Agent' | string;
  action: string;
  impact: string;
  status: 'executed' | 'pending_approval' | 'auto_approved' | 'completed' | 'executing' | 'verified';
}

export interface NotificationItem {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'queue' | 'clinical' | 'diagnostic' | 'billing' | 'system' | 'alert' | 'info';
  read: boolean;
}

export interface SimulationConfig {
  numDoctors: number;
  numPatients: number;
  arrivalPattern: 'uniform' | 'morning_peak' | 'bimodal';
  avgConsultationMin: number;
  varianceMin: number;
  walkInRate: number; // 0 to 1
  priorityRate: number; // 0 to 1
  doctorDelayRate: number; // 0 to 1
}

export interface SimulationResult {
  scenarioName: string;
  totalPatients: number;
  completedPatients: number;
  baseline: {
    avgWaitMin: number;
    medianWaitMin: number;
    p90WaitMin: number;
    doctorUtilizationPercent: number;
    patientSatisfactionScore: number;
    unpredictabilityErrorMin: number;
  };
  careQueue: {
    avgWaitMin: number;
    medianWaitMin: number;
    p90WaitMin: number;
    doctorUtilizationPercent: number;
    patientSatisfactionScore: number;
    unpredictabilityErrorMin: number;
    overridesHandled: number;
    waitTimeReductionPercent: number;
  };
  timelineData: Array<{
    timeSlot: string;
    baselineQueue: number;
    careQueuePredictive: number;
    activeConsultations: number;
  }>;
}
