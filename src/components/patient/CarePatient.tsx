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
} from 'lucide-react';
import { useCareOS } from '../../services/store';
import { PRIORITY_WEIGHTS } from '../../services/queueEngine';

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
  } = useCareOS();

  const [activeTab, setActiveTab] = useState<'token' | 'records' | 'bills'>('token');

  const patient = patients.find((p) => p.id === activePatientId) || patients[0];

  // Active queue entry for this patient
  const patientQueueEntry = queueEntries.find(
    (q) => q.patientId === patient.id && q.state !== 'CANCELLED'
  );

  const patientAppointments = appointments.filter((a) => a.patientId === patient.id);
  const patientPrescriptions = prescriptions.filter((p) => p.patientId === patient.id);
  const patientDiagnostics = diagnosticOrders.filter((d) => d.patientId === patient.id);
  const patientInvoices = invoices.filter((i) => i.patientId === patient.id);

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
              Age: {patient.age} · {patient.gender} · Blood: {patient.bloodGroup} · {patient.address}
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
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('token')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'token'
              ? 'bg-[#0F9D8A] text-white shadow-xs'
              : 'text-[#243746] hover:text-[#0F9D8A] hover:bg-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Live Digital Queue Token</span>
        </button>

        <button
          onClick={() => setActiveTab('records')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'records'
              ? 'bg-[#0F9D8A] text-white shadow-xs'
              : 'text-[#243746] hover:text-[#0F9D8A] hover:bg-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Medical Records &amp; Labs</span>
        </button>

        <button
          onClick={() => setActiveTab('bills')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
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
                    CareOS Outpatient Pass · NSRIT Medical Center
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

      {/* Tab 2: Medical Records */}
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
                        <span className="font-semibold text-[#243746]">
                          {m.drugName} ({m.dosage})
                        </span>
                        <span className="text-[#536B7E] font-mono">
                          {m.frequency} · {m.duration}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Diagnostic Reports Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h3 className="text-sm font-bold text-[#243746] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0F9D8A]" />
              Finalized Diagnostic Reports ({patientDiagnostics.length})
            </h3>

            {patientDiagnostics.length === 0 ? (
              <p className="text-xs text-[#536B7E] py-3">No diagnostic reports on file.</p>
            ) : (
              patientDiagnostics.map((diag) => (
                <div
                  key={diag.id}
                  className="p-4 bg-[#F8FCFB] rounded-xl border border-slate-200 space-y-2 text-xs"
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
                      {diag.status}
                    </span>
                  </div>

                  {diag.findings && (
                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-[11px] space-y-1">
                      <span className="text-[#536B7E] block font-bold">Findings:</span>
                      <p className="text-[#243746] leading-relaxed font-mono">{diag.findings}</p>
                      {diag.impression && (
                        <p className="text-[#0F9D8A] font-semibold pt-1">
                          Impression: {diag.impression}
                        </p>
                      )}
                      <span className="text-[10px] text-[#536B7E] block pt-1">
                        Verified by {diag.verifiedBy}
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
    </div>
  );
};
