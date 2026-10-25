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

  const [isFinalized, setIsFinalized] = useState(false);

  const handleAddMedication = () => {
    setMedications([
      ...medications,
      {
        drugName: 'Paracetamol 650mg Dolo',
        dosage: '650 mg',
        frequency: '1-0-1 (As needed)',
        duration: '5 Days',
        route: 'Oral',
        instructions: 'Post meals for pain/fever',
      },
    ]);
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
                    onClick={handleAddMedication}
                    className="flex items-center gap-1 text-xs text-[#0F9D8A] font-semibold hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Medication</span>
                  </button>
                </div>

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
    </div>
  );
};
