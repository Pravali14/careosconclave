import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  UserRole,
  Doctor,
  Patient,
  Appointment,
  QueueEntry,
  QueueState,
  PriorityClass,
  Prescription,
  DiagnosticOrder,
  Invoice,
  PharmacyItem,
  HospitalBed,
  NursingTask,
  AuditLogEntry,
  AgentActionLog,
  NotificationItem,
} from '../types/hospital';
import {
  INITIAL_DOCTORS,
  INITIAL_PATIENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_QUEUE_ENTRIES,
  INITIAL_PRESCRIPTIONS,
  INITIAL_DIAGNOSTIC_ORDERS,
  INITIAL_INVOICES,
  INITIAL_PHARMACY_INVENTORY,
  INITIAL_BEDS,
  INITIAL_NURSING_TASKS,
  INITIAL_AUDIT_LOGS,
  INITIAL_AGENT_LOGS,
} from '../data/initialData';
import { recalculateQueueEstimates, PRIORITY_WEIGHTS } from './queueEngine';

interface CareOSContextType {
  // Current session & navigation
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeDoctorId: string;
  setActiveDoctorId: (id: string) => void;
  activePatientId: string;
  setActivePatientId: (id: string) => void;
  currentTime: string;
  setCurrentTime: (time: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;

  // Domain states
  doctors: Doctor[];
  patients: Patient[];
  appointments: Appointment[];
  queueEntries: QueueEntry[];
  prescriptions: Prescription[];
  diagnosticOrders: DiagnosticOrder[];
  invoices: Invoice[];
  pharmacyItems: PharmacyItem[];
  beds: HospitalBed[];
  nursingTasks: NursingTask[];
  auditLogs: AuditLogEntry[];
  agentLogs: AgentActionLog[];
  notifications: NotificationItem[];

  // Action methods
  registerPatient: (data: Omit<Patient, 'id' | 'uhid' | 'createdAt'>) => Patient;
  bookAppointment: (data: {
    patientId: string;
    doctorId: string;
    scheduledTime: string;
    date: string;
    type: 'scheduled' | 'walkin';
    reason: string;
  }) => { success: boolean; appointment?: Appointment; error?: string };
  checkInPatient: (
    appointmentId: string,
    priority?: PriorityClass,
    isWalkIn?: boolean
  ) => QueueEntry;
  callNextPatient: (doctorId: string) => QueueEntry | null;
  startConsultation: (queueId: string) => void;
  completeConsultation: (
    queueId: string,
    clinicalData: {
      diagnosis: string;
      notes: string;
      vitals: { bp: string; pulse: number; temperature: number; spo2: number; weight: number };
      medications: Array<{
        drugName: string;
        dosage: string;
        frequency: string;
        duration: string;
        route: string;
        instructions: string;
      }>;
      diagnosticOrders?: Array<{
        department: 'Radiology' | 'Laboratory';
        testName: string;
        urgency: 'routine' | 'urgent' | 'stat';
        cost: number;
      }>;
    }
  ) => void;
  declareDoctorDelay: (doctorId: string, delayMinutes: number, reason: string) => void;
  applyManualOverride: (
    queueId: string,
    toState: QueueState,
    reason: string,
    newDoctorId?: string,
    newPriority?: PriorityClass
  ) => void;
  fulfillDiagnosticOrder: (
    orderId: string,
    findings: string,
    impression: string,
    verifiedBy: string,
    scanImageUrl?: string,
    fileAttachmentName?: string
  ) => void;
  createInvoice: (data: {
    patientId: string;
    items: Array<{ description: string; department: string; amount: number; referenceId?: string }>;
    paymentMethod?: 'Cash' | 'UPI/QR' | 'Credit/Debit Card' | 'Insurance';
    markPaid?: boolean;
    discount?: number;
  }) => Invoice;
  loginPatientByPhone: (phone: string, password: string) => { success: boolean; patient?: Patient; error?: string };
  dispenseMedication: (prescriptionId: string, medicationId: string) => void;
  recordPayment: (
    invoiceId: string,
    amount: number,
    paymentMethod: 'Cash' | 'UPI/QR' | 'Credit/Debit Card' | 'Insurance'
  ) => void;
  addNursingTask: (task: Omit<NursingTask, 'id' | 'status'>) => void;
  completeNursingTask: (taskId: string, nurseName: string) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  resetDemoData: () => void;
  playAnnouncementChime: (text: string) => void;
  addNotification: (title: string, message: string, severity?: 'info' | 'warning' | 'alert') => void;
  addAgentLog: (agentName: string, action: string, impact: string, status?: 'completed' | 'verified' | 'executing') => void;
  addAuditLog: (action: string, targetId: string, details: string, reason?: string) => void;
  updateBedStatus: (bedId: string, status: HospitalBed['status'], patientName?: string, uhid?: string) => void;
  rebalanceQueueBetweenDoctors: (fromDoctorId: string, toDoctorId: string, maxTokensToMove?: number) => number;
}

const CareOSContext = createContext<CareOSContextType | undefined>(undefined);

export const CareOSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('hospital_admin');
  const [activeDoctorId, setActiveDoctorId] = useState<string>('doc-1');
  const [activePatientId, setActivePatientId] = useState<string>('pat-1');
  const [currentTime, setCurrentTime] = useState<string>('09:30 AM');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Entities state
  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    const saved = localStorage.getItem('careos_doctors');
    return saved ? JSON.parse(saved) : INITIAL_DOCTORS;
  });

  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('careos_patients');
    return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('careos_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [queueEntries, setQueueEntries] = useState<QueueEntry[]>(() => {
    const saved = localStorage.getItem('careos_queue');
    return saved ? JSON.parse(saved) : INITIAL_QUEUE_ENTRIES;
  });

  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => {
    const saved = localStorage.getItem('careos_prescriptions');
    return saved ? JSON.parse(saved) : INITIAL_PRESCRIPTIONS;
  });

  const [diagnosticOrders, setDiagnosticOrders] = useState<DiagnosticOrder[]>(() => {
    const saved = localStorage.getItem('careos_diagnostics');
    return saved ? JSON.parse(saved) : INITIAL_DIAGNOSTIC_ORDERS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('careos_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [pharmacyItems, setPharmacyItems] = useState<PharmacyItem[]>(() => {
    const saved = localStorage.getItem('careos_pharmacy');
    return saved ? JSON.parse(saved) : INITIAL_PHARMACY_INVENTORY;
  });

  const [beds, setBeds] = useState<HospitalBed[]>(() => {
    const saved = localStorage.getItem('careos_beds');
    return saved ? JSON.parse(saved) : INITIAL_BEDS;
  });

  const [nursingTasks, setNursingTasks] = useState<NursingTask[]>(() => {
    const saved = localStorage.getItem('careos_nursing');
    return saved ? JSON.parse(saved) : INITIAL_NURSING_TASKS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem('careos_audit');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [agentLogs, setAgentLogs] = useState<AgentActionLog[]>(() => {
    const saved = localStorage.getItem('careos_agent');
    return saved ? JSON.parse(saved) : INITIAL_AGENT_LOGS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      timestamp: '09:20 AM',
      title: 'Queue Delay Alert',
      message: 'Dr. K. V. Rao delayed by 15 mins due to emergency trauma call in Minor OT. CareQueue recalculated ETAs for all waiting patients.',
      type: 'queue',
      read: false,
    },
    {
      id: 'notif-2',
      timestamp: '09:22 AM',
      title: 'Diagnostic Report Ready',
      message: 'Chest X-Ray PA View finalized for Rajesh Kumar Naidu by Dr. Vikramaditya Mehta.',
      type: 'diagnostic',
      read: false,
    },
  ]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('careos_doctors', JSON.stringify(doctors));
  }, [doctors]);

  useEffect(() => {
    localStorage.setItem('careos_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('careos_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('careos_queue', JSON.stringify(queueEntries));
  }, [queueEntries]);

  useEffect(() => {
    localStorage.setItem('careos_prescriptions', JSON.stringify(prescriptions));
  }, [prescriptions]);

  useEffect(() => {
    localStorage.setItem('careos_diagnostics', JSON.stringify(diagnosticOrders));
  }, [diagnosticOrders]);

  useEffect(() => {
    localStorage.setItem('careos_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('careos_pharmacy', JSON.stringify(pharmacyItems));
  }, [pharmacyItems]);

  useEffect(() => {
    localStorage.setItem('careos_beds', JSON.stringify(beds));
  }, [beds]);

  useEffect(() => {
    localStorage.setItem('careos_nursing', JSON.stringify(nursingTasks));
  }, [nursingTasks]);

  useEffect(() => {
    localStorage.setItem('careos_audit', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('careos_agent', JSON.stringify(agentLogs));
  }, [agentLogs]);

  // Audio chime & speech announcement
  const playAnnouncementChime = (text: string) => {
    if (!soundEnabled) return;

    try {
      // Audio synthesis chime via Web Audio API
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880.0, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }

      // Voice synthesis announcement
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.05;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      // Audio playback quiet failover
    }
  };

  // 1. Patient Registration
  const registerPatient = (data: Omit<Patient, 'id' | 'uhid' | 'createdAt'>): Patient => {
    const nextIdNum = patients.length + 1;
    const uhid = `UHID-CAREOS-2026-${String(1000 + nextIdNum).padStart(4, '0')}`;
    const newPatient: Patient = {
      ...data,
      id: `pat-${Date.now()}`,
      uhid,
      createdAt: new Date().toISOString(),
    };

    setPatients((prev) => [newPatient, ...prev]);

    // Audit log
    const audit: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp: currentTime,
      userId: 'usr-rec',
      userName: 'CareOS Reception Desk',
      role: 'receptionist',
      action: 'PATIENT_REGISTERED',
      targetType: 'Patient',
      targetId: uhid,
      details: `Registered ${newPatient.name} (Age: ${newPatient.age}, ${newPatient.gender}) with contact ${newPatient.phone}`,
    };
    setAuditLogs((prev) => [audit, ...prev]);

    return newPatient;
  };

  // 2. Appointment Booking (with Conflict Prevention)
  const bookAppointment = (data: {
    patientId: string;
    doctorId: string;
    scheduledTime: string;
    date: string;
    type: 'scheduled' | 'walkin';
    reason: string;
  }) => {
    const patient = patients.find((p) => p.id === data.patientId);
    const doctor = doctors.find((d) => d.id === data.doctorId);

    if (!patient || !doctor) {
      return { success: false, error: 'Patient or Doctor not found' };
    }

    // Double-booking check: same doctor and same time on same date
    const conflicting = appointments.find(
      (a) =>
        a.doctorId === data.doctorId &&
        a.date === data.date &&
        a.scheduledTime === data.scheduledTime &&
        a.status !== 'cancelled'
    );

    if (conflicting && data.type === 'scheduled') {
      return {
        success: false,
        error: `Conflict detected: Dr. ${doctor.name} already has an appointment booked at ${data.scheduledTime}. Please choose an alternative slot or book as walk-in.`,
      };
    }

    const aptSeq = 100 + appointments.length + 1;
    const newAppointment: Appointment = {
      id: `CAREOS-APT-2026-${String(aptSeq).padStart(4, '0')}`,
      patientId: patient.id,
      patientName: patient.name,
      patientPhone: patient.phone,
      doctorId: doctor.id,
      doctorName: doctor.name,
      department: doctor.department,
      scheduledTime: data.scheduledTime,
      date: data.date,
      type: data.type,
      status: 'scheduled',
      reason: data.reason || 'General Outpatient Consultation',
    };

    setAppointments((prev) => [newAppointment, ...prev]);

    // Audit log
    const audit: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp: currentTime,
      userId: 'usr-rec',
      userName: 'CareOS Scheduling Desk',
      role: 'receptionist',
      action: 'APPOINTMENT_BOOKED',
      targetType: 'Appointment',
      targetId: newAppointment.id,
      details: `Booked ${newAppointment.type} appointment for ${patient.name} with ${doctor.name} at ${data.scheduledTime}`,
    };
    setAuditLogs((prev) => [audit, ...prev]);

    // Agent log
    const agent: AgentActionLog = {
      id: `ag-${Date.now()}`,
      timestamp: currentTime,
      agentName: 'Scheduling Agent',
      action: `Validated schedule slot availability for ${doctor.name} at ${data.scheduledTime}`,
      impact: 'Slot confirmed without overlapping conflicts',
      status: 'auto_approved',
    };
    setAgentLogs((prev) => [agent, ...prev]);

    return { success: true, appointment: newAppointment };
  };

  // 3. Check-In Patient & Token Generation
  const checkInPatient = (
    appointmentId: string,
    priority: PriorityClass = 'P3_SCHEDULED',
    isWalkIn: boolean = false
  ): QueueEntry => {
    const apt = appointments.find((a) => a.id === appointmentId);
    if (!apt) throw new Error('Appointment not found');

    const doctor = doctors.find((d) => d.id === apt.doctorId);
    if (!doctor) throw new Error('Doctor not found');

    // Generate unique token prefix based on department
    const deptPrefix: Record<string, string> = {
      Cardiology: 'C',
      Orthopedics: 'O',
      Pediatrics: 'P',
      'General Medicine': 'G',
      Neurology: 'N',
      Radiology: 'R',
      Laboratory: 'L',
      Emergency: 'E',
    };
    const prefix = deptPrefix[apt.department] || 'Q';
    const deptExistingTokens = queueEntries.filter((q) => q.department === apt.department);
    const tokenNum = 100 + deptExistingTokens.length + 1;
    const token = `${prefix}-${tokenNum}`;

    const priorityInfo = PRIORITY_WEIGHTS[priority];

    const newQueueEntry: QueueEntry = {
      id: `q-${Date.now()}`,
      token,
      appointmentId: apt.id,
      patientId: apt.patientId,
      patientName: apt.patientName,
      patientPhone: apt.patientPhone,
      department: apt.department,
      doctorId: doctor.id,
      doctorName: doctor.name,
      state: 'WAITING',
      priority,
      priorityScore: priorityInfo.score,
      checkInTime: currentTime,
      estimatedWaitMinutes: 15,
      expectedStartTime: '09:45 AM',
      confidenceRange: '±3 mins',
      isWalkIn,
      overrideHistory: [],
    };

    // Update appointment status
    setAppointments((prev) =>
      prev.map((a) => (a.id === appointmentId ? { ...a, status: 'checked_in' } : a))
    );

    // Add to queue and trigger deterministic ETA recalculation
    setQueueEntries((prev) => {
      const updated = [newQueueEntry, ...prev];
      return recalculateQueueEstimates(doctor, updated, currentTime);
    });

    // Notify patient
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        timestamp: currentTime,
        title: `Token ${token} Issued`,
        message: `${apt.patientName} checked in for ${doctor.name} (${doctor.roomNumber}). Current estimated wait is ~15 mins.`,
        type: 'queue',
        read: false,
      },
      ...prev,
    ]);

    // Audit log
    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        timestamp: currentTime,
        userId: 'usr-rec',
        userName: 'CareOS Check-in Desk',
        role: 'receptionist',
        action: 'PATIENT_CHECKED_IN',
        targetType: 'QueueEntry',
        targetId: token,
        details: `Issued token ${token} with priority ${priorityInfo.label}`,
      },
      ...prev,
    ]);

    return newQueueEntry;
  };

  // 4. Call Next Patient
  const callNextPatient = (doctorId: string): QueueEntry | null => {
    const doctor = doctors.find((d) => d.id === doctorId);
    if (!doctor) return null;

    // Find next eligible waiting patient with highest priority score, then earliest checkin
    const waitingList = queueEntries
      .filter((q) => q.doctorId === doctorId && q.state === 'WAITING')
      .sort((a, b) => {
        if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
        return a.checkInTime.localeCompare(b.checkInTime);
      });

    if (waitingList.length === 0) return null;

    const nextPatient = waitingList[0];

    // State transition to CALLED
    setQueueEntries((prev) => {
      const updated = prev.map((q) =>
        q.id === nextPatient.id
          ? {
              ...q,
              state: 'CALLED' as QueueState,
              calledTime: currentTime,
              estimatedWaitMinutes: 1,
              confidenceRange: 'Calling Now',
            }
          : q
      );
      return recalculateQueueEstimates(doctor, updated, currentTime);
    });

    setDoctors((prev) =>
      prev.map((d) =>
        d.id === doctorId ? { ...d, currentPatientToken: nextPatient.token } : d
      )
    );

    // Audio chime & speech announcement
    playAnnouncementChime(
      `Token ${nextPatient.token}. ${nextPatient.patientName}, please proceed to ${doctor.roomNumber}, ${doctor.name}.`
    );

    // Audit log
    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        timestamp: currentTime,
        userId: doctor.id,
        userName: doctor.name,
        role: 'doctor',
        action: 'PATIENT_CALLED',
        targetType: 'QueueEntry',
        targetId: nextPatient.token,
        details: `Called ${nextPatient.patientName} into ${doctor.roomNumber}`,
      },
      ...prev,
    ]);

    return nextPatient;
  };

  // 5. Start Consultation
  const startConsultation = (queueId: string) => {
    const target = queueEntries.find((q) => q.id === queueId);
    if (!target) return;

    const doctor = doctors.find((d) => d.id === target.doctorId);

    setQueueEntries((prev) => {
      const updated = prev.map((q) =>
        q.id === queueId
          ? {
              ...q,
              state: 'IN_CONSULTATION' as QueueState,
              consultationStartTime: currentTime,
              estimatedWaitMinutes: 0,
              confidenceRange: 'Active Now',
            }
          : q
      );
      return doctor ? recalculateQueueEstimates(doctor, updated, currentTime) : updated;
    });

    setDoctors((prev) =>
      prev.map((d) =>
        d.id === target.doctorId
          ? {
              ...d,
              status: 'in_consultation',
              currentPatientToken: target.token,
              consultationStartTime: currentTime,
            }
          : d
      )
    );

    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        timestamp: currentTime,
        userId: target.doctorId,
        userName: target.doctorName,
        role: 'doctor',
        action: 'CONSULTATION_STARTED',
        targetType: 'QueueEntry',
        targetId: target.token,
        details: `Consultation started with ${target.patientName} (${target.token})`,
      },
      ...prev,
    ]);
  };

  // 6. Complete Consultation & Cross-Department Integration
  const completeConsultation = (
    queueId: string,
    clinicalData: {
      diagnosis: string;
      notes: string;
      vitals: { bp: string; pulse: number; temperature: number; spo2: number; weight: number };
      medications: Array<{
        drugName: string;
        dosage: string;
        frequency: string;
        duration: string;
        route: string;
        instructions: string;
      }>;
      diagnosticOrders?: Array<{
        department: 'Radiology' | 'Laboratory';
        testName: string;
        urgency: 'routine' | 'urgent' | 'stat';
        cost: number;
      }>;
    }
  ) => {
    const entry = queueEntries.find((q) => q.id === queueId);
    if (!entry) return;

    const doctor = doctors.find((d) => d.id === entry.doctorId);

    // 1. Update queue entry to COMPLETED
    setQueueEntries((prev) => {
      const updated = prev.map((q) =>
        q.id === queueId
          ? {
              ...q,
              state: 'COMPLETED' as QueueState,
              completionTime: currentTime,
              notes: clinicalData.diagnosis,
            }
          : q
      );
      return doctor ? recalculateQueueEstimates(doctor, updated, currentTime) : updated;
    });

    // 2. Set doctor back to available
    setDoctors((prev) =>
      prev.map((d) =>
        d.id === entry.doctorId
          ? { ...d, status: 'available', currentPatientToken: undefined }
          : d
      )
    );

    // 3. Create structured Prescription if medications present
    let prescriptionCharge = 0;
    if (clinicalData.medications && clinicalData.medications.length > 0) {
      prescriptionCharge = clinicalData.medications.length * 150; // Standard nominal medication estimate
      const newPrescription: Prescription = {
        id: `rx-${Date.now()}`,
        consultationId: queueId,
        patientId: entry.patientId,
        patientName: entry.patientName,
        doctorId: entry.doctorId,
        doctorName: entry.doctorName,
        date: '2026-10-24',
        diagnosis: clinicalData.diagnosis,
        notes: clinicalData.notes,
        vitals: clinicalData.vitals,
        medications: clinicalData.medications.map((m, idx) => ({
          ...m,
          id: `rx-item-${Date.now()}-${idx}`,
          dispensed: false,
        })),
        status: 'prescribed',
        pharmacyCharge: prescriptionCharge,
      };
      setPrescriptions((prev) => [newPrescription, ...prev]);
    }

    // 4. Create Diagnostic Orders for Radiology / Laboratory
    const newDiagOrders: DiagnosticOrder[] = [];
    if (clinicalData.diagnosticOrders && clinicalData.diagnosticOrders.length > 0) {
      clinicalData.diagnosticOrders.forEach((item, idx) => {
        const orderNum = `${item.department === 'Radiology' ? 'RAD' : 'LAB'}-2026-${String(
          100 + diagnosticOrders.length + idx + 1
        ).padStart(4, '0')}`;
        const newDiag: DiagnosticOrder = {
          id: `diag-${Date.now()}-${idx}`,
          orderNumber: orderNum,
          consultationId: queueId,
          patientId: entry.patientId,
          patientName: entry.patientName,
          doctorId: entry.doctorId,
          doctorName: entry.doctorName,
          department: item.department,
          testName: item.testName,
          urgency: item.urgency,
          status: 'ordered',
          orderedAt: currentTime,
          cost: item.cost,
          billed: true,
        };
        newDiagOrders.push(newDiag);
      });
      setDiagnosticOrders((prev) => [...newDiagOrders, ...prev]);
    }

    // 5. Update or Create Centralized Billing Ledger (Invoice)
    const invoiceItems = [
      {
        id: `i-fee-${Date.now()}`,
        description: `Consultation Fee - ${entry.department} (${entry.doctorName})`,
        department: entry.department,
        amount: 600,
        referenceId: entry.appointmentId,
      },
    ];

    newDiagOrders.forEach((diag) => {
      invoiceItems.push({
        id: `i-diag-${diag.id}`,
        description: `${diag.testName} (${diag.department})`,
        department: diag.department,
        amount: diag.cost,
        referenceId: diag.id,
      });
    });

    if (prescriptionCharge > 0) {
      invoiceItems.push({
        id: `i-pharm-${Date.now()}`,
        description: `Prescribed Medications (${clinicalData.medications.length} items)`,
        department: 'Pharmacy',
        amount: prescriptionCharge,
        referenceId: `rx-${Date.now()}`,
      });
    }

    const totalBill = invoiceItems.reduce((acc, curr) => acc + curr.amount, 0);

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2026-${String(800 + invoices.length + 1).padStart(4, '0')}`,
      patientId: entry.patientId,
      patientName: entry.patientName,
      date: '2026-10-24',
      items: invoiceItems,
      subtotal: totalBill,
      tax: 0,
      totalAmount: totalBill,
      paidAmount: 0,
      status: 'unpaid',
    };
    setInvoices((prev) => [newInvoice, ...prev]);

    // 6. Notifications & Audit
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        timestamp: currentTime,
        title: 'Consultation Completed',
        message: `${entry.patientName} consultation completed. Prescriptions & orders generated; invoice ${newInvoice.invoiceNumber} posted to billing ledger.`,
        type: 'clinical',
        read: false,
      },
      ...prev,
    ]);

    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        timestamp: currentTime,
        userId: entry.doctorId,
        userName: entry.doctorName,
        role: 'doctor',
        action: 'CONSULTATION_COMPLETED',
        targetType: 'QueueEntry',
        targetId: entry.token,
        details: `Finalized diagnosis: "${clinicalData.diagnosis}". Prescribed ${clinicalData.medications.length} meds, ordered ${newDiagOrders.length} diagnostics.`,
      },
      ...prev,
    ]);

    setAgentLogs((prev) => [
      {
        id: `ag-${Date.now()}`,
        timestamp: currentTime,
        agentName: 'Billing Agent',
        action: `Generated itemized invoice ${newInvoice.invoiceNumber} for ₹${totalBill}`,
        impact: 'Aggregated consultation and ordered diagnostics with zero duplicate billing',
        status: 'auto_approved',
      },
      ...prev,
    ]);
  };

  // 7. Declare Doctor Delay (Triggers Queue Agent Recalculation)
  const declareDoctorDelay = (doctorId: string, delayMinutes: number, reason: string) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    if (!doctor) return;

    setDoctors((prev) =>
      prev.map((d) =>
        d.id === doctorId
          ? {
              ...d,
              delayMinutes,
              delayReason: reason,
              status: delayMinutes > 0 ? 'delayed' : 'available',
            }
          : d
      )
    );

    // Recalculate queue ETAs
    setQueueEntries((prev) =>
      recalculateQueueEstimates(
        { ...doctor, delayMinutes, delayReason: reason },
        prev,
        currentTime
      )
    );

    // Send notifications to waiting patients
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        timestamp: currentTime,
        title: `Doctor Delay Notice: ${doctor.name}`,
        message: `${doctor.name} announced a ${delayMinutes} min delay (${reason}). CareQueue has updated all waiting patient ETAs.`,
        type: 'queue',
        read: false,
      },
      ...prev,
    ]);

    // Audit & Agent Logs
    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        timestamp: currentTime,
        userId: doctor.id,
        userName: doctor.name,
        role: 'doctor',
        action: 'QUEUE_DELAY_DECLARED',
        targetType: 'Doctor',
        targetId: doctor.id,
        details: `Declared delay of ${delayMinutes} minutes: ${reason}`,
      },
      ...prev,
    ]);

    setAgentLogs((prev) => [
      {
        id: `ag-${Date.now()}`,
        timestamp: currentTime,
        agentName: 'Queue Agent',
        action: `Recalculated queue ETAs for ${doctor.name} following ${delayMinutes}-minute delay`,
        impact: 'Updated patient confidence intervals and informed waiting hall display',
        status: 'auto_approved',
      },
      ...prev,
    ]);
  };

  // 8. Apply Staff Manual Override (With Audit Reason)
  const applyManualOverride = (
    queueId: string,
    toState: QueueState,
    reason: string,
    newDoctorId?: string,
    newPriority?: PriorityClass
  ) => {
    const entry = queueEntries.find((q) => q.id === queueId);
    if (!entry) return;

    const fromState = entry.state;
    const targetDoctorId = newDoctorId || entry.doctorId;
    const doctor = doctors.find((d) => d.id === targetDoctorId);
    const priorityScore = newPriority ? PRIORITY_WEIGHTS[newPriority].score : entry.priorityScore;

    setQueueEntries((prev) => {
      const updated = prev.map((q) => {
        if (q.id === queueId) {
          const overrideHistory = [
            ...(q.overrideHistory || []),
            {
              timestamp: currentTime,
              changedBy: currentRole.toUpperCase(),
              fromState,
              toState,
              reason,
            },
          ];

          return {
            ...q,
            state: toState,
            doctorId: targetDoctorId,
            doctorName: doctor ? doctor.name : q.doctorName,
            department: doctor ? doctor.department : q.department,
            priority: newPriority || q.priority,
            priorityScore,
            overrideHistory,
          };
        }
        return q;
      });

      return doctor ? recalculateQueueEstimates(doctor, updated, currentTime) : updated;
    });

    // Audit log with mandatory reason
    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        timestamp: currentTime,
        userId: `usr-${currentRole}`,
        userName: `Staff (${currentRole})`,
        role: currentRole,
        action: 'QUEUE_MANUAL_OVERRIDE',
        targetType: 'QueueEntry',
        targetId: entry.token,
        details: `Overrode ${entry.token} from ${fromState} to ${toState}. Doctor: ${doctor?.name || entry.doctorName}. Priority: ${newPriority || entry.priority}`,
        reason,
      },
      ...prev,
    ]);
  };

  // 9. Fulfill Diagnostic Order (Radiology / Lab)
  const fulfillDiagnosticOrder = (
    orderId: string,
    findings: string,
    impression: string,
    verifiedBy: string,
    scanImageUrl?: string,
    fileAttachmentName?: string
  ) => {
    setDiagnosticOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              status: 'completed',
              completedAt: currentTime,
              findings,
              impression,
              verifiedBy,
              scanImageUrl: scanImageUrl || ord.scanImageUrl,
              fileAttachmentName: fileAttachmentName || ord.fileAttachmentName,
            }
          : ord
      )
    );

    const order = diagnosticOrders.find((o) => o.id === orderId);

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        timestamp: currentTime,
        title: `${order?.department || 'Diagnostic'} Report Released`,
        message: `${order?.testName} for ${order?.patientName} has been verified by ${verifiedBy} and released to Doctor & Patient portals.`,
        type: 'diagnostic',
        read: false,
      },
      ...prev,
    ]);

    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        timestamp: currentTime,
        userId: 'usr-diag',
        userName: verifiedBy,
        role: order?.department === 'Radiology' ? 'radiology' : 'laboratory',
        action: 'DIAGNOSTIC_REPORT_FINALIZED',
        targetType: 'DiagnosticOrder',
        targetId: order?.orderNumber || orderId,
        details: `Finalized and signed ${order?.testName}`,
      },
      ...prev,
    ]);
  };

  // 10. Dispense Medication (Pharmacy)
  const dispenseMedication = (prescriptionId: string, medicationId: string) => {
    setPrescriptions((prev) =>
      prev.map((rx) => {
        if (rx.id === prescriptionId) {
          const updatedMeds = rx.medications.map((m) =>
            m.id === medicationId ? { ...m, dispensed: true } : m
          );
          const allDispensed = updatedMeds.every((m) => m.dispensed);
          return {
            ...rx,
            medications: updatedMeds,
            status: allDispensed ? 'dispensed' : 'partially_dispensed',
          };
        }
        return rx;
      })
    );

    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        timestamp: currentTime,
        userId: 'usr-pharm',
        userName: 'Pharmacist Ravi',
        role: 'pharmacist',
        action: 'MEDICATION_DISPENSED',
        targetType: 'Prescription',
        targetId: prescriptionId,
        details: `Dispensed medication item ${medicationId}`,
      },
      ...prev,
    ]);
  };

  // 11. Record Billing Payment
  const recordPayment = (
    invoiceId: string,
    amount: number,
    paymentMethod: 'Cash' | 'UPI/QR' | 'Credit/Debit Card' | 'Insurance'
  ) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          const newPaid = inv.paidAmount + amount;
          const status = newPaid >= inv.totalAmount ? 'paid' : 'partially_paid';
          return {
            ...inv,
            paidAmount: newPaid,
            status,
            paymentMethod,
          };
        }
        return inv;
      })
    );

    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        timestamp: currentTime,
        userId: 'usr-bill',
        userName: 'Billing Officer Lakshmi',
        role: 'billing',
        action: 'PAYMENT_RECORDED',
        targetType: 'Invoice',
        targetId: invoiceId,
        details: `Received ₹${amount} via ${paymentMethod}`,
      },
      ...prev,
    ]);
  };

  // 11B. Create New Hospital Invoice
  const createInvoice = (data: {
    patientId: string;
    items: Array<{ description: string; department: string; amount: number; referenceId?: string }>;
    paymentMethod?: 'Cash' | 'UPI/QR' | 'Credit/Debit Card' | 'Insurance';
    markPaid?: boolean;
    discount?: number;
  }): Invoice => {
    const patient = patients.find((p) => p.id === data.patientId) || patients[0];
    const subtotal = data.items.reduce((s, it) => s + it.amount, 0);
    const discount = data.discount || 0;
    const totalAmount = Math.max(0, subtotal - discount);
    const isPaid = !!data.markPaid;
    const paidAmount = isPaid ? totalAmount : 0;
    const invNumber = `INV-2026-${String(200 + invoices.length + 1).padStart(4, '0')}`;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invNumber,
      consultationId: 'direct-billing',
      patientId: patient.id,
      patientName: patient.name,
      patientUhid: patient.uhid,
      date: '2026-10-24',
      items: data.items.map((it, idx) => ({
        id: `inv-item-${Date.now()}-${idx}`,
        description: it.description,
        department: it.department,
        amount: it.amount,
        referenceId: it.referenceId || `ref-${idx}`,
      })),
      totalAmount,
      paidAmount,
      status: isPaid ? 'paid' : 'pending',
      paymentMethod: data.paymentMethod || 'UPI/QR',
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        timestamp: currentTime,
        userId: 'usr-bill',
        userName: 'CareOS Billing Desk',
        role: 'billing',
        action: 'INVOICE_GENERATED',
        targetType: 'Invoice',
        targetId: invNumber,
        details: `Created invoice ${invNumber} for ${patient.name} totaling ₹${totalAmount} (${newInvoice.items.length} items)`,
      },
      ...prev,
    ]);

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        timestamp: currentTime,
        title: `New Hospital Invoice ${invNumber}`,
        message: `Generated ₹${totalAmount} bill for ${patient.name}. Status: ${newInvoice.status}.`,
        type: 'billing',
        read: false,
      },
      ...prev,
    ]);

    return newInvoice;
  };

  // 11C. Patient Portal Credential Auth
  const loginPatientByPhone = (
    phoneInput: string,
    passwordInput: string
  ): { success: boolean; patient?: Patient; error?: string } => {
    const cleanInput = phoneInput.replace(/[\s\-\+\(\)]/g, '').toLowerCase();
    if (!cleanInput) {
      return { success: false, error: 'Please enter your registered mobile number or UHID.' };
    }

    if (passwordInput.toLowerCase() !== 'password' && passwordInput !== 'careos' && passwordInput !== 'admin') {
      return { success: false, error: 'Invalid password. (Default demo password is "password")' };
    }

    const matched = patients.find((p) => {
      const cleanPhone = p.phone.replace(/[\s\-\+\(\)]/g, '');
      const cleanUhid = p.uhid.toLowerCase();
      return (
        cleanPhone.includes(cleanInput) ||
        cleanInput.includes(cleanPhone) ||
        cleanUhid.includes(cleanInput)
      );
    });

    if (!matched) {
      return {
        success: false,
        error: `No patient account found for "${phoneInput}". Please verify your phone number or register at Reception.`,
      };
    }

    setActivePatientId(matched.id);
    setCurrentRole('patient');
    return { success: true, patient: matched };
  };

  // 12. Nursing Station
  const addNursingTask = (task: Omit<NursingTask, 'id' | 'status'>) => {
    const newTask: NursingTask = {
      ...task,
      id: `nt-${Date.now()}`,
      status: 'pending',
    };
    setNursingTasks((prev) => [newTask, ...prev]);
  };

  const completeNursingTask = (taskId: string, nurseName: string) => {
    setNursingTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'completed', completedBy: nurseName } : t))
    );
  };

  // 13. Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // 14. One-Click Reset Demo Data
  const resetDemoData = () => {
    localStorage.clear();
    setDoctors(INITIAL_DOCTORS);
    setPatients(INITIAL_PATIENTS);
    setAppointments(INITIAL_APPOINTMENTS);
    setQueueEntries(INITIAL_QUEUE_ENTRIES);
    setPrescriptions(INITIAL_PRESCRIPTIONS);
    setDiagnosticOrders(INITIAL_DIAGNOSTIC_ORDERS);
    setInvoices(INITIAL_INVOICES);
    setPharmacyItems(INITIAL_PHARMACY_INVENTORY);
    setBeds(INITIAL_BEDS);
    setNursingTasks(INITIAL_NURSING_TASKS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setAgentLogs(INITIAL_AGENT_LOGS);
    setCurrentTime('09:30 AM');
    setCurrentRole('hospital_admin');
  };

  // 15. Agentic Orchestration Helpers
  const addNotification = (title: string, message: string, severity: 'info' | 'warning' | 'alert' = 'info') => {
    const newItem: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: currentTime,
      title,
      message,
      type: severity === 'alert' ? 'alert' : 'system',
      read: false,
    };
    setNotifications((prev) => [newItem, ...prev]);
  };

  const addAgentLog = (
    agentName: string,
    action: string,
    impact: string,
    status: 'completed' | 'verified' | 'executing' = 'completed'
  ) => {
    const newLog: AgentActionLog = {
      id: `ag-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: currentTime,
      agentName,
      action,
      impact,
      status,
    };
    setAgentLogs((prev) => [newLog, ...prev]);
  };

  const addAuditLog = (action: string, targetId: string, details: string, reason?: string) => {
    const newLog: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: currentTime,
      userId: 'admin-swarm',
      userName: 'CareOS Agent Swarm',
      role: 'hospital_admin',
      action,
      targetType: 'SWARM_ORCHESTRATOR',
      targetId,
      details,
      reason,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const updateBedStatus = (bedId: string, status: HospitalBed['status'], patientName?: string, uhid?: string) => {
    setBeds((prev) =>
      prev.map((b) =>
        b.id === bedId
          ? {
              ...b,
              status,
              patientName: status === 'available' || status === 'cleaning' ? undefined : (patientName || b.patientName),
              patientUhid: status === 'available' || status === 'cleaning' ? undefined : (uhid || b.patientUhid),
              admittedAt: status === 'occupied' ? currentTime : b.admittedAt,
            }
          : b
      )
    );
  };

  const rebalanceQueueBetweenDoctors = (fromDoctorId: string, toDoctorId: string, maxTokensToMove: number = 2) => {
    const fromDoctor = doctors.find((d) => d.id === fromDoctorId);
    const targetDoctor = doctors.find((d) => d.id === toDoctorId);
    if (!targetDoctor) return 0;
    
    let movedCount = 0;
    setQueueEntries((prev) => {
      const waiting = prev.filter((q) => q.doctorId === fromDoctorId && q.state === 'WAITING');
      if (waiting.length === 0) return prev;
      
      const tokensToShift = waiting.slice(-maxTokensToMove).map((q) => q.id);
      movedCount = tokensToShift.length;
      
      let updated = prev.map((q) => {
        if (tokensToShift.includes(q.id)) {
          return {
            ...q,
            doctorId: toDoctorId,
            doctorName: targetDoctor.name,
            notes: (q.notes ? q.notes + ' ' : '') + `[Rebalanced to ${targetDoctor.name} by Queue Agent]`,
          };
        }
        return q;
      });
      if (fromDoctor) {
        updated = recalculateQueueEstimates(fromDoctor, updated, currentTime);
      }
      updated = recalculateQueueEstimates(targetDoctor, updated, currentTime);
      return updated;
    });
    return movedCount;
  };

  return (
    <CareOSContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        activeDoctorId,
        setActiveDoctorId,
        activePatientId,
        setActivePatientId,
        currentTime,
        setCurrentTime,
        soundEnabled,
        setSoundEnabled,
        doctors,
        patients,
        appointments,
        queueEntries,
        prescriptions,
        diagnosticOrders,
        invoices,
        pharmacyItems,
        beds,
        nursingTasks,
        auditLogs,
        agentLogs,
        notifications,
        registerPatient,
        bookAppointment,
        checkInPatient,
        callNextPatient,
        startConsultation,
        completeConsultation,
        declareDoctorDelay,
        applyManualOverride,
        fulfillDiagnosticOrder,
        dispenseMedication,
        recordPayment,
        addNursingTask,
        completeNursingTask,
        markNotificationRead,
        clearAllNotifications,
        resetDemoData,
        playAnnouncementChime,
        addNotification,
        addAgentLog,
        addAuditLog,
        createInvoice,
        loginPatientByPhone,
        updateBedStatus,
        rebalanceQueueBetweenDoctors,
      }}
    >
      {children}
    </CareOSContext.Provider>
  );
};

export const useCareOS = () => {
  const context = useContext(CareOSContext);
  if (!context) {
    throw new Error('useCareOS must be used within a CareOSProvider');
  }
  return context;
};
