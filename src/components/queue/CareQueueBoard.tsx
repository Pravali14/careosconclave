import React, { useState } from 'react';
import {
  Activity,
  Users,
  Clock,
  AlertTriangle,
  Volume2,
  Filter,
} from 'lucide-react';
import { useCareOS } from '../../services/store';
import { QueueEntry } from '../../types/hospital';
import { PRIORITY_WEIGHTS } from '../../services/queueEngine';
import { OverrideModal } from './OverrideModal';

export const CareQueueBoard: React.FC = () => {
  const {
    doctors,
    queueEntries,
    callNextPatient,
    startConsultation,
    declareDoctorDelay,
    playAnnouncementChime,
  } = useCareOS();

  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedDocId, setSelectedDocId] = useState<string>('All');
  const [overrideTarget, setOverrideTarget] = useState<QueueEntry | null>(null);

  // Filtering
  const filteredQueue = queueEntries.filter((q) => {
    if (selectedDept !== 'All' && q.department !== selectedDept) return false;
    if (selectedDocId !== 'All' && q.doctorId !== selectedDocId) return false;
    return true;
  });

  const inConsultationList = filteredQueue.filter((q) => q.state === 'IN_CONSULTATION');
  const calledList = filteredQueue.filter((q) => q.state === 'CALLED');
  const waitingList = filteredQueue
    .filter((q) => q.state === 'WAITING')
    .sort((a, b) => {
      if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
      return a.estimatedWaitMinutes - b.estimatedWaitMinutes;
    });

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics Strip */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0F9D8A]" />
              <h2 className="text-lg font-bold text-[#243746] tracking-tight">
                CareQueue — Predictable Outpatient Queue Manager
              </h2>
            </div>
            <p className="text-xs text-[#536B7E]">
              Deterministic, capacity-aware waiting-time prediction engine with explainable delay reasoning &amp; priority scheduling.
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-[#F8FCFB] px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
              <Filter className="w-3.5 h-3.5 text-[#0F9D8A] mr-2" />
              <select
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setSelectedDocId('All');
                }}
                className="bg-transparent text-[#243746] font-medium outline-none cursor-pointer"
              >
                <option value="All">All Departments</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Neurology">Neurology</option>
              </select>
            </div>

            <div className="flex items-center bg-[#F8FCFB] px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="bg-transparent text-[#243746] font-medium outline-none cursor-pointer"
              >
                <option value="All">All Doctors</option>
                {doctors
                  .filter((d) => selectedDept === 'All' || d.department === selectedDept)
                  .map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} ({doc.department})
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Doctor Delay Declaration Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="font-semibold text-[#243746]">Staff Delay Management:</span>
            <span className="text-[#536B7E]">
              Declare clinician delays to dynamically recalculate downstream ETAs in real-time.
            </span>
          </div>

          <div className="flex items-center gap-2">
            {doctors.map((doc) => (
              <div key={doc.id} className="relative group">
                <button
                  onClick={() => {
                    const newDelay = doc.delayMinutes > 0 ? 0 : 15;
                    declareDoctorDelay(
                      doc.id,
                      newDelay,
                      newDelay > 0 ? 'Emergency trauma procedure in Minor OT' : ''
                    );
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${
                    doc.delayMinutes > 0
                      ? 'bg-amber-50 border-amber-300 text-amber-800'
                      : 'bg-[#F8FCFB] border-slate-200 text-[#243746] hover:border-[#0F9D8A]/40'
                  }`}
                >
                  <span className="font-semibold">{doc.name.replace('Dr. ', '')}</span>
                  {doc.delayMinutes > 0 ? (
                    <span className="font-mono text-amber-700 font-bold">+{doc.delayMinutes}m delay</span>
                  ) : (
                    <span className="text-[#0F9D8A] font-mono text-[10px] font-bold">On Time</span>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Active / Called Section & Live Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Currently Serving & Now Calling Showcase */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-[#536B7E] uppercase tracking-wider">
            Active Rooms &amp; Turn Calling
          </h3>

          {/* In Consultation Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
              <span className="font-bold text-[#0F9D8A] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0F9D8A] animate-ping" />
                IN CONSULTATION NOW
              </span>
              <span className="font-mono text-[#536B7E] tabular-nums font-semibold">
                {inConsultationList.length} Active
              </span>
            </div>

            {inConsultationList.length === 0 ? (
              <p className="text-xs text-[#536B7E] py-4 text-center">
                No active consultations in progress. Clinicians ready for next patient.
              </p>
            ) : (
              inConsultationList.map((entry) => (
                <div key={entry.id} className="p-3 bg-[#F8FCFB] rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black font-mono text-[#0F9D8A]">
                      {entry.token}
                    </span>
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-[#E8F7F3] text-[#0F9D8A] border border-[#0F9D8A]/20">
                      Started: {entry.consultationStartTime || 'Active'}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#243746]">{entry.patientName}</h4>
                    <p className="text-xs text-[#536B7E]">{entry.doctorName} · {entry.department}</p>
                  </div>
                  <div className="text-[11px] text-[#536B7E] pt-1 border-t border-slate-100 flex items-center justify-between">
                    <span>Priority: {PRIORITY_WEIGHTS[entry.priority].label.split(' - ')[0]}</span>
                    <button
                      onClick={() => setOverrideTarget(entry)}
                      className="text-[#0F9D8A] font-semibold hover:underline cursor-pointer"
                    >
                      Override
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Now Calling Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
              <span className="font-bold text-amber-700 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                NOW CALLING (OPD HALL)
              </span>
              <span className="font-mono text-[#536B7E] tabular-nums font-semibold">
                {calledList.length} Called
              </span>
            </div>

            {calledList.length === 0 ? (
              <div className="py-4 text-center">
                <p className="text-xs text-[#536B7E] mb-3">Next patient has not been called yet.</p>
                {selectedDocId !== 'All' && (
                  <button
                    onClick={() => callNextPatient(selectedDocId)}
                    className="w-full py-2 bg-[#0F9D8A] hover:bg-[#0B7A6B] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    Call Next Token
                  </button>
                )}
              </div>
            ) : (
              calledList.map((entry) => (
                <div key={entry.id} className="p-3 bg-amber-50/70 rounded-lg border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black font-mono text-amber-800">
                      {entry.token}
                    </span>
                    <button
                      onClick={() =>
                        playAnnouncementChime(
                          `Token ${entry.token}. ${entry.patientName}, please proceed to ${entry.doctorName}'s room.`
                        )
                      }
                      className="p-1.5 rounded bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors"
                      title="Replay Voice Announcement"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#243746]">{entry.patientName}</h4>
                    <p className="text-xs text-[#536B7E]">{entry.doctorName} ({entry.department})</p>
                  </div>
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => startConsultation(entry.id)}
                      className="flex-1 py-1.5 bg-[#0F9D8A] hover:bg-[#0B7A6B] text-white text-xs font-bold rounded transition-colors text-center cursor-pointer shadow-xs"
                    >
                      Start Consultation
                    </button>
                    <button
                      onClick={() => setOverrideTarget(entry)}
                      className="px-2.5 py-1.5 bg-white border border-slate-200 text-[#243746] hover:bg-[#F8FCFB] rounded text-xs cursor-pointer"
                    >
                      Override
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column (2 cols wide): Live Waiting Queue Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-[#536B7E] uppercase tracking-wider">
                Waiting Queue · Deterministic ETAs ({waitingList.length} Patients)
              </h3>
            </div>

            {selectedDocId !== 'All' && (
              <button
                onClick={() => callNextPatient(selectedDocId)}
                className="px-3 py-1.5 bg-[#0F9D8A] hover:bg-[#0B7A6B] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                Call Next Patient
              </button>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {waitingList.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                <p className="text-xs text-[#536B7E]">
                  No patients waiting in queue for the selected filters.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#E8F7F3]/70 text-[#243746] uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Token &amp; Patient</th>
                      <th className="py-3 px-4">Priority Class</th>
                      <th className="py-3 px-4">Doctor &amp; Room</th>
                      <th className="py-3 px-4 text-right">Predicted Wait</th>
                      <th className="py-3 px-4">Expected ETA</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {waitingList.map((entry, index) => {
                      const priorityMeta = PRIORITY_WEIGHTS[entry.priority];
                      return (
                        <tr
                          key={entry.id}
                          className="hover:bg-[#F8FCFB] transition-colors"
                        >
                          {/* Token & Patient Name */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono font-bold text-sm text-[#0F9D8A]">
                                {entry.token}
                              </span>
                              <div>
                                <span className="font-bold text-[#243746] block">
                                  {entry.patientName}
                                </span>
                                <span className="text-[10px] text-[#536B7E] font-mono">
                                  In: {entry.checkInTime} {entry.isWalkIn && '· Walk-in'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Priority */}
                          <td className="py-3 px-4">
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                                entry.priority === 'P1_EMERGENCY'
                                  ? 'bg-rose-50 border-rose-300 text-rose-700'
                                  : entry.priority === 'P2_TIME_SENSITIVE' || entry.priority === 'P2A_ASSISTANCE'
                                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                                  : 'bg-[#E8F7F3] border-[#0F9D8A]/30 text-[#0F9D8A]'
                              }`}
                              title={priorityMeta.desc}
                            >
                              {priorityMeta.label.split(' - ')[0]}
                            </span>
                          </td>

                          {/* Doctor */}
                          <td className="py-3 px-4">
                            <span className="text-[#243746] font-medium block">{entry.doctorName}</span>
                            <span className="text-[10px] text-[#536B7E]">{entry.department}</span>
                          </td>

                          {/* Wait Time */}
                          <td className="py-3 px-4 text-right font-mono tabular-nums">
                            <span
                              className={`font-bold ${
                                entry.estimatedWaitMinutes > 20
                                  ? 'text-amber-700'
                                  : 'text-emerald-700'
                              }`}
                            >
                              ~{entry.estimatedWaitMinutes} min
                            </span>
                            <span className="block text-[10px] text-[#536B7E]">
                              {entry.confidenceRange}
                            </span>
                          </td>

                          {/* Expected Start */}
                          <td className="py-3 px-4">
                            <span className="font-mono text-[#243746] font-bold block">
                              {entry.expectedStartTime}
                            </span>
                            <span className="text-[10px] text-[#536B7E] line-clamp-1" title={entry.delayReason}>
                              {entry.delayReason || 'On schedule'}
                            </span>
                          </td>

                          {/* Staff Action */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {index === 0 && (
                                <button
                                  onClick={() => {
                                    startConsultation(entry.id);
                                  }}
                                  className="px-2.5 py-1 bg-[#0F9D8A] hover:bg-[#0B7A6B] text-white text-[11px] font-bold rounded transition-colors shadow-xs cursor-pointer"
                                  title="Fast-track direct consultation"
                                >
                                  Start
                                </button>
                              )}
                              <button
                                onClick={() => setOverrideTarget(entry)}
                                className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-[#243746] text-[11px] font-medium rounded transition-colors cursor-pointer"
                                title="Manual Override (Reassign / Prioritize)"
                              >
                                Override
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Manual Override Modal */}
      {overrideTarget && (
        <OverrideModal
          queueEntry={overrideTarget}
          onClose={() => setOverrideTarget(null)}
        />
      )}
    </div>
  );
};
