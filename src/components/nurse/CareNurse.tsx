import React, { useState } from 'react';
import {
  HeartPulse,
  BedDouble,
  CheckCircle2,
  Clock,
  Plus,
  AlertTriangle,
  User,
  Activity,
  ClipboardList,
} from 'lucide-react';
import { useCareOS } from '../../services/store';

export const CareNurse: React.FC = () => {
  const { beds, nursingTasks, completeNursingTask, addNursingTask, patients } = useCareOS();

  const [nurseName] = useState('Sister Anitha, RN');
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskPatientId, setTaskPatientId] = useState(patients[0]?.id || '');
  const [taskBed, setTaskBed] = useState('ICU-01');
  const [taskType, setTaskType] = useState<'vitals' | 'iv_fluid' | 'medication' | 'wound_dressing'>('vitals');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDueTime, setTaskDueTime] = useState('10:30 AM');

  const pendingTasks = nursingTasks.filter((t) => t.status !== 'completed');
  const completedTasks = nursingTasks.filter((t) => t.status === 'completed');

  const occupiedBeds = beds.filter((b) => b.status === 'occupied').length;
  const availableBeds = beds.filter((b) => b.status === 'available').length;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === taskPatientId);
    if (!pat) return;

    addNursingTask({
      patientId: pat.id,
      patientName: pat.name,
      bedNumber: taskBed,
      taskType,
      description: taskDescription || `Routine ${taskType} check`,
      dueTime: taskDueTime,
    });

    setShowAddTask(false);
    setTaskDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#E8F7F3] border border-[#0F9D8A]/30 flex items-center justify-center text-[#0F9D8A]">
            <HeartPulse className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#243746]">CareNurse — Nursing &amp; Ward Station</h2>
              <span className="text-xs text-[#536B7E] font-mono">({nurseName})</span>
            </div>
            <p className="text-xs text-[#536B7E]">
              Inpatient bed tracking, medication administration schedules, and clinical bedside care execution.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddTask(true)}
          className="px-4 py-2 bg-[#0F9D8A] hover:bg-[#0B7A6B] text-white text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Assign Nursing Task</span>
        </button>
      </div>

      {/* Bed Status Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <h3 className="font-bold text-[#243746] uppercase tracking-wider">
            Ward &amp; ICU Bed Occupancy ({occupiedBeds}/{beds.length} Occupied)
          </h3>
          <div className="flex items-center gap-4 text-[#536B7E]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Occupied ({occupiedBeds})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available ({availableBeds})
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-xs">
          {beds.map((bed) => {
            const isOcc = bed.status === 'occupied';
            const isClean = bed.status === 'cleaning';
            return (
              <div
                key={bed.id}
                className={`p-3 rounded-xl border flex flex-col justify-between shadow-xs ${
                  isOcc
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : isClean
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-white border-slate-200 text-[#536B7E]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-sm text-[#243746]">{bed.bedNumber}</span>
                  <BedDouble
                    className={`w-4 h-4 ${
                      isOcc ? 'text-rose-500' : isClean ? 'text-amber-500' : 'text-emerald-500'
                    }`}
                  />
                </div>
                <div>
                  <span className="text-[10px] text-[#536B7E] block">{bed.ward}</span>
                  {bed.patientName ? (
                    <span className="text-[#243746] font-bold block truncate text-[11px]">
                      {bed.patientName}
                    </span>
                  ) : (
                    <span className="text-emerald-700 text-[11px] font-bold">Vacant</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Nursing Care Tasks Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Tasks */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
            <span className="font-bold text-[#243746] uppercase tracking-wider flex items-center gap-1.5">
              <ClipboardList className="w-4 h-4 text-[#0F9D8A]" />
              Scheduled Care Tasks ({pendingTasks.length})
            </span>
            <span className="text-[#536B7E] font-mono">Shift: 08:00 - 16:00</span>
          </div>

          <div className="space-y-2.5">
            {pendingTasks.length === 0 ? (
              <p className="text-xs text-[#536B7E] py-6 text-center">
                All scheduled nursing tasks for this shift have been fulfilled.
              </p>
            ) : (
              pendingTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3 bg-[#F8FCFB] rounded-lg border border-slate-200 text-xs flex items-center justify-between gap-3 shadow-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-[#243746]">{t.patientName}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#E8F7F3] text-[#0F9D8A] font-semibold border border-[#0F9D8A]/20">
                        {t.bedNumber}
                      </span>
                      <span className="text-[10px] text-[#536B7E] font-mono">Due: {t.dueTime}</span>
                    </div>
                    <p className="text-[#536B7E] text-[11px]">{t.description}</p>
                  </div>

                  <button
                    onClick={() => completeNursingTask(t.id, nurseName)}
                    className="px-3 py-1.5 bg-[#0F9D8A] hover:bg-[#0B7A6B] text-white text-xs font-bold rounded transition-colors shadow-xs shrink-0 cursor-pointer"
                  >
                    Mark Done
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Shift Completed Log */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
            <span className="font-bold text-[#536B7E] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Completed Nursing Actions ({completedTasks.length})
            </span>
          </div>

          <div className="space-y-2">
            {completedTasks.map((t) => (
              <div
                key={t.id}
                className="p-2.5 bg-[#F8FCFB] rounded-lg border border-slate-200 text-xs flex items-center justify-between text-[#536B7E]"
              >
                <div>
                  <span className="text-[#243746] font-semibold block">
                    {t.patientName} ({t.bedNumber})
                  </span>
                  <span className="text-[11px] text-[#536B7E]">{t.description}</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-700 font-semibold text-[11px] block">✓ Completed</span>
                  <span className="text-[10px] text-[#536B7E]">{t.completedBy || 'Sister Anitha'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-[#243746]">Assign Nursing Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="text-[#243746] font-semibold block mb-1">Patient</label>
                <select
                  value={taskPatientId}
                  onChange={(e) => setTaskPatientId(e.target.value)}
                  className="w-full bg-[#F8FCFB] border border-slate-200 rounded p-2 text-[#243746] outline-none focus:border-[#0F9D8A]"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.uhid})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[#243746] font-semibold block mb-1">Bed / Station</label>
                <select
                  value={taskBed}
                  onChange={(e) => setTaskBed(e.target.value)}
                  className="w-full bg-[#F8FCFB] border border-slate-200 rounded p-2 text-[#243746] outline-none focus:border-[#0F9D8A]"
                >
                  {beds.map((b) => (
                    <option key={b.id} value={b.bedNumber}>
                      {b.bedNumber} ({b.ward})
                    </option>
                  ))}
                  <option value="OPD Triage">OPD Triage</option>
                </select>
              </div>

              <div>
                <label className="text-[#243746] font-semibold block mb-1">Task Type</label>
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value as any)}
                  className="w-full bg-[#F8FCFB] border border-slate-200 rounded p-2 text-[#243746] outline-none focus:border-[#0F9D8A]"
                >
                  <option value="vitals">Record Vitals / Charting</option>
                  <option value="medication">Medication Administration</option>
                  <option value="iv_fluid">IV Fluid Infusion</option>
                  <option value="wound_dressing">Wound Dressing / Cold Compress</option>
                </select>
              </div>

              <div>
                <label className="text-[#243746] font-semibold block mb-1">Instructions / Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Check BP &amp; administer oral syrup"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full bg-[#F8FCFB] border border-slate-200 rounded p-2 text-[#243746] outline-none focus:border-[#0F9D8A]"
                />
              </div>

              <div>
                <label className="text-[#243746] font-semibold block mb-1">Scheduled Due Time</label>
                <input
                  type="text"
                  value={taskDueTime}
                  onChange={(e) => setTaskDueTime(e.target.value)}
                  className="w-full bg-[#F8FCFB] border border-slate-200 rounded p-2 text-[#243746] font-mono outline-none focus:border-[#0F9D8A]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="px-3 py-1.5 rounded border border-slate-200 text-[#243746] hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0F9D8A] hover:bg-[#0B7A6B] text-white font-bold rounded cursor-pointer shadow-xs"
                >
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
