import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Volume2,
  VolumeX,
  RotateCcw,
  Play,
  CheckCircle2,
  Clock,
  User,
  Activity,
  ChevronDown,
  Check,
  Shield,
  Stethoscope,
  HeartPulse,
  FlaskConical,
  Pill,
  CreditCard,
  UserCheck,
  LogIn,
} from 'lucide-react';
import { useCareOS } from '../../services/store';
import { UserRole } from '../../types/hospital';
import { LoginModal } from '../auth/LoginModal';

interface NavbarProps {
  onOpenDemoTour: () => void;
  onOpenTestSuite: () => void;
}

interface RoleOption {
  id: UserRole;
  label: string;
  badge: string;
  personName: string;
  icon: any;
}

const ROLES: RoleOption[] = [
  { id: 'hospital_admin', label: 'Hospital Admin', badge: 'Command Center', personName: 'Dr. C. Chaitanya (Medical Dir.)', icon: Shield },
  { id: 'doctor', label: 'Doctor (OPD)', badge: 'CareDoctor', personName: 'Dr. Radhika Sharma (Cardiology)', icon: Stethoscope },
  { id: 'receptionist', label: 'Receptionist', badge: 'CareReception', personName: 'Priya Sharma (Counter 1)', icon: UserCheck },
  { id: 'nurse', label: 'Nurse Station', badge: 'CareNurse', personName: 'Staff Nurse Anitha K.', icon: HeartPulse },
  { id: 'radiology', label: 'Radiology Staff', badge: 'Imaging Suite', personName: 'Tech. Suresh Babu', icon: FlaskConical },
  { id: 'laboratory', label: 'Laboratory Tech', badge: 'Pathology Lab', personName: 'Lab Tech. M. Divya', icon: FlaskConical },
  { id: 'pharmacist', label: 'Pharmacist', badge: 'CarePharmacy', personName: 'R. Ph. Jagadeesh', icon: Pill },
  { id: 'billing', label: 'Billing Officer', badge: 'CareFinance', personName: 'Accounts Exec. Naveen', icon: CreditCard },
  { id: 'patient', label: 'Patient Portal', badge: 'CarePatient', personName: 'Rajesh Varma (CARD-011)', icon: User },
];

export const Navbar: React.FC<NavbarProps> = ({ onOpenDemoTour, onOpenTestSuite }) => {
  const {
    currentRole,
    setCurrentRole,
    currentTime,
    setCurrentTime,
    soundEnabled,
    setSoundEnabled,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    queueEntries,
    doctors,
    activeDoctorId,
    activePatientId,
    patients,
    diagnosticOrders,
    beds,
    prescriptions,
    invoices,
  } = useCareOS();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const activeRoleOption = ROLES.find((r) => r.id === currentRole) || ROLES[0];
  const ActiveRoleIcon = activeRoleOption.icon;

  // Compute live queue / waiting metrics for each role
  const getRoleWaitingMetric = (roleId: UserRole): string => {
    switch (roleId) {
      case 'doctor': {
        const waitingPatients = queueEntries.filter((q) => q.doctorId === activeDoctorId && q.state === 'WAITING');
        const activeConsult = queueEntries.find((q) => q.doctorId === activeDoctorId && q.state === 'IN_CONSULTATION');
        return `${waitingPatients.length} in queue · ${activeConsult ? 'Active Now' : '~15m wait'}`;
      }
      case 'patient': {
        const patQueue = queueEntries.find((q) => q.patientId === activePatientId && q.state !== 'CANCELLED');
        if (!patQueue) return 'No active token';
        if (patQueue.state === 'IN_CONSULTATION') return `Token ${patQueue.token} · In Room`;
        if (patQueue.state === 'CALLED') return `Token ${patQueue.token} · Calling Now!`;
        return `Token ${patQueue.token} · ${patQueue.estimatedWaitMinutes}m wait`;
      }
      case 'receptionist': {
        const waitingCount = queueEntries.filter((q) => q.state === 'WAITING').length;
        return `${waitingCount} patients in waiting hall`;
      }
      case 'radiology': {
        const pendingRad = diagnosticOrders.filter((d) => d.department === 'Radiology' && d.status !== 'completed').length;
        return `${pendingRad} pending scans`;
      }
      case 'laboratory': {
        const pendingLab = diagnosticOrders.filter((d) => d.department === 'Laboratory' && d.status !== 'completed').length;
        return `${pendingLab} pending specimens`;
      }
      case 'nurse': {
        const occBeds = beds.filter((b) => b.status === 'occupied').length;
        return `${occBeds}/${beds.length} beds occupied`;
      }
      case 'pharmacist': {
        const pendingRx = prescriptions.filter((p) => p.status !== 'dispensed').length;
        return `${pendingRx} pending prescriptions`;
      }
      case 'billing': {
        const unpaidBills = invoices.filter((i) => i.status !== 'paid').length;
        return `${unpaidBills} pending settlements`;
      }
      case 'hospital_admin':
      default:
        return '6 Agents Active · Nominal';
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target as Node)) {
        setShowRoleDropdown(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAdvanceTime = () => {
    const [timePart, modifier] = currentTime.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);
    minutes += 15;
    if (minutes >= 60) {
      hours += 1;
      minutes -= 60;
    }
    let newModifier = modifier;
    if (hours === 12 && minutes === 0 && modifier === 'AM') newModifier = 'PM';
    if (hours > 12) hours -= 12;
    const newTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${newModifier}`;
    setCurrentTime(newTime);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-40 select-none shadow-xs">
      {/* Zone 1: Brand & Hospital Context */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0F9D8A] to-[#14B8A6] flex items-center justify-center shadow-sm shadow-[#0F9D8A]/20">
            <Activity className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-[#243746]">
                Care<span className="text-[#0F9D8A]">OS</span>
              </span>
              <span className="text-[11px] font-semibold text-[#0F9D8A] uppercase tracking-wider bg-[#E8F7F3] px-2 py-0.5 rounded border border-[#0F9D8A]/30">
                NSRIT · Team INNOGENIX
              </span>
            </div>
            <p className="text-[11px] text-[#536B7E] hidden md:block">
              Intelligent Healthcare Operations &amp; Multi-Agent Queue Platform
            </p>
          </div>
        </div>
      </div>

      {/* Zone 2: Simulation Controls, Tour & QA Verification */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Guided Demo Tour Trigger */}
        <button
          onClick={onOpenDemoTour}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E8F7F3] hover:bg-[#D4F1EA] text-[#0F9D8A] border border-[#0F9D8A]/30 rounded-lg text-xs font-semibold transition-all shadow-xs whitespace-nowrap"
          title="Start 15-step interactive patient journey demo"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>Interactive Tour</span>
        </button>

        {/* Test Suite Trigger */}
        <button
          onClick={onOpenTestSuite}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F8FCFB] text-[#243746] border border-slate-200 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shadow-xs"
          title="Run automated verification assertions"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-[#0F9D8A]" />
          <span>Verify Tests</span>
        </button>

        {/* Advance Hospital Clock (+15 mins) */}
        <button
          onClick={handleAdvanceTime}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-[#E8F7F3] text-[#243746] border border-slate-200 hover:border-[#0F9D8A]/40 rounded-lg text-xs font-mono font-medium transition-colors shadow-xs"
          title="Advance hospital simulation clock by +15 mins"
        >
          <Clock className="w-3.5 h-3.5 text-[#0F9D8A]" />
          <span className="tabular-nums font-semibold">{currentTime}</span>
          <span className="text-[10px] text-[#0F9D8A] font-sans font-bold bg-[#E8F7F3] px-1 rounded">+15m</span>
        </button>
      </div>

      {/* Zone 3: Audio, Alerts, Reset & Top-Right Quick Logins Dropdown */}
      <div className="flex items-center gap-2">
        {/* Sound Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2 rounded-lg border transition-colors ${
            soundEnabled
              ? 'bg-[#E8F7F3] border-[#0F9D8A]/30 text-[#0F9D8A]'
              : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
          }`}
          title={soundEnabled ? 'Audio Chime Enabled' : 'Audio Chime Muted'}
          aria-label="Toggle Sound"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Operational Notifications Drawer */}
        <div className="relative" ref={notifDropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-white border border-slate-200 text-[#243746] hover:bg-[#F8FCFB] transition-colors relative shadow-xs"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#0F9D8A]" />
                  <span className="text-xs font-bold text-[#243746] uppercase tracking-wider">
                    Operational Alerts ({notifications.length})
                  </span>
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="mt-3 max-h-72 overflow-y-auto space-y-2 pr-1">
                {notifications.length === 0 ? (
                  <p className="text-xs text-[#536B7E] py-6 text-center">
                    No active alerts. All clinical operations running nominally.
                  </p>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => markNotificationRead(item.id)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                        item.read
                          ? 'bg-slate-50/80 border-slate-200/60 text-slate-500'
                          : 'bg-[#E8F7F3]/50 border-[#0F9D8A]/30 text-[#243746]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-[#243746]">{item.title}</span>
                        <span className="text-[10px] text-[#536B7E] font-mono">{item.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-[#536B7E] leading-relaxed">{item.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Reset Demo State Button */}
        <button
          onClick={() => {
            if (window.confirm('Reset CareOS back to baseline NSRIT hospital synthetic data?')) {
              resetDemoData();
            }
          }}
          className="p-2 rounded-lg bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-400 hover:text-rose-600 transition-colors shadow-xs"
          title="Reset Demo Dataset"
          aria-label="Reset Demo Dataset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* QUICK LOGINS DROPDOWN (SMALL, TOP-RIGHT) */}
        <div className="relative" ref={roleDropdownRef}>
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 bg-[#E8F7F3] hover:bg-[#D4F1EA] border border-[#0F9D8A]/40 rounded-lg text-xs transition-all shadow-xs cursor-pointer"
            title="Quick Login: Switch user persona"
            aria-label="Quick Logins Dropdown"
          >
            <div className="w-6 h-6 rounded-md bg-[#0F9D8A] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              <ActiveRoleIcon className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-[10px] text-[#0F9D8A] font-semibold leading-none uppercase tracking-wide">
                Quick Login
              </div>
              <div className="text-xs font-bold text-[#243746] leading-tight truncate max-w-[110px]">
                {activeRoleOption.label}
              </div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-[#0F9D8A] transition-transform duration-150 ${showRoleDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50">
              <div className="px-2.5 py-2 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#243746] uppercase tracking-wider block">
                    Quick Logins &amp; Personas
                  </span>
                  <span className="text-[10px] text-[#536B7E]">
                    Switch operational role in 1-click
                  </span>
                </div>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#E8F7F3] text-[#0F9D8A]">
                  9 Roles
                </span>
              </div>

              <div className="mt-1.5 max-h-80 overflow-y-auto space-y-1 pr-1">
                {ROLES.map((role) => {
                  const Icon = role.icon;
                  const isCurrent = currentRole === role.id;
                  const waitInfo = getRoleWaitingMetric(role.id);
                  return (
                    <button
                      key={role.id}
                      onClick={() => {
                        setCurrentRole(role.id);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-[#E8F7F3] text-[#0F9D8A] font-semibold border border-[#0F9D8A]/30'
                          : 'text-[#243746] hover:bg-[#F8FCFB] hover:text-[#0F9D8A] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div
                          className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                            isCurrent
                              ? 'bg-[#0F9D8A] text-white'
                              : 'bg-slate-100 text-[#536B7E]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs leading-snug">{role.label}</span>
                          </div>
                          <p className="text-[10px] text-[#536B7E] truncate">{role.personName}</p>
                          <span className={`inline-block text-[9px] font-mono px-1.5 py-0.2 rounded mt-0.5 ${
                            isCurrent
                              ? 'bg-white/80 text-[#0F9D8A] font-bold border border-[#0F9D8A]/20'
                              : 'bg-slate-100 text-[#536B7E]'
                          }`}>
                            ⏱ {waitInfo}
                          </span>
                        </div>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-[#0F9D8A] shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>

              {/* Dedicated Login Button at the very bottom of dropdown */}
              <div className="pt-2 mt-1 border-t border-slate-100">
                <button
                  onClick={() => {
                    setShowRoleDropdown(false);
                    setShowLoginModal(true);
                  }}
                  className="w-full py-2 px-3 bg-[#0F9D8A] hover:bg-[#0B7A6B] text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-98"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login with Credentials</span>
                </button>
                <p className="text-[9px] text-[#536B7E] text-center mt-1">
                  Patient phone (password: "password") &amp; staff SSO
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </header>
  );
};
