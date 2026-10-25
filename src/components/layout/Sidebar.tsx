import React from 'react';
import {
  Users,
  Activity,
  Stethoscope,
  FlaskConical,
  Pill,
  CreditCard,
  Building2,
  PhoneCall,
  BarChart3,
  Sparkles,
  HeartPulse,
  UserCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useCareOS } from '../../services/store';

export type NavView =
  | 'queue_live'
  | 'queue_sim'
  | 'reception'
  | 'doctor'
  | 'diagnostics'
  | 'nurse'
  | 'pharmacy'
  | 'billing'
  | 'admin'
  | 'patient'
  | 'ai_voice'
  | 'ai_agents';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { queueEntries, diagnosticOrders, prescriptions, doctors, activeDoctorId } = useCareOS();

  const waitingCount = queueEntries.filter((q) => q.state === 'WAITING').length;
  const inConsultCount = queueEntries.filter((q) => q.state === 'IN_CONSULTATION').length;
  const pendingDiagCount = diagnosticOrders.filter((d) => d.status === 'ordered' || d.status === 'processing').length;
  const pendingRxCount = prescriptions.filter((p) => p.status !== 'dispensed').length;

  const activeDoc = doctors.find((d) => d.id === activeDoctorId) || doctors[0];

  const NAV_ITEMS: { id: NavView; label: string; icon: any; count?: number; highlight?: boolean; section: string }[] = [
    // Core Module: CareQueue
    { id: 'queue_live', label: 'Live Queue Board', icon: Activity, count: waitingCount + inConsultCount, highlight: true, section: 'CAREQUEUE (CORE)' },
    { id: 'queue_sim', label: 'Clinic-Day Simulator', icon: BarChart3, section: 'CAREQUEUE (CORE)' },

    // Clinical & Frontline Operations
    { id: 'reception', label: 'CareReception Desk', icon: UserCheck, section: 'HOSPITAL WORKSPACES' },
    { id: 'doctor', label: 'CareDoctor (OPD)', icon: Stethoscope, section: 'HOSPITAL WORKSPACES' },
    { id: 'diagnostics', label: 'Radiology & Pathology', icon: FlaskConical, count: pendingDiagCount, section: 'HOSPITAL WORKSPACES' },
    { id: 'nurse', label: 'CareNurse Station', icon: HeartPulse, section: 'HOSPITAL WORKSPACES' },
    { id: 'pharmacy', label: 'CarePharmacy Counter', icon: Pill, count: pendingRxCount, section: 'HOSPITAL WORKSPACES' },
    { id: 'billing', label: 'CareFinance (Ledger)', icon: CreditCard, section: 'HOSPITAL WORKSPACES' },
    { id: 'admin', label: 'Hospital Command & Agent Swarm', icon: Building2, section: 'HOSPITAL WORKSPACES' },
    { id: 'patient', label: 'CarePatient Portal (Mobile)', icon: Users, section: 'HOSPITAL WORKSPACES' },

    // AI & Intelligence
    { id: 'ai_voice', label: 'CareVoice AI Assistant', icon: PhoneCall, section: 'AI INTELLIGENCE' },
    { id: 'ai_agents', label: 'Multi-Agent Network', icon: Sparkles, section: 'AI INTELLIGENCE' },
  ];

  const sections = Array.from(new Set(NAV_ITEMS.map((item) => item.section)));

  return (
    <aside
      className={`bg-white border-r border-slate-200 flex flex-col transition-all duration-200 select-none shadow-xs ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {sections.map((section) => (
          <div key={section} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-[#0F9D8A] uppercase tracking-widest">
                {section}
              </div>
            )}
            {NAV_ITEMS.filter((item) => item.section === section).map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectView(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#E8F7F3] text-[#0F9D8A] font-semibold border border-[#0F9D8A]/30 shadow-xs'
                      : 'text-[#243746] hover:text-[#0F9D8A] hover:bg-[#F8FCFB] border border-transparent'
                  }`}
                  title={item.label}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-[#0F9D8A]' : item.highlight ? 'text-[#0F9D8A]' : 'text-slate-400'
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="truncate flex-1 text-left">
                      {item.label}
                    </span>
                  )}
                  {!isCollapsed && item.count !== undefined && item.count > 0 && (
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-[#0F9D8A] text-white'
                          : 'bg-[#E8F7F3] text-[#0F9D8A] border border-[#0F9D8A]/20'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Collapse Toggle & Doctor Profile Snippet */}
      <div className="p-3 border-t border-slate-100 bg-[#F8FCFB]">
        {!isCollapsed && (
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 truncate">
              <div className="w-7 h-7 rounded-full bg-[#E8F7F3] border border-[#0F9D8A]/30 flex items-center justify-center text-xs font-bold text-[#0F9D8A] shrink-0">
                {activeDoc.name.replace('Dr. ', '').charAt(0)}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-[#243746] truncate">{activeDoc.name}</p>
                <p className="text-[10px] text-[#0F9D8A] font-medium truncate">{activeDoc.department}</p>
              </div>
            </div>
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded hover:bg-slate-200/60 text-slate-400 hover:text-[#243746] transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}

        {isCollapsed && (
          <div className="flex justify-center">
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded hover:bg-slate-200/60 text-slate-400 hover:text-[#0F9D8A] transition-colors"
              title="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
