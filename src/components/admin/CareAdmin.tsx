import React, { useState } from 'react';
import {
  Building2,
  Users,
  Activity,
  Clock,
  CreditCard,
  BedDouble,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Search,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Cpu,
  Layers,
  Send,
  Play,
  Check,
  RefreshCw,
  Terminal,
  Zap,
  ArrowRight,
  ShieldCheck,
  Sliders,
  PhoneCall,
  FlaskConical,
  Pill,
  Radio,
  FileCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCareOS } from '../../services/store';

interface AgenticTool {
  name: string;
  agent: string;
  description: string;
  schema: string;
  category: string;
  executionCount: number;
}

const REGISTERED_TOOLS: AgenticTool[] = [
  { name: 'recalculateQueueEstimates', agent: 'Queue Predictor Agent', description: 'Calculates dynamic waiting times accounting for doctor speed and priority weights', schema: '{ doctorId: string, currentTokens: Token[] }', category: 'Queue', executionCount: 142 },
  { name: 'balanceDoctorSlots', agent: 'Queue Predictor Agent', description: 'Transfers uncalled tokens between doctors in the same department during delays', schema: '{ fromDoctor: string, toDoctor: string, count: number }', category: 'Queue', executionCount: 28 },
  { name: 'emergencyBumpToken', agent: 'Queue Predictor Agent', description: 'Elevates critical/STAT patients to top of consultation queue with audit trail', schema: '{ queueId: string, justification: string }', category: 'Queue', executionCount: 14 },
  { name: 'detectBottlenecks', agent: 'Queue Predictor Agent', description: 'Analyzes wait-to-consultation ratio and alerts triage supervisor of OPD stalls', schema: '{ thresholdMinutes: number }', category: 'Queue', executionCount: 89 },
  
  { name: 'declareDoctorDelay', agent: 'Doctor Scheduler Agent', description: 'Registers clinical delays and broadcasts revised schedules to OPD and mobile app', schema: '{ doctorId: string, delayMinutes: number, reason: string }', category: 'Scheduling', executionCount: 37 },
  { name: 'bufferConsultationSlots', agent: 'Doctor Scheduler Agent', description: 'Inserts dynamic rest/trauma buffer slots between intense appointments', schema: '{ doctorId: string, durationMinutes: number }', category: 'Scheduling', executionCount: 52 },
  { name: 'notifyDelayedPatients', agent: 'Doctor Scheduler Agent', description: 'Dispatches targeted SMS alerts to affected patients with updated arrival time', schema: '{ doctorId: string, message: string }', category: 'Scheduling', executionCount: 110 },
  { name: 'resolveRosterConflicts', agent: 'Doctor Scheduler Agent', description: 'Detects overlapping on-call duties and triggers substitute doctor ping', schema: '{ shiftId: string }', category: 'Scheduling', executionCount: 19 },

  { name: 'trackDiagnosticTurnaround', agent: 'Diagnostics & Triage Agent', description: 'Monitors radiology imaging and blood lab processing times against TAT SLAs', schema: '{ orderId: string, department: string }', category: 'Diagnostics', executionCount: 76 },
  { name: 'flagCriticalFindings', agent: 'Diagnostics & Triage Agent', description: 'Auto-flags panic laboratory values (e.g., Troponin > 0.4 ng/mL) directly to ordering physician', schema: '{ orderId: string, panicValues: object }', category: 'Diagnostics', executionCount: 9 },
  { name: 'orderAutoVerification', agent: 'Diagnostics & Triage Agent', description: 'Cross-verifies diagnostic test orders against provisional ICD diagnosis codes', schema: '{ diagnosis: string, requestedTests: string[] }', category: 'Diagnostics', executionCount: 64 },
  { name: 'stageDiagnosticSlot', agent: 'Diagnostics & Triage Agent', description: 'Pre-reserves ultrasound / MRI machine slot upon doctor prescription submission', schema: '{ modality: string, patientUhid: string }', category: 'Diagnostics', executionCount: 45 },

  { name: 'verifyDrugInteractions', agent: 'Pharmacy & Safety Agent', description: 'Checks prospective medications against known allergies and co-prescriptions', schema: '{ patientUhid: string, newDrugs: string[] }', category: 'Pharmacy', executionCount: 184 },
  { name: 'queryInventoryStock', agent: 'Pharmacy & Safety Agent', description: 'Verifies real-time pharmacy shelf stock and proposes generic equivalents if low', schema: '{ drugId: string, qty: number }', category: 'Pharmacy', executionCount: 220 },
  { name: 'stageDispensingQueue', agent: 'Pharmacy & Safety Agent', description: 'Pre-packs blister packs at dispensing bay before patient arrives at billing counter', schema: '{ prescriptionId: string }', category: 'Pharmacy', executionCount: 92 },
  { name: 'triggerRestockPO', agent: 'Pharmacy & Safety Agent', description: 'Generates emergency purchase order for critical drugs reaching reorder point', schema: '{ drugCode: string, reorderQty: number }', category: 'Pharmacy', executionCount: 12 },

  { name: 'reconcileItemizedCharges', agent: 'Billing & Revenue Agent', description: 'Aggregates OPD consult, pharmacy medicines, and diagnostic tests without leakage', schema: '{ patientId: string }', category: 'Billing', executionCount: 135 },
  { name: 'verifyAyushmanBharatCoPay', agent: 'Billing & Revenue Agent', description: 'Validates AB-PMJAY golden card entitlement and computes cashless pre-authorization', schema: '{ cardId: string, procedureCode: string }', category: 'Billing', executionCount: 41 },
  { name: 'generateInvoicePdf', agent: 'Billing & Revenue Agent', description: 'Compiles itemized GST tax invoice and digital receipt with QR code', schema: '{ invoiceId: string }', category: 'Billing', executionCount: 104 },
  { name: 'auditZeroLeakage', agent: 'Billing & Revenue Agent', description: 'Audits pharmacy dispensed logs against paid invoices to prevent financial leakage', schema: '{ shiftDate: string }', category: 'Billing', executionCount: 68 },

  { name: 'assignEmergencyBed', agent: 'Operations & Bed Dispatcher', description: 'Instantly assigns available ICU/Ward bed to emergency or post-op admission', schema: '{ wardType: string, patientName: string, uhid: string }', category: 'Operations', executionCount: 22 },
  { name: 'dispatchNurseStation', agent: 'Operations & Bed Dispatcher', description: 'Transfers vital checking task and bed preparation order to active nurse console', schema: '{ bedNumber: string, instructions: string }', category: 'Operations', executionCount: 88 },
  { name: 'monitorICUAvailability', agent: 'Operations & Bed Dispatcher', description: 'Broadcasts telemetry when ICU occupancy exceeds 85% threshold', schema: '{ minFreeBeds: number }', category: 'Operations', executionCount: 31 },
  { name: 'evacuateTransferQueue', agent: 'Operations & Bed Dispatcher', description: 'Coordinates ambulance and internal stretcher dispatch for inter-ward transfer', schema: '{ transferId: string, priority: string }', category: 'Operations', executionCount: 15 },
];

interface ScenarioPreset {
  id: string;
  title: string;
  prompt: string;
  icon: string;
  involvedAgents: string[];
  description: string;
  steps: {
    agent: string;
    tool: string;
    description: string;
    impact: string;
    stateChange: 'delay' | 'rebalance' | 'bed' | 'lab' | 'notification';
  }[];
}

const SCENARIOS: ScenarioPreset[] = [
  {
    id: 'trauma_surge',
    title: '🚨 Emergency Trauma Inflow (Multi-Agent Dispatch)',
    icon: '🚨',
    prompt: 'Trauma emergency arrival in ER: Dr. Rao called for emergency surgery, delay his OPD queue by 25 mins, notify all 3 waiting patients via SMS, reserve ICU bed B-101, and stage STAT trauma lab panel.',
    description: 'Coordinates Doctor Scheduler, Queue Engine, Bed Dispatcher, and Diagnostics agents simultaneously.',
    involvedAgents: ['Doctor Scheduler Agent', 'Queue Predictor Agent', 'Operations & Bed Dispatcher', 'Diagnostics & Triage Agent'],
    steps: [
      {
        agent: 'Doctor Scheduler Agent',
        tool: 'declareDoctorDelay(doctorId="doc-2", delayMinutes=25, reason="Emergency trauma OT surgery")',
        description: 'Marks Dr. K. V. Rao on 25-minute emergency surgery delay and records hospital justification.',
        impact: 'Dr. K. V. Rao delay updated to +25 mins in live roster.',
        stateChange: 'delay',
      },
      {
        agent: 'Queue Predictor Agent',
        tool: 'recalculateQueueEstimates()',
        description: 'Dynamically shifts all waiting Orthopedic token waiting times by +25 mins across digital boards.',
        impact: 'Tokens O-201 and O-202 adjusted; wait times increased by 25m.',
        stateChange: 'rebalance',
      },
      {
        agent: 'Operations & Bed Dispatcher',
        tool: 'assignEmergencyBed(bedNumber="B-101", ward="ICU", status="occupied", patientName="Trauma Inflow #402")',
        description: 'Locks ICU Bed B-101 for immediate resuscitation and dispatches nurse preparation task.',
        impact: 'ICU Bed B-101 marked as OCCUPIED for Trauma Admission.',
        stateChange: 'bed',
      },
      {
        agent: 'Diagnostics & Triage Agent',
        tool: 'stageDiagnosticSlot(modality="STAT Trauma Panel", urgency="stat")',
        description: 'Pre-registers STAT Whole Body Trauma CT and Cross-Match in laboratory system.',
        impact: 'Radiology suite alerted for STAT incoming trauma scan.',
        stateChange: 'lab',
      },
    ],
  },
  {
    id: 'queue_rebalance',
    title: '⚡ Dynamic Queue Rebalancing (Cross-Doctor Shift)',
    icon: '⚡',
    prompt: 'Dr. Radhika Sharma is running 20 mins ahead in Cardiology while Dr. Rao is backed up. Autonomously shift waiting patient O-202 to Dr. Radhika for preliminary general assessment and notify patient.',
    description: 'Queue Predictor and Scheduling agents negotiate inter-department load balancing.',
    involvedAgents: ['Queue Predictor Agent', 'Doctor Scheduler Agent'],
    steps: [
      {
        agent: 'Queue Predictor Agent',
        tool: 'balanceDoctorSlots(fromDoctor="doc-2", toDoctor="doc-1", count=1)',
        description: 'Identifies waiting token O-202 (G. Srinivas) and transfers consult ticket to Dr. Radhika Sharma.',
        impact: 'Token O-202 reassigned to Dr. Radhika Sharma with zero wait-time penalty.',
        stateChange: 'rebalance',
      },
      {
        agent: 'Doctor Scheduler Agent',
        tool: 'notifyDelayedPatients(token="O-202", message="Assigned to Dr. Radhika Sharma (OPD-101) to save 30m")',
        description: 'Sends automated SMS dispatch and push notification to patient mobile app.',
        impact: 'Patient G. Srinivas notified to proceed to OPD Room 101.',
        stateChange: 'notification',
      },
    ],
  },
  {
    id: 'stat_cardiac',
    title: '🧪 STAT Cardiac Enzyme & Emergency Rx Staging',
    icon: '🧪',
    prompt: 'Cardiac patient CARD-011 exhibiting chest discomfort: escalate cardiac enzyme panel to STAT, notify Dr. Radhika, and pre-stage Emergency Nitroglycerin & Aspirin at Pharmacy Bay 1.',
    description: 'Diagnostics, Doctor Scheduler, and Pharmacy agents coordinate immediate clinical response.',
    involvedAgents: ['Diagnostics & Triage Agent', 'Pharmacy & Safety Agent', 'Doctor Scheduler Agent'],
    steps: [
      {
        agent: 'Diagnostics & Triage Agent',
        tool: 'flagCriticalFindings(testName="Troponin-I STAT", urgency="stat", patientId="pat-1")',
        description: 'Escalates pending cardiac lab order to STAT priority with high-priority technician push.',
        impact: 'Laboratory order bumped to top of centrifugation queue.',
        stateChange: 'lab',
      },
      {
        agent: 'Pharmacy & Safety Agent',
        tool: 'stageDispensingQueue(drugs=["Aspirin 325mg", "Nitroglycerin 0.4mg SL"], bay="Bay-1 STAT")',
        description: 'Auto-prepares emergency acute coronary kit at Pharmacy counter for nurse pickup.',
        impact: 'Pharmacy inventory staged with zero-delay checkout ticket.',
        stateChange: 'notification',
      },
      {
        agent: 'Doctor Scheduler Agent',
        tool: 'notifyDelayedPatients(message="STAT Alert: Dr. Radhika alerted to urgent ECG review")',
        description: 'Sounds priority console chime on Dr. Radhika OPD terminal.',
        impact: 'Physician notified on live consultation workstation.',
        stateChange: 'notification',
      },
    ],
  },
  {
    id: 'bed_allocation',
    title: '🏥 Code Blue ICU Bed & Nurse Dispatch',
    icon: '🏥',
    prompt: 'Code Blue in Post-Op: clean and transition ICU Bed B-102 from maintenance to occupied, dispatch nurse station for ventilator standby, and update bed availability index.',
    description: 'Operations & Bed Dispatcher coordinates with Nurse Station agent.',
    involvedAgents: ['Operations & Bed Dispatcher'],
    steps: [
      {
        agent: 'Operations & Bed Dispatcher',
        tool: 'assignEmergencyBed(bedId="bed-2", status="occupied", patientName="Code Blue Transfer")',
        description: 'Transitions ICU Bed B-102 to OCCUPIED status with immediate telemetry link.',
        impact: 'ICU Bed B-102 marked Occupied; ICU load recalculated to 100%.',
        stateChange: 'bed',
      },
      {
        agent: 'Operations & Bed Dispatcher',
        tool: 'dispatchNurseStation(bed="ICU Bed B-102", task="Ventilator Standby & Line Prime")',
        description: 'Issues urgent task to Nurse Station Anitha K. with 5-minute SLA.',
        impact: 'Nursing task created in active nursing station checklist.',
        stateChange: 'notification',
      },
    ],
  },
];

export const CareAdmin: React.FC = () => {
  const {
    doctors,
    appointments,
    queueEntries,
    diagnosticOrders,
    invoices,
    beds,
    auditLogs,
    agentLogs,
    declareDoctorDelay,
    addNotification,
    addAgentLog,
    addAuditLog,
    updateBedStatus,
    rebalanceQueueBetweenDoctors,
  } = useCareOS();

  const [activeTab, setActiveTab] = useState<'overview' | 'agentic'>('agentic');
  const [auditFilter, setAuditFilter] = useState('');
  const [toolSearch, setToolSearch] = useState('');
  const [adminCommand, setAdminCommand] = useState('');
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [activeScenario, setActiveScenario] = useState<ScenarioPreset | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [orchestrationDone, setOrchestrationDone] = useState(false);

  // Computations
  const totalWaiting = queueEntries.filter((q) => q.state === 'WAITING').length;
  const inConsult = queueEntries.filter((q) => q.state === 'IN_CONSULTATION').length;
  const totalBilled = invoices.reduce((s, i) => s + i.totalAmount, 0);
  const totalCollected = invoices.reduce((s, i) => s + i.paidAmount, 0);
  const occupiedBeds = beds.filter((b) => b.status === 'occupied').length;
  const bedOccupancyRate = Math.round((occupiedBeds / (beds.length || 1)) * 100);
  const delayedDoctors = doctors.filter((d) => d.delayMinutes > 0);
  const departments = ['Cardiology', 'Orthopedics', 'Pediatrics', 'General Medicine', 'Neurology'];

  const filteredLogs = auditLogs.filter((l) => {
    const q = auditFilter.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      l.userName.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q) ||
      l.targetId.toLowerCase().includes(q)
    );
  });

  const filteredTools = REGISTERED_TOOLS.filter((t) => {
    const q = toolSearch.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.agent.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    );
  });

  // Execute Agentic Multi-Step Workflow
  const handleRunScenario = async (scenario: ScenarioPreset) => {
    setActiveScenario(scenario);
    setAdminCommand(scenario.prompt);
    setIsOrchestrating(true);
    setCompletedSteps([]);
    setOrchestrationDone(false);

    // Initial Supervisor agent log
    addAgentLog(
      'CareOS Supervisor Agent',
      `Orchestrating Workflow: ${scenario.title}`,
      `Decomposed task into ${scenario.steps.length} coordinated agent tool calls across ${scenario.involvedAgents.join(', ')}`,
      'executing'
    );

    // Sequentially step through each coordinated agent action
    for (let i = 0; i < scenario.steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 850));
      const step = scenario.steps[i];

      // Mutate real state store based on step type
      if (step.stateChange === 'delay') {
        declareDoctorDelay('doc-2', 25, 'Emergency Trauma Surgery (Agentic Auto-Dispatch)');
      } else if (step.stateChange === 'rebalance') {
        rebalanceQueueBetweenDoctors('doc-2', 'doc-1', 1);
      } else if (step.stateChange === 'bed') {
        const targetBed = beds.find((b) => b.ward === 'ICU' && b.status !== 'occupied') || beds[0];
        updateBedStatus(targetBed.id, 'occupied', 'Trauma Emergency Inflow');
      } else if (step.stateChange === 'notification') {
        addNotification(
          `Swarm Dispatch: ${step.agent}`,
          step.impact,
          'alert'
        );
      }

      // Record agent log & audit log
      addAgentLog(step.agent, `Executed tool: ${step.tool}`, step.impact, 'completed');
      addAuditLog(`AGENT_TOOL_EXEC_${step.agent.toUpperCase().replace(/\s+/g, '_')}`, 'SWARM', step.description);

      setCompletedSteps((prev) => [...prev, i]);
    }

    setIsOrchestrating(false);
    setOrchestrationDone(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#0F9D8A', '#14B8A6', '#E8F7F3'],
    });
  };

  const handleCustomCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminCommand.trim()) return;

    // Find best matching scenario or generate coordinated execution
    const lower = adminCommand.toLowerCase();
    let selectedScenario = SCENARIOS[0];
    if (lower.includes('rebalance') || lower.includes('queue') || lower.includes('radhika') || lower.includes('shift')) {
      selectedScenario = SCENARIOS[1];
    } else if (lower.includes('lab') || lower.includes('stat') || lower.includes('cardiac') || lower.includes('enzyme')) {
      selectedScenario = SCENARIOS[2];
    } else if (lower.includes('bed') || lower.includes('icu') || lower.includes('blue')) {
      selectedScenario = SCENARIOS[3];
    }

    // Run scenario with custom prompt text
    handleRunScenario({
      ...selectedScenario,
      prompt: adminCommand,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Brand & Tabs */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5 text-[#0F9D8A]" />
            <h2 className="text-lg font-bold text-[#243746] tracking-tight">
              Hospital Command Center &amp; Multi-Agent Swarm
            </h2>
          </div>
          <p className="text-xs text-[#536B7E]">
            CareOS NSRIT Medical Center · Visakhapatnam, AP · Real-Time Coordinated Autonomous Operations
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#E8F7F3] p-1 rounded-lg border border-[#0F9D8A]/20">
          <button
            onClick={() => setActiveTab('agentic')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'agentic'
                ? 'bg-[#0F9D8A] text-white shadow-xs'
                : 'text-[#243746] hover:text-[#0F9D8A]'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Agentic System Dashboard</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeTab === 'agentic' ? 'bg-white/20 text-white' : 'bg-[#0F9D8A]/10 text-[#0F9D8A]'}`}>
              6 Agents
            </span>
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-[#0F9D8A] text-white shadow-xs'
                : 'text-[#243746] hover:text-[#0F9D8A]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Hospital KPIs &amp; Audit</span>
          </button>
        </div>
      </div>

      {/* ===================== TAB 1: AGENTIC SYSTEM DASHBOARD ===================== */}
      {activeTab === 'agentic' && (
        <div className="space-y-6">
          {/* Swarm Status Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-[#536B7E] mb-1">
                <span>Active Swarm Status</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-xl font-bold font-mono text-[#0F9D8A]">
                6 Agents Coordinated
              </div>
              <div className="text-[11px] text-[#536B7E]">
                Autonomous Peer-to-Peer Bus
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-[#536B7E] mb-1">
                <span>Connected Tools</span>
                <Cpu className="w-3.5 h-3.5 text-[#0F9D8A]" />
              </div>
              <div className="text-xl font-bold font-mono text-[#243746]">
                24 Tools Registered
              </div>
              <div className="text-[11px] text-emerald-600 font-medium">
                100% RBAC Sandboxed
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-[#536B7E] mb-1">
                <span>Event Mesh Latency</span>
                <Zap className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-bold font-mono text-[#243746]">
                14.8 ms Avg
              </div>
              <div className="text-[11px] text-[#536B7E]">
                Sub-20ms Inter-agent sync
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-[#536B7E] mb-1">
                <span>Safety Protocol</span>
                <ShieldCheck className="w-3.5 h-3.5 text-[#0F9D8A]" />
              </div>
              <div className="text-xl font-bold font-mono text-[#0F9D8A]">
                Zero Hallucination
              </div>
              <div className="text-[11px] text-[#536B7E]">
                Clinical Idempotency Enforced
              </div>
            </div>
          </div>

          {/* "ASK THE AGENTIC SYSTEM" - AUTONOMOUS DISPATCHER CONSOLE */}
          <div className="bg-white p-6 rounded-xl border-2 border-[#0F9D8A]/30 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#E8F7F3] text-[#0F9D8A]">
                  <Sparkles className="w-5 h-5 text-[#0F9D8A]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#243746] text-base">
                    Ask the Agentic System (Admin Autonomous Dispatcher)
                  </h3>
                  <p className="text-xs text-[#536B7E]">
                    Enter any operational hospital emergency or request. The supervisor automatically coordinates all involved agents to execute real-time state changes.
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-[#E8F7F3] text-[#0F9D8A] font-semibold self-start sm:self-auto border border-[#0F9D8A]/30">
                Multi-Agent Cooperative Mode
              </span>
            </div>

            {/* Quick Action Scenario Presets */}
            <div>
              <label className="text-[11px] font-bold text-[#536B7E] uppercase tracking-wider block mb-2">
                Instant Coordinated Operational Presets:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {SCENARIOS.map((scenario) => {
                  const isCurrent = activeScenario?.id === scenario.id;
                  return (
                    <button
                      key={scenario.id}
                      onClick={() => handleRunScenario(scenario)}
                      disabled={isOrchestrating}
                      className={`p-3 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-[#E8F7F3] border-[#0F9D8A] shadow-xs'
                          : 'bg-[#F8FCFB] hover:bg-[#E8F7F3]/60 border-slate-200 hover:border-[#0F9D8A]/40'
                      }`}
                    >
                      <div className="font-bold text-[#243746] text-xs mb-1 flex items-center justify-between">
                        <span className="truncate">{scenario.title}</span>
                      </div>
                      <p className="text-[11px] text-[#536B7E] line-clamp-2 leading-relaxed">
                        {scenario.description}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {scenario.involvedAgents.slice(0, 2).map((ag) => (
                          <span key={ag} className="text-[9px] font-medium bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[#0F9D8A]">
                            {ag.replace(' Agent', '')}
                          </span>
                        ))}
                        {scenario.involvedAgents.length > 2 && (
                          <span className="text-[9px] font-medium bg-white px-1 py-0.5 rounded border border-slate-200 text-slate-500">
                            +{scenario.involvedAgents.length - 2}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Natural Language Command Bar */}
            <form onSubmit={handleCustomCommandSubmit} className="space-y-2 pt-2">
              <label className="text-[11px] font-bold text-[#536B7E] uppercase tracking-wider block">
                Or write your custom operational prompt:
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Terminal className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={adminCommand}
                    onChange={(e) => setAdminCommand(e.target.value)}
                    placeholder="E.g., Emergency trauma arrival: delay Dr. Rao by 25 mins, notify waiting patients, reserve ICU Bed B-101..."
                    className="w-full bg-[#F8FCFB] border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-xs text-[#243746] placeholder-slate-400 outline-none focus:border-[#0F9D8A] focus:bg-white transition-all shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isOrchestrating || !adminCommand.trim()}
                  className="px-5 py-2.5 bg-[#0F9D8A] hover:bg-[#0B7A6B] disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-all shadow-sm flex items-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  {isOrchestrating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Coordinating...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      <span>Dispatch Swarm</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* LIVE COORDINATED EXECUTION PIPELINE */}
            {activeScenario && (
              <div className="mt-4 p-4 rounded-xl bg-[#F8FCFB] border border-[#0F9D8A]/20 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#243746]">
                      Coordinated Multi-Agent Execution Plan
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                      {completedSteps.length} of {activeScenario.steps.length} Steps
                    </span>
                  </div>

                  {orchestrationDone && (
                    <span className="flex items-center gap-1 text-xs font-bold text-[#0F9D8A] bg-[#E8F7F3] px-2.5 py-1 rounded-md border border-[#0F9D8A]/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Swarm Execution Complete &amp; Applied to Hospital State
                    </span>
                  )}
                </div>

                {/* Steps Trace */}
                <div className="space-y-2">
                  {activeScenario.steps.map((step, idx) => {
                    const isDone = completedSteps.includes(idx);
                    const isCurrentlyRunning = isOrchestrating && completedSteps.length === idx;

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isDone
                            ? 'bg-white border-[#0F9D8A]/30 shadow-xs'
                            : isCurrentlyRunning
                            ? 'bg-[#E8F7F3] border-[#0F9D8A] shadow-sm animate-pulse'
                            : 'bg-white/60 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#0F9D8A] flex items-center gap-1">
                              <Bot className="w-3.5 h-3.5" />
                              {step.agent}
                            </span>
                            <span className="text-[10px] font-mono bg-slate-100 text-[#536B7E] px-1.5 py-0.5 rounded">
                              Tool: {step.tool.split('(')[0]}
                            </span>
                          </div>
                          <p className="text-[#243746] font-medium text-[11px]">{step.description}</p>
                          <p className="text-[10px] text-emerald-700 font-mono">Impact: {step.impact}</p>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          {isDone ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-[#0F9D8A] bg-[#E8F7F3] px-2 py-0.5 rounded border border-[#0F9D8A]/30 font-mono">
                              <Check className="w-3 h-3 stroke-[3]" />
                              APPLIED
                            </span>
                          ) : isCurrentlyRunning ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-mono">
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              EXECUTING
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                              QUEUED
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* CONNECTED AGENTS TOPOLOGY GRID */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#243746]">
                  Connected Autonomous Agents (Live Swarm Topology)
                </h3>
                <p className="text-xs text-[#536B7E]">
                  All agents maintain continuous coordination over an event-driven clinical bus.
                </p>
              </div>
              <span className="text-xs font-mono font-semibold px-2 py-1 rounded bg-[#E8F7F3] text-[#0F9D8A] border border-[#0F9D8A]/30">
                Peer Consensus Protocol
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  name: 'Queue Predictor Agent',
                  icon: Activity,
                  status: 'Active · Polling (12ms)',
                  tools: ['recalculateQueueEstimates', 'balanceDoctorSlots', 'emergencyBumpToken', 'detectBottlenecks'],
                  desc: 'Predicts waiting times dynamically, balances patient queues across doctors, and elevates critical tokens.',
                  metrics: '273 Tokens Processed · 99.8% Precision',
                },
                {
                  name: 'Doctor & OPD Scheduler Agent',
                  icon: Clock,
                  status: 'Active · Enforcing (18ms)',
                  tools: ['declareDoctorDelay', 'bufferConsultationSlots', 'notifyDelayedPatients', 'resolveRosterConflicts'],
                  desc: 'Enforces schedule integrity, detects doctor delays, propagates delay advisories, and sends SMS alerts.',
                  metrics: '4 Delays Managed · Zero Double-Bookings',
                },
                {
                  name: 'Diagnostics & Triage Agent',
                  icon: FlaskConical,
                  status: 'Active · Routing (15ms)',
                  tools: ['trackDiagnosticTurnaround', 'flagCriticalFindings', 'orderAutoVerification', 'stageDiagnosticSlot'],
                  desc: 'Monitors radiology imaging and lab turnaround times; alerts physicians immediately on critical panic findings.',
                  metrics: '18 Orders Monitored · 100% TAT Compliance',
                },
                {
                  name: 'Pharmacy & Safety Agent',
                  icon: Pill,
                  status: 'Active · Verifying (22ms)',
                  tools: ['verifyDrugInteractions', 'queryInventoryStock', 'stageDispensingQueue', 'triggerRestockPO'],
                  desc: 'Verifies prescription dosages, cross-references drug interactions, and pre-stages medications at checkout counter.',
                  metrics: '46 Prescriptions Cleared · Zero Adverse Conflicts',
                },
                {
                  name: 'Billing & Revenue Agent',
                  icon: CreditCard,
                  status: 'Active · Auditing (14ms)',
                  tools: ['reconcileItemizedCharges', 'verifyAyushmanBharatCoPay', 'generateInvoicePdf', 'auditZeroLeakage'],
                  desc: 'Captures and aggregates itemized OPD charges idempotently across consults, tests, and pharmacy with zero leakage.',
                  metrics: '₹14,550 Reconciled · Zero Financial Leakage',
                },
                {
                  name: 'Operations & Bed Dispatcher',
                  icon: BedDouble,
                  status: 'Active · Orchestrating (16ms)',
                  tools: ['assignEmergencyBed', 'dispatchNurseStation', 'monitorICUAvailability', 'evacuateTransferQueue'],
                  desc: 'Monitors hospital-wide bed occupancy, assigns emergency ICU beds, and issues tasks to nursing station.',
                  metrics: '8 Beds Managed · 2 Trauma Slots Held',
                },
              ].map((ag) => {
                const Icon = ag.icon;
                return (
                  <div
                    key={ag.name}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-[#E8F7F3] text-[#0F9D8A]">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-[#243746] text-xs">{ag.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {ag.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#536B7E] leading-relaxed mb-3">
                        {ag.desc}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="text-[10px] font-semibold text-[#243746] uppercase tracking-wider flex items-center justify-between">
                        <span>Assigned Tools:</span>
                        <span className="font-mono text-[#0F9D8A] font-bold">{ag.tools.length} Tools</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {ag.tools.map((tool) => (
                          <span
                            key={tool}
                            className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#F8FCFB] border border-slate-200 text-[#243746]"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-mono font-medium pt-1">
                        Telemetry: {ag.metrics}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CONNECTED TOOLS REGISTRY & INTERACTIVE INVOCATIONS */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-[#243746] text-sm uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#0F9D8A]" />
                  Connected Tools Registry ({REGISTERED_TOOLS.length} Clinical Tools)
                </h3>
                <p className="text-xs text-[#536B7E]">
                  Registered tool endpoints invokable by autonomous agents during patient workflow coordination.
                </p>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search tools or agents..."
                  value={toolSearch}
                  onChange={(e) => setToolSearch(e.target.value)}
                  className="bg-[#F8FCFB] border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#243746] placeholder-slate-400 outline-none focus:border-[#0F9D8A] w-56"
                />
              </div>
            </div>

            <div className="overflow-x-auto max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#E8F7F3]/70 text-[#243746] border-b border-slate-200 sticky top-0">
                    <th className="py-2.5 px-3 font-semibold">Tool Name</th>
                    <th className="py-2.5 px-3 font-semibold">Authorized Agent</th>
                    <th className="py-2.5 px-3 font-semibold">Description</th>
                    <th className="py-2.5 px-3 font-semibold">Parameter Schema</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Invocations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTools.map((tool) => (
                    <tr key={tool.name} className="hover:bg-[#F8FCFB] transition-colors">
                      <td className="py-2 px-3 font-mono font-bold text-[#0F9D8A] whitespace-nowrap">
                        {tool.name}()
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#E8F7F3] text-[#0F9D8A] border border-[#0F9D8A]/20">
                          {tool.agent}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-[#536B7E] max-w-xs truncate">
                        {tool.description}
                      </td>
                      <td className="py-2 px-3 font-mono text-[10px] text-slate-500 max-w-xs truncate">
                        {tool.schema}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-[#243746]">
                        {tool.executionCount} calls
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* LIVE AGENT ACTION STREAM */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
              <h3 className="font-bold text-[#243746] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#0F9D8A]" />
                Live Swarm Action Stream ({agentLogs.length} Events)
              </h3>
              <span className="text-[#536B7E] font-mono text-[11px]">
                Deterministic Event Log
              </span>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {agentLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-[#F8FCFB] rounded-lg border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#0F9D8A]">{log.agentName}</span>
                      <span className="text-[10px] text-[#536B7E] font-mono">[{log.timestamp}]</span>
                    </div>
                    <p className="text-[#243746] text-[11px] font-medium">{log.action}</p>
                    <span className="text-[#536B7E] text-[10px] block">{log.impact}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E8F7F3] text-[#0F9D8A] border border-[#0F9D8A]/30 shrink-0 self-start sm:self-auto">
                    {log.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: OVERVIEW & HOSPITAL KPIS ===================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Matrix (4 Columns) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            {/* Outpatient Flow */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-[#536B7E] mb-1">
                <span>Outpatient Volume</span>
                <Users className="w-3.5 h-3.5 text-[#0F9D8A]" />
              </div>
              <div className="text-2xl font-bold font-mono text-[#243746] mb-1">
                {appointments.length} Total
              </div>
              <div className="text-[11px] text-[#536B7E] flex items-center justify-between">
                <span>{inConsult} In Consultation</span>
                <span className="text-[#0F9D8A] font-bold font-mono">{totalWaiting} Waiting</span>
              </div>
            </div>

            {/* Queue Predictability */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-[#536B7E] mb-1">
                <span>Queue Health Index</span>
                <Activity className="w-3.5 h-3.5 text-[#0F9D8A]" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-700 mb-1">
                98.2%
              </div>
              <div className="text-[11px] text-[#536B7E]">
                {delayedDoctors.length > 0 ? (
                  <span className="text-amber-700 font-semibold">{delayedDoctors.length} Provider Delays Managed</span>
                ) : (
                  <span className="text-emerald-700 font-semibold">All Providers On Schedule</span>
                )}
              </div>
            </div>

            {/* Bed Occupancy */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-[#536B7E] mb-1">
                <span>Inpatient Bed Load</span>
                <BedDouble className="w-3.5 h-3.5 text-[#0F9D8A]" />
              </div>
              <div className="text-2xl font-bold font-mono text-[#243746] mb-1">
                {bedOccupancyRate}%
              </div>
              <div className="text-[11px] text-[#536B7E]">
                {occupiedBeds} occupied of {beds.length} total beds
              </div>
            </div>

            {/* Revenue Realization */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-[#536B7E] mb-1">
                <span>Gross Realized</span>
                <CreditCard className="w-3.5 h-3.5 text-[#0F9D8A]" />
              </div>
              <div className="text-2xl font-bold font-mono text-[#0F9D8A] mb-1">
                ₹{totalBilled.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-700 font-medium">
                ₹{totalCollected.toLocaleString()} collected
              </div>
            </div>
          </div>

          {/* Department Breakdown Matrix */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h3 className="text-sm font-bold text-[#243746]">Departmental Operations Matrix</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
              {departments.map((dept) => {
                const deptDocs = doctors.filter((d) => d.department === dept);
                const deptQueue = queueEntries.filter((q) => q.department === dept);
                const deptWaiting = deptQueue.filter((q) => q.state === 'WAITING').length;
                const deptActive = deptQueue.filter((q) => q.state === 'IN_CONSULTATION').length;
                const hasDelay = deptDocs.some((d) => d.delayMinutes > 0);

                return (
                  <div key={dept} className="p-3 bg-[#F8FCFB] rounded-lg border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#243746] text-xs">{dept}</span>
                      {hasDelay && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" title="Active delay" />
                      )}
                    </div>
                    <div className="space-y-1 text-[#536B7E] text-[11px]">
                      <div className="flex justify-between">
                        <span>Doctors:</span>
                        <span className="text-[#243746] font-mono font-medium">{deptDocs.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>In Room:</span>
                        <span className="text-[#0F9D8A] font-mono font-bold">{deptActive}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Waiting:</span>
                        <span className="text-[#0F9D8A] font-mono font-bold">{deptWaiting}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Immutable Audit Trail */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 text-xs gap-2">
              <div>
                <h3 className="font-bold text-[#243746] uppercase tracking-wider">
                  System Audit Trail &amp; Operational Log
                </h3>
                <p className="text-[11px] text-[#536B7E]">
                  Immutable event stream recording all queue transitions, delays, overrides, and autonomous agent actions.
                </p>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter logs..."
                  value={auditFilter}
                  onChange={(e) => setAuditFilter(e.target.value)}
                  className="bg-[#F8FCFB] border border-slate-200 rounded-lg pl-8 pr-2 py-1.5 text-xs text-[#243746] outline-none focus:border-[#0F9D8A] w-48"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-[#F8FCFB] rounded-lg border border-slate-200 text-xs flex items-start justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[#0F9D8A] text-[11px] font-bold">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-[#536B7E] font-mono">
                        Target: {log.targetId}
                      </span>
                    </div>
                    <p className="text-[#243746] text-[11px] leading-relaxed">{log.details}</p>
                    {log.reason && (
                      <span className="text-amber-700 text-[10px] block font-medium">
                        Justification: {log.reason}
                      </span>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-[10px] text-[#536B7E] block">{log.timestamp}</span>
                    <span className="text-[10px] text-slate-600 font-medium">{log.userName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
