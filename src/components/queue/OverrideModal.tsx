import React, { useState } from 'react';
import { X, ShieldAlert, ArrowRight, AlertCircle } from 'lucide-react';
import { QueueEntry, QueueState, PriorityClass } from '../../types/hospital';
import { useCareOS } from '../../services/store';
import { PRIORITY_WEIGHTS } from '../../services/queueEngine';

interface OverrideModalProps {
  queueEntry: QueueEntry;
  onClose: () => void;
}

export const OverrideModal: React.FC<OverrideModalProps> = ({ queueEntry, onClose }) => {
  const { doctors, applyManualOverride } = useCareOS();

  const [toState, setToState] = useState<QueueState>(queueEntry.state);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(queueEntry.doctorId);
  const [selectedPriority, setSelectedPriority] = useState<PriorityClass>(queueEntry.priority);
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSave = () => {
    if (!reason.trim()) {
      setError('Staff justification reason is strictly required for all manual queue overrides.');
      return;
    }

    applyManualOverride(
      queueEntry.id,
      toState,
      reason.trim(),
      selectedDoctorId !== queueEntry.doctorId ? selectedDoctorId : undefined,
      selectedPriority !== queueEntry.priority ? selectedPriority : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-[#F8FCFB]">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-sm font-bold text-[#243746]">Manual Queue Override &amp; Audit</h3>
              <p className="text-xs text-[#536B7E]">
                Patient: <span className="text-[#243746] font-semibold">{queueEntry.patientName}</span> ({queueEntry.token})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-[#243746] p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Current Status Banner */}
          <div className="p-3 bg-[#F8FCFB] rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[#536B7E] block text-[11px]">Current State</span>
              <span className="text-[#243746] font-bold font-mono">{queueEntry.state}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <div>
              <span className="text-[#536B7E] block text-[11px]">Assigned Doctor</span>
              <span className="text-[#243746] font-medium">{queueEntry.doctorName}</span>
            </div>
            <div>
              <span className="text-[#536B7E] block text-[11px]">Current Priority</span>
              <span className="text-[#0F9D8A] font-medium">{queueEntry.priority}</span>
            </div>
          </div>

          {/* Target Queue State */}
          <div>
            <label className="block text-[#243746] font-semibold mb-1.5">Change Queue State</label>
            <select
              value={toState}
              onChange={(e) => setToState(e.target.value as QueueState)}
              className="w-full bg-[#F8FCFB] border border-slate-200 rounded-lg px-3 py-2 text-[#243746] outline-none focus:border-[#0F9D8A]"
            >
              <option value="WAITING">WAITING (In Outpatient Waiting Hall)</option>
              <option value="CALLED">CALLED (Called into Consultation Room)</option>
              <option value="IN_CONSULTATION">IN_CONSULTATION (Actively with Doctor)</option>
              <option value="COMPLETED">COMPLETED (Consultation Finalized)</option>
              <option value="DEFERRED">DEFERRED (Patient Step-Aside / Test Pending)</option>
              <option value="NO_SHOW">NO_SHOW (Patient Absent when Called)</option>
              <option value="CANCELLED">CANCELLED (Patient Cancelled Visit)</option>
            </select>
          </div>

          {/* Reassign Doctor */}
          <div>
            <label className="block text-[#243746] font-semibold mb-1.5">Reassign to Doctor</label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full bg-[#F8FCFB] border border-slate-200 rounded-lg px-3 py-2 text-[#243746] outline-none focus:border-[#0F9D8A]"
            >
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} — {doc.department} ({doc.roomNumber})
                </option>
              ))}
            </select>
          </div>

          {/* Priority Escalation */}
          <div>
            <label className="block text-[#243746] font-semibold mb-1.5">Priority Classification</label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as PriorityClass)}
              className="w-full bg-[#F8FCFB] border border-slate-200 rounded-lg px-3 py-2 text-[#243746] outline-none focus:border-[#0F9D8A]"
            >
              {Object.entries(PRIORITY_WEIGHTS).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label} (Score: {item.score})
                </option>
              ))}
            </select>
          </div>

          {/* Mandatory Reason */}
          <div>
            <label className="block text-[#243746] font-semibold mb-1.5">
              Override Justification <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g., Patient experiencing acute hypertensive dizziness; clinical triage escalated to P1 for immediate doctor review."
              className="w-full bg-[#F8FCFB] border border-slate-200 rounded-lg p-2.5 text-[#243746] outline-none focus:border-[#0F9D8A] h-20 resize-none text-xs"
            />
          </div>

          {/* Historical Overrides */}
          {queueEntry.overrideHistory && queueEntry.overrideHistory.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-[#536B7E] block mb-1">
                Previous Audit Trail:
              </span>
              <div className="space-y-1.5 max-h-24 overflow-y-auto">
                {queueEntry.overrideHistory.map((hist, idx) => (
                  <div key={idx} className="p-2 bg-[#F8FCFB] rounded border border-slate-200 text-[11px]">
                    <span className="text-[#536B7E] font-mono">{hist.timestamp}</span> by{' '}
                    <span className="text-[#243746] font-medium">{hist.changedBy}</span>: {hist.fromState} →{' '}
                    {hist.toState} ({hist.reason})
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-[#F8FCFB] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-[#243746] hover:bg-white text-xs font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-[#0F9D8A] hover:bg-[#0B7A6B] text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            Confirm &amp; Log Audit
          </button>
        </div>
      </div>
    </div>
  );
};
