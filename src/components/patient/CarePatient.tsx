import React, { useState } from 'react';
import {
  Users,
  Clock,
  Activity,
  FileText,
  Pill,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  Volume2,
  ChevronRight,
  Shield,
  Download,
  Sparkles,
  Bot,
  Heart,
  Coffee,
  Apple,
  Droplet,
  Bell,
  Check,
  Send,
  Eye,
  X,
  Maximize2,
} from 'lucide-react';
import { useCareOS } from '../../services/store';

interface MedAlarm {
  id: string;
  name: string;
  dosage: string;
  time: string;
  slot: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  instructions: string;
  taken: boolean;
}

export const CarePatient: React.FC = () => {
  const {
    patients,
    activePatientId,
    setActivePatientId,
    queueEntries,
    appointments,
    prescriptions,
    diagnosticOrders,
    invoices,
    playAnnouncementChime,
    addNotification,
  } = useCareOS();

  const [activeTab, setActiveTab] = useState<'token' | 'records' | 'bills' | 'aura'>('token');

  const patient = patients.find((p) => p.id === activePatientId) || patients[0];

  // Active queue entry for this patient
  const patientQueueEntry = queueEntries.find(
    (q) => q.patientId === patient.id && q.state !== 'CANCELLED'
  );

  const patientAppointments = appointments.filter((a) => a.patientId === patient.id);
  const patientPrescriptions = prescriptions.filter((p) => p.patientId === patient.id);
  const patientDiagnostics = diagnosticOrders.filter((d) => d.patientId === patient.id);
  const patientInvoices = invoices.filter((i) => i.patientId === patient.id);

  // Lightbox for radiology scan viewing
  const [viewingScan, setViewingScan] = useState<{
    testName: string;
    scanImageUrl: string;
    findings?: string;
    impression?: string;
    verifiedBy?: string;
  } | null>(null);

  // Aura Caretaker State
  const [waterGlasses, setWaterGlasses] = useState<number>(5);
  const [auraChatInput, setAuraChatInput] = useState('');
  const [auraChatMessages, setAuraChatMessages] = useState<
    Array<{ sender: 'aura' | 'patient'; text: string; time: string }>
  >([
    {
      sender: 'aura',
      text: `Hello ${patient.name}! I am Aura, your personal CareOS Caretaker Agent. I am monitoring your medication timetable, vitals, and customized dietary plan. How are you feeling right now?`,
      time: '08:00 AM',
    },
  ]);

  const [alarms, setAlarms] = useState<MedAlarm[]>([
    {
      id: 'alm-1',
      name: 'Amlodipine Besylate',
      dosage: '5mg',
      time: '08:30 AM',
      slot: 'Morning',
      instructions: 'Take after breakfast with a full glass of water.',
      taken: true,
    },
    {
      id: 'alm-2',
      name: 'Telmisartan',
      dosage: '40mg',
      time: '01:30 PM',
      slot: 'Afternoon',
      instructions: 'Take with or after lunch.',
      taken: false,
    },
    {
      id: 'alm-3',
      name: 'Atorvastatin Calcium',
      dosage: '10mg',
      time: '09:00 PM',
      slot: 'Night',
      instructions: 'Take at bedtime for optimum lipid synthesis inhibition.',
      taken: false,
    },
  ]);

  const handleToggleMedAlarm = (id: string) => {
    setAlarms((prev) =>
      prev.map((alm) => {
        if (alm.id === id) {
          const nextState = !alm.taken;
          if (nextState) {
            playAnnouncementChime(`Medication confirmed: ${alm.name} taken.`);
            addNotification({
              title: 'Medication Adherence Recorded',
              message: `${patient.name} marked ${alm.name} (${alm.dosage}) as taken.`,
              type: 'system',
              department: 'OPD',
            });
          }
          return { ...alm, taken: nextState };
        }
        return alm;
      })
    );
  };

  const handleTriggerAlarmChime = (alm: MedAlarm) => {
    playAnnouncementChime(
      `Reminder for ${patient.name}: It is time to take ${alm.name} ${alm.dosage}. ${alm.instructions}`
    );
  };

  const handleSendAuraMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auraChatInput.trim()) return;

    const userText = auraChatInput.trim();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsgList = [...auraChatMessages, { sender: 'patient' as const, text: userText, time: nowTime }];
    setAuraChatMessages(newMsgList);
    setAuraChatInput('');

    // Generate clinical caretaker response
    setTimeout(() => {
      let botResponse = '';
      const lower = userText.toLowerCase();

      if (lower.includes('water') || lower.includes('hydration') || lower.includes('drink')) {
        botResponse = `Excellent question. Your target today is 8 glasses (~2,000ml - 2,400ml). Adequate hydration stabilizes blood pressure and assists renal excretion of medications like Telmisartan.`;
      } else if (lower.includes('diet') || lower.includes('food') || lower.includes('eat') || lower.includes('salt')) {
        botResponse = `For your profile, Dr. Recommended the DASH protocol: keep sodium under 2,000mg/day, favor steamed greens, lentils, oats, and bananas (rich in potassium), and avoid processed fried snacks.`;
      } else if (lower.includes('headache') || lower.includes('dizzy') || lower.includes('pain') || lower.includes('side effect')) {
        botResponse = `Mild lightheadedness can occur when blood pressure normalizes with Amlodipine. Please sit or lie down, sip water, and avoid sudden standing. If symptoms persist over 30 minutes, I will immediately alert the triage nursing station.`;
      } else if (lower.includes('miss') || lower.includes('forgot') || lower.includes('skip')) {
        botResponse = `If you missed a dose by less than 4 hours, take it as soon as you remember. If it is already close to your next scheduled dose, skip the missed dose—never double up on antihypertensives.`;
      } else {
        botResponse = `I have logged your note in your CareOS Clinical Chart. Your next scheduled dose is at ${alarms.find((a) => !a.taken)?.time || '09:00 PM'}. Remember to maintain relaxed breathing and rest well.`;
      }

      setAuraChatMessages((prev) => [
        ...prev,
        {
          sender: 'aura',
          text: botResponse,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 700);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Patient Header & Persona Switcher */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#E8F7F3] border border-[#0F9D8A]/30 flex items-center justify-center text-[#0F9D8A] font-bold text-base shrink-0">
            {patient.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#243746]">{patient.name}</h2>
              <span className="text-[11px] font-mono font-semibold text-[#0F9D8A] bg-[#E8F7F3] px-2 py-0.5 rounded border border-[#0F9D8A]/30">
                {patient.uhid}
              </span>
            </div>
            <p className="text-xs text-[#536B7E]">
              Phone: <strong className="text-[#243746]">{patient.phone}</strong> · Age: {patient.age} · {patient.gender} · Blood: {patient.bloodGroup} · {patient.address}
            </p>
          </div>
        </div>

        {/* Switch patient demo dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#536B7E]">Patient Demo:</span>
          <select
            value={activePatientId}
            onChange={(e) => setActivePatientId(e.target.value)}
            className="bg-[#F8FCFB] border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-[#243746] outline-none cursor-pointer"
            aria-label="Switch Active Patient Profile"
          >
            {patients.slice(0, 10).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.uhid.slice(-4)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('token')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'token'
              ? 'bg-[#0F9D8A] text-white shadow-xs'
              : 'text-[#243746] hover:text-[#0F9D8A] hover:bg-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Live Digital Queue Token</span>
        </button>

        <button
          onClick={() => setActiveTab('aura')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'aura'
              ? 'bg-[#0F9D8A] text-white shadow-xs'
              : 'text-[#243746] hover:text-[#0F9D8A] hover:bg-white'
          }`}
        >
          <Bot className="w-4 h-4 text-emerald-300" />
          <span className="flex items-center gap-1.5">
            Aura Caretaker Agent
            <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500 text-white rounded-full font-mono">
              Live
            </span>
          </span>
        </button>

        <button
          onClick={() => setActiveTab('records')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'records'
              ? 'bg-[#0F9D8A] text-white shadow-xs'
              : 'text-[#243746] hover:text-[#0F9D8A] hover:bg-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Medical Records &amp; Imaging</span>
        </button>

        <button
          onClick={() => setActiveTab('bills')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'bills'
              ? 'bg-[#0F9D8A] text-white shadow-xs'
              : 'text-[#243746] hover:text-[#0F9D8A] hover:bg-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Invoices &amp; Receipts</span>
        </button>
      </div>

      {/* Tab 1: Live Digital Token Card */}
      {activeTab === 'token' && (
        <div className="space-y-4">
          {patientQueueEntry ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 space-y-6 shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#0F9D8A] font-bold block mb-1">
                    CareOS Outpatient Pass · Smart Clinic Center
                  </span>
                  <h3 className="text-xl font-bold text-[#243746]">
                    {patientQueueEntry.department} Clinic
                  </h3>
                </div>

                <span
                  className={`text-xs font-mono font-bold px-3 py-1 rounded-full uppercase border ${
                    patientQueueEntry.state === 'IN_CONSULTATION'
                      ? 'bg-[#E8F7F3] border-[#0F9D8A] text-[#0F9D8A]'
                      : patientQueueEntry.state === 'CALLED'
                      ? 'bg-amber-50 border-amber-400 text-amber-800 animate-pulse'
                      : patientQueueEntry.state === 'COMPLETED'
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                      : 'bg-[#E8F7F3] border-[#0F9D8A]/30 text-[#0F9D8A]'
                  }`}
                >
                  {patientQueueEntry.state.replace('_', ' ')}
                </span>
              </div>

              {/* Central Token Showcase */}
              <div className="p-6 bg-[#F8FCFB] rounded-xl border border-slate-200 text-center space-y-2">
                <span className="text-xs text-[#536B7E] uppercase tracking-widest font-semibold block">
                  Your Queue Token
                </span>
                <div className="text-5xl md:text-6xl font-black font-mono text-[#0F9D8A] tracking-wider py-2">
                  {patientQueueEntry.token}
                </div>
                <div className="text-xs text-[#536B7E]">
                  Assigned Clinician: <strong className="text-[#243746]">{patientQueueEntry.doctorName}</strong>
                </div>
              </div>

              {/* Estimated Waiting Time & Explainability */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-[#F8FCFB] rounded-xl border border-slate-200">
                  <span className="text-[#536B7E] block mb-1 font-medium">Estimated Wait Time</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black font-mono text-[#243746] tabular-nums">
                      ~{patientQueueEntry.estimatedWaitMinutes} mins
                    </span>
                    <span className="text-[11px] text-[#536B7E] font-mono">
                      ({patientQueueEntry.confidenceRange})
                    </span>
                  </div>
                  <span className="text-[11px] text-[#0F9D8A] font-semibold block mt-1">
                    Expected Consultation: {patientQueueEntry.expectedStartTime}
                  </span>
                </div>

                <div className="p-4 bg-[#F8FCFB] rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[#536B7E] block mb-1 font-medium">Queue Intelligence Rationale</span>
                  <p className="text-[#243746] leading-relaxed text-[11px]">
                    {patientQueueEntry.delayReason || 'Your turn is progressing normally on schedule.'}
                  </p>
                  <span className="text-[10px] text-[#536B7E] block">
                    Calculated by CareQueue Dynamic Prediction Engine
                  </span>
                </div>
              </div>

              {/* Step Notification Banner */}
              {patientQueueEntry.state === 'CALLED' && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>
                      <strong>Your token has been called!</strong> Please proceed to the consultation room immediately.
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      playAnnouncementChime(
                        `Token ${patientQueueEntry.token}, please proceed to ${patientQueueEntry.doctorName}'s room.`
                      )
                    }
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded cursor-pointer shadow-xs"
                  >
                    Play Chime
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-8 text-center text-xs text-[#536B7E] space-y-2">
              <Clock className="w-8 h-8 text-[#0F9D8A]/40 mx-auto" />
              <p>No active outpatient queue token found for {patient.name} today.</p>
              <p className="text-[#536B7E]">Visit the reception desk to check-in or book a consultation.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: AURA — AI CARETAKER AGENT */}
      {activeTab === 'aura' && (
        <div className="space-y-6">
          {/* Aura Hero Banner */}
          <div className="bg-gradient-to-r from-[#0F9D8A] to-[#0A6B5E] p-6 rounded-2xl text-white shadow-md relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Bot className="w-7 h-7 text-emerald-200" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold">Aura Caretaker Agent</h3>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-white/20 rounded-full font-bold">
                      24/7 Autonomous Care
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100">
                    Proactive medication adherence, personalized dietary planning, and vital symptom monitoring.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl border border-white/15">
                <Heart className="w-4 h-4 text-rose-300" />
                <span className="text-xs font-semibold">Adherence Score: 92%</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics: Hydration & Daily Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Water Tracker */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#243746] flex items-center gap-1.5">
                  <Droplet className="w-4 h-4 text-sky-500" /> Hydration Goal
                </span>
                <span className="text-xs font-mono font-bold text-sky-600">
                  {waterGlasses}/8 glasses ({waterGlasses * 250}ml)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (waterGlasses / 8) * 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setWaterGlasses((w) => Math.max(0, w - 1))}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs text-[#243746] cursor-pointer"
                >
                  - 1 Glass
                </button>
                <button
                  onClick={() => setWaterGlasses((w) => w + 1)}
                  className="px-3 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold rounded text-xs border border-sky-200 cursor-pointer"
                >
                  + Log 250ml
                </button>
              </div>
            </div>

            {/* Diet Plan Summary */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#243746] flex items-center gap-1.5">
                  <Apple className="w-4 h-4 text-emerald-600" /> Clinical Diet Plan
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E8F7F3] text-[#0F9D8A] font-bold">
                  DASH Protocol
                </span>
              </div>
              <p className="text-[11px] text-[#536B7E] leading-relaxed">
                Low sodium (&lt;2g/day), potassium-rich greens, whole grains, steamed vegetables, and skim milk.
              </p>
              <span className="text-[10px] text-emerald-700 font-semibold block">
                Next recommended: Steamed brown rice &amp; dal soup (01:00 PM)
              </span>
            </div>

            {/* Next Alarm */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#243746] flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-amber-500" /> Upcoming Dose
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold">
                  {alarms.find((a) => !a.taken)?.time || 'All Complete'}
                </span>
              </div>
              <p className="text-[11px] font-bold text-[#243746]">
                {alarms.find((a) => !a.taken)?.name || 'All prescribed medicines taken today!'}
              </p>
              <span className="text-[10px] text-[#536B7E] block">
                {alarms.find((a) => !a.taken)?.instructions || 'Great adherence. Keep it up!'}
              </span>
            </div>
          </div>

          {/* Section: Medication Timetable & Sound Alarms */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#243746] flex items-center gap-2">
                  <Pill className="w-4 h-4 text-[#0F9D8A]" />
                  Active Medication Alarms &amp; Schedule
                </h4>
                <p className="text-xs text-[#536B7E]">
                  Aura sounds proactive audible reminders and tracks daily patient compliance.
                </p>
              </div>

              <button
                onClick={() =>
                  playAnnouncementChime(
                    `Reminder: Aura caretaker checking in. Please remember to take your scheduled afternoon medications on time.`
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E8F7F3] hover:bg-[#d6f2ea] text-[#0F9D8A] rounded-lg text-xs font-bold border border-[#0F9D8A]/30 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                Test Alarm Chime
              </button>
            </div>

            <div className="space-y-2.5">
              {alarms.map((alm) => (
                <div
                  key={alm.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    alm.taken
                      ? 'bg-slate-50 border-slate-200 opacity-80'
                      : 'bg-white border-[#0F9D8A]/30 shadow-xs'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <button
                      onClick={() => handleToggleMedAlarm(alm.id)}
                      className={`w-6 h-6 rounded-md flex items-center justify-center border cursor-pointer transition-colors shrink-0 mt-0.5 sm:mt-0 ${
                        alm.taken
                          ? 'bg-[#0F9D8A] border-[#0F9D8A] text-white'
                          : 'border-slate-300 hover:border-[#0F9D8A]'
                      }`}
                      title={alm.taken ? 'Mark as Not Taken' : 'Mark as Taken'}
                    >
                      {alm.taken && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-xs ${alm.taken ? 'line-through text-slate-500' : 'text-[#243746]'}`}>
                          {alm.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-[#536B7E]">
                          {alm.dosage}
                        </span>
                        <span className="text-[10px] font-semibold text-[#0F9D8A] bg-[#E8F7F3] px-1.5 py-0.2 rounded">
                          {alm.slot} ({alm.time})
                        </span>
                      </div>
                      <p className="text-[11px] text-[#536B7E] mt-0.5">{alm.instructions}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleTriggerAlarmChime(alm)}
                      className="px-2.5 py-1 text-slate-600 hover:text-[#0F9D8A] hover:bg-[#E8F7F3] rounded text-xs flex items-center gap-1 border border-slate-200 cursor-pointer"
                      title="Play Audio Alarm Reminder"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                      Ring Alarm
                    </button>

                    <button
                      onClick={() => handleToggleMedAlarm(alm.id)}
                      className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                        alm.taken
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-[#0F9D8A] hover:bg-[#0B7A6B] text-white shadow-xs'
                      }`}
                    >
                      {alm.taken ? 'Taken ✓' : 'Mark Taken'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Clinical Diet & Nutrition Guidance */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-[#243746] flex items-center gap-2">
              <Apple className="w-4 h-4 text-emerald-600" />
              Prescribed Nutrition &amp; Diet Plan
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#F8FCFB] rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-[#243746]">
                  <Coffee className="w-3.5 h-3.5 text-amber-600" /> Morning Breakfast
                </div>
                <p className="text-[11px] text-[#536B7E] leading-relaxed">
                  Warm oatmeal with sliced apples, ground flaxseeds, and green tea. Low sodium, zero added table salt.
                </p>
              </div>

              <div className="p-3 bg-[#F8FCFB] rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-[#243746]">
                  <Apple className="w-3.5 h-3.5 text-emerald-600" /> Afternoon Lunch
                </div>
                <p className="text-[11px] text-[#536B7E] leading-relaxed">
                  Steamed brown rice, yellow moong dal, sauteed spinach (palak), cucumber-carrot salad with lemon juice.
                </p>
              </div>

              <div className="p-3 bg-[#F8FCFB] rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-[#243746]">
                  <Heart className="w-3.5 h-3.5 text-rose-500" /> Evening &amp; Dinner
                </div>
                <p className="text-[11px] text-[#536B7E] leading-relaxed">
                  Multigrain chapati with steamed bottle gourd curry, roasted pumpkin seeds, and warm turmeric water.
                </p>
              </div>
            </div>
          </div>

          {/* Section: Interactive Aura Q&A Console */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#0F9D8A]" />
                <h4 className="text-sm font-bold text-[#243746]">Ask Aura (Clinical Caretaker Q&amp;A)</h4>
              </div>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                Online &amp; Grounded in Your Health Record
              </span>
            </div>

            {/* Quick suggested chips */}
            <div className="flex flex-wrap gap-1.5">
              {[
                'When should I take my next blood pressure dose?',
                'Can I take Telmisartan before eating lunch?',
                'What snacks should I avoid with hypertension?',
                'Is slight dizziness normal after Amlodipine?',
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAuraChatInput(chip)}
                  className="text-[10px] px-2.5 py-1 bg-[#F8FCFB] hover:bg-[#E8F7F3] hover:text-[#0F9D8A] border border-slate-200 hover:border-[#0F9D8A]/40 rounded-full text-[#536B7E] transition-all cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Chat conversation area */}
            <div className="bg-[#F8FCFB] rounded-xl border border-slate-200 p-4 max-h-72 overflow-y-auto space-y-3 text-xs">
              {auraChatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${
                    msg.sender === 'patient' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 shadow-xs ${
                      msg.sender === 'patient'
                        ? 'bg-[#0F9D8A] text-white rounded-tr-none'
                        : 'bg-white border border-slate-200 text-[#243746] rounded-tl-none'
                    }`}
                  >
                    {msg.sender === 'aura' && (
                      <span className="text-[10px] font-bold text-[#0F9D8A] block mb-1">
                        Aura Caretaker
                      </span>
                    )}
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                  <span className="text-[9px] text-[#536B7E] font-mono mt-0.5 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendAuraMessage} className="flex gap-2">
              <input
                type="text"
                placeholder="Ask Aura anything about your diet, medication timing, or side effects..."
                value={auraChatInput}
                onChange={(e) => setAuraChatInput(e.target.value)}
                className="flex-1 bg-[#F8FCFB] border border-slate-200 rounded-lg px-3 py-2 text-xs text-[#243746] outline-none focus:border-[#0F9D8A]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#0F9D8A] hover:bg-[#0B7A6B] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Ask Aura
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: Medical Records & Diagnostics Imaging */}
      {activeTab === 'records' && (
        <div className="space-y-6">
          {/* Prescriptions Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h3 className="text-sm font-bold text-[#243746] flex items-center gap-2">
              <Pill className="w-4 h-4 text-[#0F9D8A]" />
              Digital e-Prescriptions ({patientPrescriptions.length})
            </h3>

            {patientPrescriptions.length === 0 ? (
              <p className="text-xs text-[#536B7E] py-3">No prescriptions recorded yet.</p>
            ) : (
              patientPrescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="p-4 bg-[#F8FCFB] rounded-xl border border-slate-200 space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <span className="font-bold text-[#243746]">{rx.doctorName}</span>
                      <span className="text-[10px] text-[#536B7E] block">{rx.date}</span>
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#E8F7F3] text-[#0F9D8A] border border-[#0F9D8A]/20">
                      {rx.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-[#536B7E] block font-semibold">Diagnosis:</span>
                    <span className="text-[#243746]">{rx.diagnosis}</span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] text-[#536B7E] block font-semibold">Medications:</span>
                    {rx.medications.map((m) => (
                      <div
                        key={m.id}
                        className="p-2 bg-white rounded border border-slate-200 flex items-center justify-between text-[11px]"
                      >
                        <div>
                          <span className="font-semibold text-[#243746] block">
                            {m.drugName} ({m.dosage})
                          </span>
                          {m.instructions && (
                            <span className="text-[10px] text-[#536B7E] block">{m.instructions}</span>
                          )}
                        </div>
                        <span className="text-[#536B7E] font-mono text-right">
                          {m.frequency} · {m.duration}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Diagnostic Reports & PACS Imaging Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h3 className="text-sm font-bold text-[#243746] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0F9D8A]" />
              Diagnostic Lab &amp; PACS Imaging Reports ({patientDiagnostics.length})
            </h3>

            {patientDiagnostics.length === 0 ? (
              <p className="text-xs text-[#536B7E] py-3">No diagnostic reports on file.</p>
            ) : (
              patientDiagnostics.map((diag) => (
                <div
                  key={diag.id}
                  className="p-4 bg-[#F8FCFB] rounded-xl border border-slate-200 space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[#0F9D8A] font-bold">{diag.orderNumber}</span>
                      <h4 className="font-bold text-[#243746]">{diag.testName}</h4>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                        diag.status === 'completed'
                          ? 'bg-[#E8F7F3] text-[#0F9D8A] border border-[#0F9D8A]/30'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {diag.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Radiology Scan Image Preview if attached */}
                  {diag.scanImageUrl && (
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#243746] flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-[#0F9D8A]" />
                          PACS Digital Radiograph Attached ({diag.fileAttachmentName || 'Scan File'})
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setViewingScan({
                              testName: diag.testName,
                              scanImageUrl: diag.scanImageUrl!,
                              findings: diag.findings,
                              impression: diag.impression,
                              verifiedBy: diag.verifiedBy,
                            })
                          }
                          className="text-[10px] text-[#0F9D8A] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Maximize2 className="w-3 h-3" /> Enlarge Radiograph
                        </button>
                      </div>

                      <div
                        onClick={() =>
                          setViewingScan({
                            testName: diag.testName,
                            scanImageUrl: diag.scanImageUrl!,
                            findings: diag.findings,
                            impression: diag.impression,
                            verifiedBy: diag.verifiedBy,
                          })
                        }
                        className="relative group cursor-pointer rounded-lg overflow-hidden border border-slate-200 bg-black aspect-video max-h-48 flex items-center justify-center"
                      >
                        <img
                          src={diag.scanImageUrl}
                          alt={diag.testName}
                          className="object-contain max-h-48 w-full group-hover:scale-102 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                          <Maximize2 className="w-4 h-4" /> Click to Inspect Full Radiograph
                        </div>
                      </div>
                    </div>
                  )}

                  {diag.findings && (
                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-[11px] space-y-1">
                      <span className="text-[#536B7E] block font-bold">Clinical Findings:</span>
                      <p className="text-[#243746] leading-relaxed font-mono">{diag.findings}</p>
                      {diag.impression && (
                        <p className="text-[#0F9D8A] font-semibold pt-1">
                          Impression: {diag.impression}
                        </p>
                      )}
                      <span className="text-[10px] text-[#536B7E] block pt-1">
                        Verified &amp; signed by {diag.verifiedBy}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Bills & Receipts */}
      {activeTab === 'bills' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h3 className="text-sm font-bold text-[#243746] flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#0F9D8A]" />
            Itemized Hospital Invoices ({patientInvoices.length})
          </h3>

          {patientInvoices.length === 0 ? (
            <p className="text-xs text-[#536B7E] py-3">No billing records found.</p>
          ) : (
            patientInvoices.map((inv) => (
              <div
                key={inv.id}
                className="p-4 bg-[#F8FCFB] rounded-xl border border-slate-200 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-mono font-bold text-[#0F9D8A]">{inv.invoiceNumber}</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      inv.status === 'paid'
                        ? 'bg-[#E8F7F3] text-[#0F9D8A] border border-[#0F9D8A]/30'
                        : 'bg-amber-50 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {inv.status.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-1">
                  {inv.items.map((it) => (
                    <div key={it.id} className="flex justify-between text-[#536B7E]">
                      <span>{it.description}</span>
                      <span className="font-mono text-[#243746] font-bold">₹{it.amount}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm">
                  <span className="text-[#243746]">Total Amount</span>
                  <span className="font-mono text-[#0F9D8A]">₹{inv.totalAmount}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* RADIOLOGY SCAN LIGHTBOX MODAL */}
      {viewingScan && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden border border-slate-200 shadow-2xl space-y-4 p-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-[#0F9D8A]">
                  CareOS PACS Imaging Server
                </span>
                <h4 className="text-sm font-bold text-[#243746]">{viewingScan.testName}</h4>
              </div>
              <button
                onClick={() => setViewingScan(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-black rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
              <img
                src={viewingScan.scanImageUrl}
                alt={viewingScan.testName}
                className="max-h-[60vh] object-contain w-full"
              />
            </div>

            <div className="bg-[#F8FCFB] p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              {viewingScan.findings && (
                <p className="text-[#243746]">
                  <strong>Findings:</strong> {viewingScan.findings}
                </p>
              )}
              {viewingScan.impression && (
                <p className="text-[#0F9D8A] font-semibold">
                  <strong>Impression:</strong> {viewingScan.impression}
                </p>
              )}
              {viewingScan.verifiedBy && (
                <span className="text-[10px] text-[#536B7E] block pt-1">
                  Electronically Verified &amp; Signed by: {viewingScan.verifiedBy}
                </span>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setViewingScan(null)}
                className="px-4 py-1.5 bg-[#0F9D8A] text-white rounded text-xs font-bold cursor-pointer"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
