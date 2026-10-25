import React, { useState } from 'react';
import {
  Stethoscope,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  FileText,
  FlaskConical,
  Volume2,
  Play,
  Activity,
  AlertCircle,
  Download,
  Image as ImageIcon,
  Eye,
  X,
  Pill,
} from 'lucide-react';
import { useCareOS } from '../../services/store';
import { QueueEntry, PriorityClass } from '../../types/hospital';
import { PRIORITY_WEIGHTS } from '../../services/queueEngine';

export const CareDoctor: React.FC = () => {
  const {
    doctors,
    activeDoctorId,
    setActiveDoctorId,
    queueEntries,
    prescriptions,
    diagnosticOrders,
    callNextPatient,
    startConsultation,
    completeConsultation,
    declareDoctorDelay,
  } = useCareOS();

  const doctor = doctors.find((d) => d.id === activeDoctorId) || doctors[0];

  // Active Doctor's queue
  const doctorQueue = queueEntries.filter((q) => q.doctorId === doctor.id);
  const activePatient = doctorQueue.find((q) => q.state === 'IN_CONSULTATION');
  const calledPatient = doctorQueue.find((q) => q.state === 'CALLED');
  const waitingPatients = doctorQueue
    .filter((q) => q.state === 'WAITING')
    .sort((a, b) => b.priorityScore - a.priorityScore);

  // Clinical Consultation Form state
  const [diagnosis, setDiagnosis] = useState('Mild Sinus Tachycardia & Stage-1 Hypertension');
  const [clinicalNotes, setClinicalNotes] = useState(
    'Patient presents with exertional palpitations and mild morning headaches for 2 weeks. Advised low-sodium DASH diet, moderate aerobic exercise, and stress reduction.'
  );
  const [vitals, setVitals] = useState({
    bp: '138/88 mmHg',
    pulse: 84,
    temperature: 98.6,
    spo2: 99,
    weight: 72,
  });
  const [medications, setMedications] = useState<
    Array<{
      drugName: string;
      dosage: string;
      frequency: string;
      duration: string;
      route: string;
      instructions: string;
    }>
  >([
    {
      drugName: 'Amlodipine Besylate 5mg',
      dosage: '5 mg',
      frequency: '1-0-0 (Morning)',
      duration: '30 Days',
      route: 'Oral',
      instructions: 'After breakfast with water',
    },
    {
      drugName: 'Metoprolol Tartrate 25mg',
      dosage: '25 mg',
      frequency: '1-0-1 (Morning & Night)',
      duration: '15 Days',
      route: 'Oral',
      instructions: 'Check pulse before intake',
    },
  ]);

  const [orderedDiagnostics, setOrderedDiagnostics] = useState<
    Array<{
      department: 'Radiology' | 'Laboratory';
      testName: string;
      urgency: 'routine' | 'urgent' | 'stat';
      cost: number;
    }>
  >([
    {
      department: 'Radiology',
      testName: 'Digital Chest X-Ray PA View',
      urgency: 'routine',
      cost: 550,
    },
    {
      department: 'Laboratory',
      testName: 'Lipid Profile & Serum Creatinine',
      urgency: 'routine',
      cost: 800,
    },
  ]);

  // Active patient's diagnostic investigations and imaging
  const patientDiagnostics = activePatient
    ? diagnosticOrders.filter((d) => d.patientId === activePatient.patientId)
    : [];

  const [isFinalized, setIsFinalized] = useState(false);

  // Interactive Add Medication Form State
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [newMedData, setNewMedData] = useState({
    drugName: '',
    dosage: '500 mg',
    frequency: '1-0-1 (Post meals)',
    duration: '5 Days',
    route: 'Oral',
    instructions: 'Take after meals with water',
  });

  // Lightbox scan viewer state
  const [viewingScan, setViewingScan] = useState<DiagnosticOrder | null>(null);

  const handleOpenAddMed = () => {
    setShowAddMedModal(true);
  };

  const handleSaveNewMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedData.drugName.trim()) return;
    setMedications([
      ...medications,
      {
        ...newMedData,
      },
    ]);
    setNewMedData({
      drugName: '',
      dosage: '500 mg',
      frequency: '1-0-1 (Post meals)',
      duration: '5 Days',
      route: 'Oral',
      instructions: 'Take after meals with water',
    });
    setShowAddMedModal(false);
  };

  const handleQuickPreset = (preset: {
    drugName: string;
    dosage: string;
    frequency: string;
    duration: string;
    route: string;
    instructions: string;
  }) => {
    setNewMedData(preset);
  };

  const handleRemoveMedication = (idx: number) => {
    setMedications(medications.filter((_, i) => i !== idx));
  };

  const handleToggleDiagnostic = (testName: string, dept: 'Radiology' | 'Laboratory', cost: number) => {
    const exists = orderedDiagnostics.some((d) => d.testName === testName);
    if (exists) {
      setOrderedDiagnostics(orderedDiagnostics.filter((d) => d.testName !== testName));
    } else {
      setOrderedDiagnostics([
        ...orderedDiagnostics,
        { department: dept, testName, urgency: 'routine', cost },
      ]);
    }
  };

  const handleFinalize = () => {
    if (!activePatient) return;

    completeConsultation(activePatient.id, {
      diagnosis,
      notes: clinicalNotes,
      vitals,
      medications,
      diagnosticOrders: orderedDiagnostics,
    });

    setIsFinalized(true);
    setTimeout(() => setIsFinalized(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Doctor Header & Room Context */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#E8F7F3] border border-[#0F9D8A]/30 flex items-center justify-center text-[#0F9D8A]">
            <Stethoscope className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#243746]">{doctor.name}</h2>
              <span className="text-[11px] font-semibold text-[#0F9D8A] bg-[#E8F7F3] px-2 py-0.5 rounded border border-[#0F9D8A]/20">
                {doctor.department}
              </span>
              <span className="text-xs text-[#536B7E] font-mono">({doctor.roomNumber})</span>
            </div>
            <p className="text-xs text-[#536B7E]">
              {doctor.specialization} · {doctor.qualifications}
            </p>
          </div>
        </div>

        {/* Doctor Switcher & Delay Controls */}
        <div className="flex items-center gap-3">
          <select
            value={activeDoctorId}
            onChange={(e) => setActiveDoctorId(e.target.value)}
            className="bg-[#F8FCFB] border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-[#243746] outline-none cursor-pointer"
            aria-label="Switch Active Doctor Workspace"
          >
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} — {d.department}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              const newDelay = doctor.delayMinutes > 0 ? 0 : 15;
              declareDoctorDelay(
                doctor.id,
                newDelay,
                newDelay > 0 ? 'Emergency procedure in Minor OT' : ''
              );
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              doctor.delayMinutes > 0
                ? 'bg-amber-50 border-amber-300 text-amber-800 font-semibold'
                : 'bg-white border-slate-200 text-[#243746] hover:bg-[#F8FCFB]'
            }`}
          >
            {doctor.delayMinutes > 0 ? `Delayed +${doctor.delayMinutes}m` : 'Declare Delay (+15m)'}
          </button>
        </div>
      </div>

      {/* Main Workspace Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Consultation Room */}
        <div className="lg:col-span-2 space-y-5">
          {activePatient ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
              {/* Active Patient Card Banner */}
              <div className="p-4 bg-[#F8FCFB] rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl font-black font-mono text-[#0F9D8A]">
                      {activePatient.token}
                    </span>
                    <span className="text-sm font-bold text-[#243746]">
                      {activePatient.patientName}
                    </span>
                    <span className="text-[10px] text-[#536B7E] font-mono">
                      (Phone: {activePatient.patientPhone})
                    </span>
                  </div>
                  <span className="text-xs text-[#0F9D8A] font-medium">
                    Priority: {PRIORITY_WEIGHTS[activePatient.priority].label} · Started at {activePatient.consultationStartTime || '09:30 AM'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleFinalize}
                    className="px-4 py-2 bg-[#0F9D8A] hover:bg-[#0B7A6B] text-white text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Consultation</span>
                  </button>
                </div>
              </div>

              {/* Vitals Strip */}
              <div>
                <h4 className="text-xs font-bold text-[#243746] uppercase tracking-wider mb-2">
                  Clinical Vitals
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                  <div className="bg-[#F8FCFB] p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-[#536B7E] block">Blood Pressure</span>
                    <input
                      type="text"
                      value={vitals.bp}
                      onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                      className="bg-transparent text-[#243746] font-mono font-bold outline-none w-full"
                    />
                  </div>
                  <div className="bg-[#F8FCFB] p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-[#536B7E] block">Pulse (bpm)</span>
                    <input
                      type="number"
                      value={vitals.pulse}
                      onChange={(e) => setVitals({ ...vitals, pulse: Number(e.target.value) })}
                      className="bg-transparent text-[#243746] font-mono font-bold outline-none w-full"
                    />
                  </div>
                  <div className="bg-[#F8FCFB] p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-[#536B7E] block">Temperature (°F)</span>
                    <input
                      type="number"
                      step={0.1}
                      value={vitals.temperature}
                      onChange={(e) => setVitals({ ...vitals, temperature: Number(e.target.value) })}
                      className="bg-transparent text-[#243746] font-mono font-bold outline-none w-full"
                    />
                  </div>
                  <div className="bg-[#F8FCFB] p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-[#536B7E] block">SpO2 (%)</span>
                    <input
                      type="number"
                      value={vitals.spo2}
                      onChange={(e) => setVitals({ ...vitals, spo2: Number(e.target.value) })}
                      className="bg-transparent text-[#243746] font-mono font-bold outline-none w-full"
                    />
                  </div>
                  <div className="bg-[#F8FCFB] p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-[#536B7E] block">Weight (kg)</span>
                    <input
                      type="number"
                      value={vitals.weight}
                      onChange={(e) => setVitals({ ...vitals, weight: Number(e.target.value) })}
                      className="bg-transparent text-[#243746] font-mono font-bold outline-none w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Diagnosis & Clinical Notes */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-[#243746] block mb-1">
                    Diagnosis / Clinical Impression
                  </label>
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className="w-full bg-[#F8FCFB] border border-slate-200 rounded-lg p-2.5 text-xs text-[#243746] outline-none focus:border-[#0F9D8A]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#243746] block mb-1">
                    Clinical Findings &amp; Examination Notes
                  </label>
                  <textarea
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    rows={2}
                    className="w-full bg-[#F8FCFB] border border-slate-200 rounded-lg p-2.5 text-xs text-[#243746] outline-none focus:border-[#0F9D8A] resize-none"
                  />
                </div>
              </div>

              {/* Structured e-Prescription */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#243746] uppercase tracking-wider">
                    Structured e-Prescription (CarePharmacy)
                  </h4>
                  <button
                    onClick={handleOpenAddMed}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-[#E8F7F3] hover:bg-[#D4F1EA] text-[#0F9D8A] border border-[#0F9D8A]/30 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Medication</span>
                  </button>
                </div>

                {/* Interactive Medication Input Form */}
                {showAddMedModal && (
                  <div className="p-4 bg-white rounded-xl border-2 border-[#0F9D8A]/40 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <Pill className="w-4 h-4 text-[#0F9D8A]" />
                        <span className="font-bold text-xs text-[#243746]">
                          Add New Medication to Prescription
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddMedModal(false)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quick Preset Selector Chips */}
                    <div>
                      <span className="text-[10px] font-bold text-[#536B7E] uppercase tracking-wider block mb-1">
                        Quick Clinical Presets:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { drugName: 'Atorvastatin 20mg', dosage: '20 mg', frequency: '0-0-1 (Night)', duration: '30 Days', route: 'Oral', instructions: 'After dinner at bedtime' },
                          { drugName: 'Metformin 500mg ER', dosage: '500 mg', frequency: '1-0-1 (Post meals)', duration: '30 Days', route: 'Oral', instructions: 'Post meals with water' },
                          { drugName: 'Amoxicillin 500mg', dosage: '500 mg', frequency: '1-1-1 (TID)', duration: '7 Days', route: 'Oral', instructions: 'Complete full antibiotic course' },
                          { drugName: 'Pantoprazole 40mg', dosage: '40 mg', frequency: '1-0-0 (Morning AC)', duration: '14 Days', route: 'Oral', instructions: '30 mins before breakfast' },
                          { drugName: 'Paracetamol 650mg Dolo', dosage: '650 mg', frequency: '1-0-1 (SOS)', duration: '5 Days', route: 'Oral', instructions: 'For pain or fever >100°F' },
                          { drugName: 'Telmisartan 40mg', dosage: '40 mg', frequency: '1-0-0 (Morning)', duration: '30 Days', route: 'Oral', instructions: 'Morning post breakfast' },
                        ].map((p, i) => (
                          <button
                            type="button"
                            key={i}
                            onClick={() => handleQuickPreset(p)}
                            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-[#E8F7F3] hover:text-[#0F9D8A] text-[10px] font-medium text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                          >
                            + {p.drugName}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Input Fields */}
                    <form onSubmit={handleSaveNewMedication} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 text-xs">
                        <div className="sm:col-span-4">
                          <label className="text-[11px] font-bold text-[#243746] block mb-1">
                            Drug Name &amp; Strength *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Atorvastatin 20mg"
                            value={newMedData.drugName}
                            onChange={(e) => setNewMedData({ ...newMedData, drugName: e.target.value })}
                            className="w-full bg-[#F8FCFB] border border-slate-200 rounded-lg p-2 text-[#243746] font-semibold outline-none focus:border-[#0F9D8A]"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-[11px] font-bold text-[#243746] block mb-1">
                            Dosage
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 20 mg"
                            value={newMedData.dosage}
                            onChange={(e) => setNewMedData({ ...newMedData, dosage: e.target.value })}
                            className="w-full bg-[#F8FCFB] border border-slate-200 rounded-lg p-2 text-[#243746] outline-none focus:border-[#0F9D8A]"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-[11px] font-bold text-[#243746] block mb-1">
                            Route
                          </label>
                          <select
                            value={newMedData.route}
                            onChange={(e) => setNewMedData({ ...newMedData, route: e.target.value })}
                            className="w-full bg-[#F8FCFB] border border-slate-200 rounded-lg p-2 text-[#243746] outline-none focus:border-[#0F9D8A] cursor-pointer"
                          >
                            <option value="Oral">Oral</option>
                            <option value="IV">IV</option>
                            <option value="IM">IM</option>
                            <option value="Sublingual">Sublingual</option>
                            <option value="Inhalation">Inhalation</option>
                            <option value="Topical">Topical</option>
                          </select>
                        </div>

                        <div className="sm:col-span-4">
                          <label className="text-[11px] font-bold text-[#243746] block mb-1">
                            Frequency
                          </label>
                          <select
                            value={newMedData.frequency}
                            onChange={(e) => setNewMedData({ ...newMedData, frequency: e.target.value })}
                            className="w-full bg-[#F8FCFB] border border-slate-200 rounded-lg p-2 text-[#243746] outline-none focus:border-[#0F9D8A] cursor-pointer"
                          >
                            <option value="1-0-0 (Morning Once Daily)">1-0-0 (Morning Once Daily)</option>
                            <option value="1-0-1 (Morning & Night Post Meals)">1-0-1 (Morning &amp; Night Post Meals)</option>
                            <option value="0-0-1 (Night Bedtime HS)">0-0-1 (Night Bedtime HS)</option>
                            <option value="1-1-1 (Three Times Daily TID)">1-1-1 (Three Times Daily TID)</option>
                            <option value="SOS (As Needed for Pain/Fever)">SOS (As Needed for Pain/Fever)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                        <div>
                          <label className="text-[11px] font-bold text-[#243746] block mb-1">
                            Duration
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 5 Days / 30 Days"
                            value={newMedData.duration}
                            onChange={(e) => setNewMedData({ ...newMedData, duration: e.target.value })}
                            className="w-full bg-[#F8FCFB] border border-slate-200 rounded-lg p-2 text-[#243746] outline-none focus:border-[#0F9D8A]"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-[#243746] block mb-1">
                            Instructions
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Post meals with full glass of water"
                            value={newMedData.instructions}
                            onChange={(e) => setNewMedData({ ...newMedData, instructions: e.target.value })}
                            className="w-full bg-[#F8FCFB] border border-slate-200 rounded-lg p-2 text-[#243746] outline-none focus:border-[#0F9D8A]"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAddMedModal(false)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-[#536B7E] hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-lg bg-[#0F9D8A] hover:bg-[#0B7A6B] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                        >
                          Add to Prescription
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="space-y-2">
                  {medications.map((med, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#F8FCFB] rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs items-center"
                    >
                      <div className="sm:col-span-4">
                        <span className="text-[10px] text-[#536B7E] block">Medication &amp; Strength</span>
                        <input
                          type="text"
                          value={med.drugName}
                          onChange={(e) => {
                            const updated = [...medications];
                            updated[idx].drugName = e.target.value;
                            setMedications(updated);
                          }}
                          className="bg-transparent text-[#243746] font-semibold outline-none w-full"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <span className="text-[10px] text-[#536B7E] block">Frequency</span>
                        <input
                          type="text"
                          value={med.frequency}
                          onChange={(e) => {
                            const updated = [...medications];
                            updated[idx].frequency = e.target.value;
                            setMedications(updated);
                          }}
                          className="bg-transparent text-[#243746] outline-none w-full"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-[10px] text-[#536B7E] block">Duration</span>
                        <input
                          type="text"
                          value={med.duration}
                          onChange={(e) => {
                            const updated = [...medications];
                            updated[idx].duration = e.target.value;
                            setMedications(updated);
                          }}
                          className="bg-transparent text-[#243746] outline-none w-full"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-[10px] text-[#536B7E] block">Instructions</span>
                        <input
                          type="text"
                          value={med.instructions}
                          onChange={(e) => {
                            const updated = [...medications];
                            updated[idx].instructions = e.target.value;
                            setMedications(updated);
                          }}
                          className="bg-transparent text-[#536B7E] text-[11px] outline-none w-full"
                        />
                      </div>
                      <div className="sm:col-span-1 text-right">
                        <button
                          onClick={() => handleRemoveMedication(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Diagnostics */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-[#243746] uppercase tracking-wider">
                  Order Diagnostic Investigations
                </h4>
                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    { name: 'Digital Chest X-Ray PA View', dept: 'Radiology' as const, cost: 550 },
                    { name: 'X-Ray Both Knees AP/Lat', dept: 'Radiology' as const, cost: 950 },
                    { name: 'Brain MRI Non-Contrast', dept: 'Radiology' as const, cost: 3500 },
                    { name: 'Lipid Profile & Serum Creatinine', dept: 'Laboratory' as const, cost: 800 },
                    { name: 'Complete Blood Picture (CBC)', dept: 'Laboratory' as const, cost: 450 },
                    { name: 'HbA1c Glycated Hemoglobin', dept: 'Laboratory' as const, cost: 600 },
                  ].map((test) => {
                    const isSelected = orderedDiagnostics.some((d) => d.testName === test.name);
                    return (
                      <button
                        key={test.name}
                        onClick={() => handleToggleDiagnostic(test.name, test.dept, test.cost)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#E8F7F3] border-[#0F9D8A] text-[#0F9D8A] font-semibold'
                            : 'bg-[#F8FCFB] border-slate-200 text-[#243746] hover:border-[#0F9D8A]/40'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {test.name} (₹{test.cost})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Synchronized Radiology Scans & Lab Results for this Patient */}
              {patientDiagnostics.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#243746] uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#0F9D8A]" />
                      <span>Synchronized Diagnostic Imaging &amp; Lab Reports</span>
                    </h4>
                    <span className="text-[10px] text-[#0F9D8A] font-mono font-bold bg-[#E8F7F3] px-2 py-0.5 rounded border border-[#0F9D8A]/20">
                      Live PACS/RIS Sync
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {patientDiagnostics.map((diag) => (
                      <div
                        key={diag.id}
                        className="p-3 bg-[#F8FCFB] rounded-xl border border-slate-200 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#243746]">{diag.testName}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              diag.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {diag.status.toUpperCase()}
                          </span>
                        </div>

                        {diag.findings && (
                          <p className="text-[11px] text-[#536B7E] line-clamp-2 italic">
                            "{diag.findings}"
                          </p>
                        )}

                        {diag.scanImageUrl ? (
                          <div className="flex items-center gap-2 pt-1">
                            <img
                              src={diag.scanImageUrl}
                              alt={diag.testName}
                              className="w-14 h-14 object-cover rounded-lg border border-slate-200 cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => setViewingScan(diag)}
                            />
                            <div className="flex-1">
                              <span className="text-[10px] text-[#536B7E] block">
                                Verified by {diag.verifiedBy}
                              </span>
                              <button
                                type="button"
                                onClick={() => setViewingScan(diag)}
                                className="mt-1 text-[11px] font-bold text-[#0F9D8A] hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Inspect Full Radiology Scan</span>
                              </button>
                            </div>
                          </div>
                        ) : diag.status === 'completed' ? (
                          <span className="text-[10px] text-slate-500 block">
                            Signed off by {diag.verifiedBy}
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-600 block">
                            Sample in processing suite
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-[#536B7E]">
                  Completing consultation automatically dispatches orders and updates patient billing.
                </span>
                <button
                  onClick={handleFinalize}
                  className="px-5 py-2.5 bg-[#0F9D8A] hover:bg-[#0B7A6B] text-white text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Finalize &amp; Advance Queue</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-8 text-center space-y-4">
              <Stethoscope className="w-12 h-12 text-[#0F9D8A]/40 mx-auto" />
              <div>
                <h3 className="text-base font-bold text-[#243746] mb-1">
                  Ready for Next Patient
                </h3>
                <p className="text-xs text-[#536B7E] max-w-md mx-auto">
                  No active consultation in {doctor.roomNumber}. Call the next patient from the waiting queue to begin clinical intake.
                </p>
              </div>

              {calledPatient ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl inline-block max-w-sm">
                  <span className="text-xs text-amber-800 font-bold block mb-1">
                    Currently Called to Door:
                  </span>
                  <div className="text-lg font-black font-mono text-amber-900">
                    {calledPatient.token} · {calledPatient.patientName}
                  </div>
                  <button
                    onClick={() => startConsultation(calledPatient.id)}
                    className="mt-3 px-4 py-2 bg-[#0F9D8A] hover:bg-[#0B7A6B] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    Start Consultation Room
                  </button>
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => callNextPatient(doctor.id)}
                    disabled={waitingPatients.length === 0}
                    className="px-5 py-2.5 bg-[#0F9D8A] hover:bg-[#0B7A6B] disabled:opacity-40 text-white text-xs font-bold rounded-lg transition-colors shadow-xs inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Call Next Patient ({waitingPatients.length} Waiting)</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Doctor's Specific Queue */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#536B7E] uppercase tracking-wider">
              {doctor.name}'s Queue ({waitingPatients.length})
            </h3>
            <button
              onClick={() => callNextPatient(doctor.id)}
              disabled={waitingPatients.length === 0}
              className="text-xs text-[#0F9D8A] font-semibold hover:underline disabled:opacity-40 cursor-pointer"
            >
              Call Next
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-3 space-y-2 max-h-[600px] overflow-y-auto">
            {waitingPatients.length === 0 ? (
              <p className="text-xs text-[#536B7E] py-6 text-center">
                All scheduled patients have been completed.
              </p>
            ) : (
              waitingPatients.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 bg-[#F8FCFB] rounded-lg border border-slate-200 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-[#0F9D8A]">
                      {entry.token}
                    </span>
                    <span className="font-mono text-xs text-[#243746] font-semibold tabular-nums">
                      ~{entry.estimatedWaitMinutes}m wait
                    </span>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#243746]">{entry.patientName}</h5>
                    <span className="text-[10px] text-[#536B7E] block">
                      ETA: {entry.expectedStartTime} ({entry.confidenceRange})
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 text-[10px]">
                    <span
                      className={`px-1.5 py-0.5 rounded border ${
                        entry.priority === 'P1_EMERGENCY'
                          ? 'bg-rose-50 border-rose-300 text-rose-700'
                          : entry.priority === 'P2_TIME_SENSITIVE' || entry.priority === 'P2A_ASSISTANCE'
                          ? 'bg-amber-50 border-amber-300 text-amber-700'
                          : 'bg-[#E8F7F3] border-[#0F9D8A]/30 text-[#0F9D8A]'
                      }`}
                    >
                      {entry.priority.split('_')[0]}
                    </span>
                    <button
                      onClick={() => startConsultation(entry.id)}
                      className="text-[#0F9D8A] hover:underline font-bold cursor-pointer"
                    >
                      Fast-Track Start
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Diagnostic Imaging Viewer */}
      {viewingScan && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 bg-[#E8F7F3]/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#0F9D8A]" />
                <div>
                  <h3 className="font-bold text-sm text-[#243746]">{viewingScan.testName}</h3>
                  <span className="text-[11px] text-[#536B7E] font-mono">
                    Ref: {viewingScan.orderNumber} · Patient: {viewingScan.patientName}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewingScan(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-[#243746] hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {viewingScan.scanImageUrl && (
                <div className="bg-black rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center p-2">
                  <img
                    src={viewingScan.scanImageUrl}
                    alt={viewingScan.testName}
                    className="max-h-96 w-auto object-contain rounded-lg shadow-md"
                  />
                </div>
              )}

              <div className="space-y-2 bg-[#F8FCFB] p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="font-bold text-[#243746] block text-[11px] uppercase tracking-wide">
                    Radiologist Findings:
                  </span>
                  <p className="text-slate-700 mt-1 leading-relaxed">
                    {viewingScan.findings || 'No formal findings logged yet.'}
                  </p>
                </div>

                {viewingScan.impression && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="font-bold text-[#0F9D8A] block text-[11px] uppercase tracking-wide">
                      Clinical Impression:
                    </span>
                    <p className="text-slate-800 font-medium mt-0.5">
                      {viewingScan.impression}
                    </p>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-[#536B7E]">
                  <span>Verified &amp; Digitally Signed by: <strong>{viewingScan.verifiedBy}</strong></span>
                  <span className="font-mono">{viewingScan.completedAt || '09:22 AM'}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setViewingScan(null)}
                className="px-4 py-1.5 bg-[#0F9D8A] text-white text-xs font-bold rounded-lg hover:bg-[#0B7A6B] cursor-pointer"
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
