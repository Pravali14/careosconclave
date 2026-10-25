import React, { useState } from 'react';
import {
  X,
  LogIn,
  KeyRound,
  Phone,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Sparkles,
} from 'lucide-react';
import { useCareOS } from '../../services/store';
import { UserRole } from '../../types/hospital';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const {
    patients,
    activePatientId,
    setActivePatientId,
    currentRole,
    setCurrentRole,
    loginPatientByPhone,
    queueEntries,
  } = useCareOS();

  const [activeTab, setActiveTab] = useState<'patient' | 'staff'>('patient');
  const [phoneOrUhid, setPhoneOrUhid] = useState('');
  const [password, setPassword] = useState('password');
  const [selectedStaffRole, setSelectedStaffRole] = useState<UserRole>('doctor');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePatientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = loginPatientByPhone(phoneOrUhid, password);
    if (res.success && res.patient) {
      setSuccessMsg(`Welcome back, ${res.patient.name}! Navigating to your real-time Patient Dashboard.`);
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 900);
    } else {
      setErrorMsg(res.error || 'Login failed. Please check your credentials.');
    }
  };

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setCurrentRole(selectedStaffRole);
    setSuccessMsg(`Authenticated as ${selectedStaffRole.replace('_', ' ').toUpperCase()}. Session initialized.`);
    setTimeout(() => {
      onClose();
      setSuccessMsg(null);
    }, 700);
  };

  const handleFillDemoPatient = (pPhone: string, pName: string) => {
    setPhoneOrUhid(pPhone);
    setPassword('password');
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-[#E8F7F3]/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0F9D8A]/10 border border-[#0F9D8A]/20 flex items-center justify-center text-[#0F9D8A]">
              <KeyRound className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#243746]">CareOS Secure Access</h3>
              <p className="text-xs text-slate-500">
                Log in to Patient Portal or Staff Operations Workstation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#243746] hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex gap-2 text-xs">
          <button
            onClick={() => {
              setActiveTab('patient');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 px-3 rounded-lg font-bold text-center transition-all ${
              activeTab === 'patient'
                ? 'bg-[#0F9D8A] text-white shadow-xs'
                : 'text-[#536B7E] hover:bg-slate-200/60'
            }`}
          >
            Patient Portal Login
          </button>
          <button
            onClick={() => {
              setActiveTab('staff');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 px-3 rounded-lg font-bold text-center transition-all ${
              activeTab === 'staff'
                ? 'bg-[#0F9D8A] text-white shadow-xs'
                : 'text-[#536B7E] hover:bg-slate-200/60'
            }`}
          >
            Staff / Clinician Login
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-[#E8F7F3] border border-[#0F9D8A]/30 text-xs text-[#0F9D8A] font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0F9D8A] shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === 'patient' ? (
            <form onSubmit={handlePatientLogin} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#243746] block mb-1">
                  Registered Mobile Number (Username)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 98480 23112 or +91 98480 23112"
                    value={phoneOrUhid}
                    onChange={(e) => setPhoneOrUhid(e.target.value)}
                    className="w-full bg-[#F8FCFB] border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-[#243746] outline-none focus:border-[#0F9D8A]"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  You can also enter your UHID (e.g. UHID-CAREOS-2026-1001).
                </p>
              </div>

              <div>
                <label className="font-bold text-[#243746] block mb-1">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#F8FCFB] border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-[#243746] outline-none focus:border-[#0F9D8A]"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Default password for registered patients is <span className="font-mono font-bold text-[#0F9D8A]">password</span>
                </p>
              </div>

              {/* Demo Quick-Pick Chips */}
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  1-Click Demo Patient Accounts:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {patients.slice(0, 4).map((p) => {
                    const q = queueEntries.find((qe) => qe.patientId === p.id && qe.state !== 'CANCELLED');
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => handleFillDemoPatient(p.phone, p.name)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-[#E8F7F3] hover:text-[#0F9D8A] border border-slate-200 hover:border-[#0F9D8A]/30 rounded-md text-[11px] text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <User className="w-3 h-3" />
                        <span>{p.name.split(' ')[0]}</span>
                        {q && <span className="text-[9px] font-mono text-[#0F9D8A] font-bold">({q.token})</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#0F9D8A] hover:bg-[#0B7A6B] text-white font-bold rounded-lg transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In to Patient Dashboard</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleStaffLogin} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#243746] block mb-1">
                  Select Staff Persona &amp; Workstation
                </label>
                <select
                  value={selectedStaffRole}
                  onChange={(e) => setSelectedStaffRole(e.target.value as UserRole)}
                  className="w-full bg-[#F8FCFB] border border-slate-200 rounded-lg px-3 py-2 text-[#243746] outline-none focus:border-[#0F9D8A] cursor-pointer"
                >
                  <option value="doctor">Doctor — Dr. Radhika Sharma (Cardiology OPD)</option>
                  <option value="receptionist">Reception Desk — Counter 1 Check-In</option>
                  <option value="nurse">Nurse Station — Inpatient &amp; Bed Ward</option>
                  <option value="radiology">Radiology &amp; Imaging Suite</option>
                  <option value="laboratory">Laboratory &amp; Pathology Suite</option>
                  <option value="pharmacist">Pharmacy Counter &amp; Dispensing</option>
                  <option value="billing">Billing &amp; Cashier Desk</option>
                  <option value="hospital_admin">Hospital Administrator (CareAdmin)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#243746] block mb-1">
                  Security Passkey
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    defaultValue="hospital-staff-key"
                    className="w-full bg-[#F8FCFB] border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-[#243746] outline-none focus:border-[#0F9D8A]"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Single Sign-On (SSO) active for hospital staff workstations.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#0F9D8A] hover:bg-[#0B7A6B] text-white font-bold rounded-lg transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Open Workstation Console</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[10px] text-slate-400">
          CareOS Dynamic Authentication · Encrypted Role-Based Security
        </div>
      </div>
    </div>
  );
};
