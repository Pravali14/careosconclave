import React, { useState } from 'react';
import {
  X,
  Play,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCareOS } from '../../services/store';
import { NavView } from '../layout/Sidebar';

interface HackathonTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: NavView) => void;
}

export const HackathonTourModal: React.FC<HackathonTourModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const {
    declareDoctorDelay,
    setCurrentRole,
    setActiveDoctorId,
    setActivePatientId,
  } = useCareOS();

  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const STEPS = [
    {
      step: 1,
      title: 'Receptionist Registers New Patient',
      desc: 'Creates a verified synthetic patient record and generates a standardized Unique Hospital Identifier (UHID) for Visakhapatnam Medical Center.',
      targetView: 'reception' as NavView,
      role: 'receptionist' as const,
      execute: () => {
        setCurrentRole('receptionist');
        onNavigate('reception');
      },
    },
    {
      step: 2,
      title: 'Book Appointment with Conflict Detection',
      desc: 'Schedules an outpatient appointment for Cardiology with Dr. Radhika Sharma while checking provider calendar conflicts.',
      targetView: 'reception' as NavView,
      role: 'receptionist' as const,
      execute: () => {
        setCurrentRole('receptionist');
        onNavigate('reception');
      },
    },
    {
      step: 3,
      title: 'Patient Check-In & Priority Classification',
      desc: 'Patient arrives at the hospital. Reception confirms presence and checks in with priority class, creating an active queue entry.',
      targetView: 'reception' as NavView,
      role: 'receptionist' as const,
      execute: () => {
        setCurrentRole('receptionist');
        onNavigate('reception');
      },
    },
    {
      step: 4,
      title: 'Token Generation & Live Queue Insertion',
      desc: 'Unique department token (e.g. C-103) is issued with instant synchronization to the public OPD token board.',
      targetView: 'queue_live' as NavView,
      role: 'receptionist' as const,
      execute: () => {
        setCurrentRole('receptionist');
        onNavigate('queue_live');
      },
    },
    {
      step: 5,
      title: 'Deterministic Waiting-Time Prediction',
      desc: 'CareQueue calculates arrival-aware estimated wait minutes, expected start time, and uncertainty interval based on doctor service velocity.',
      targetView: 'queue_live' as NavView,
      role: 'hospital_admin' as const,
      execute: () => {
        setCurrentRole('hospital_admin');
        onNavigate('queue_live');
      },
    },
    {
      step: 6,
      title: 'Doctor Experiences an Unscheduled Delay',
      desc: 'Dr. K. V. Rao in Orthopedics declares a 15-minute emergency trauma dislocation delay in Minor OT.',
      targetView: 'queue_live' as NavView,
      role: 'doctor' as const,
      execute: () => {
        declareDoctorDelay('doc-2', 15, 'Emergency trauma dislocation reduction in minor OT');
        setCurrentRole('doctor');
        setActiveDoctorId('doc-2');
        onNavigate('queue_live');
      },
    },
    {
      step: 7,
      title: 'Queue ETAs Dynamically Recalculated',
      desc: 'CareQueue recalculates downstream patient ETAs instantly with an explainable delay rationale attached to waiting tokens.',
      targetView: 'queue_live' as NavView,
      role: 'hospital_admin' as const,
      execute: () => {
        setCurrentRole('hospital_admin');
        onNavigate('queue_live');
      },
    },
    {
      step: 8,
      title: 'CareVoice AI Communicates Revised Estimate',
      desc: 'Conversational assistant answers patient queries in English or Telugu regarding revised queue timings and doctor availability.',
      targetView: 'ai_voice' as NavView,
      role: 'patient' as const,
      execute: () => {
        setCurrentRole('patient');
        onNavigate('ai_voice');
      },
    },
    {
      step: 9,
      title: 'Doctor Calls Patient & Begins Consultation',
      desc: 'Dr. Radhika Sharma calls the patient into OPD-101 and reviews clinical vitals and chief complaints.',
      targetView: 'doctor' as NavView,
      role: 'doctor' as const,
      execute: () => {
        setCurrentRole('doctor');
        setActiveDoctorId('doc-1');
        onNavigate('doctor');
      },
    },
    {
      step: 10,
      title: 'Clinician Issues Structured Diagnostic Orders',
      desc: 'Doctor prescribes medications and orders Digital Chest X-Ray and Comprehensive Lipid Profile directly from the consultation room.',
      targetView: 'doctor' as NavView,
      role: 'doctor' as const,
      execute: () => {
        setCurrentRole('doctor');
        setActiveDoctorId('doc-1');
        onNavigate('doctor');
      },
    },
    {
      step: 11,
      title: 'Radiology Imaging Suite Receives Order',
      desc: 'Radiology department technician receives the digital order task, schedules the X-Ray examination, and uploads image findings.',
      targetView: 'diagnostics' as NavView,
      role: 'radiology' as const,
      execute: () => {
        setCurrentRole('radiology');
        onNavigate('diagnostics');
      },
    },
    {
      step: 12,
      title: 'Centralized Billing Ledger Auto-Generates Invoice',
      desc: 'Billing ledger captures consultation fee and diagnostic test charges with zero duplicate charge generation.',
      targetView: 'billing' as NavView,
      role: 'billing' as const,
      execute: () => {
        setCurrentRole('billing');
        onNavigate('billing');
      },
    },
    {
      step: 13,
      title: 'Radiologist Signs & Releases Final Report',
      desc: 'Chief Radiologist Dr. Vikramaditya Mehta reviews images, provides clinical impression, signs, and authorizes release.',
      targetView: 'diagnostics' as NavView,
      role: 'radiology' as const,
      execute: () => {
        setCurrentRole('radiology');
        onNavigate('diagnostics');
      },
    },
    {
      step: 14,
      title: 'Patient & Doctor Portals View Released Report',
      desc: 'Real-time synchronization makes the finalized diagnostic report accessible immediately on the patient mobile portal.',
      targetView: 'patient' as NavView,
      role: 'patient' as const,
      execute: () => {
        setCurrentRole('patient');
        setActivePatientId('pat-1');
        onNavigate('patient');
      },
    },
    {
      step: 15,
      title: 'Hospital Command Center & Agentic Swarm Analytics',
      desc: 'Command Center reflects live outpatient throughput, queue stability, provider utilization, and autonomous multi-agent swarm state.',
      targetView: 'admin' as NavView,
      role: 'hospital_admin' as const,
      execute: () => {
        setCurrentRole('hospital_admin');
        onNavigate('admin');
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0F9D8A', '#14B8A6', '#E8F7F3'],
        });
      },
    },
  ];

  const currentStepData = STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      const nextIdx = currentStep + 1;
      setCurrentStep(nextIdx);
      STEPS[nextIdx].execute();
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevIdx = currentStep - 1;
      setCurrentStep(prevIdx);
      STEPS[prevIdx].execute();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-[#F8FCFB] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E8F7F3] border border-[#0F9D8A]/30 flex items-center justify-center text-[#0F9D8A]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#243746]">Interactive Patient Journey Demonstration</h3>
                <span className="text-[10px] font-mono text-[#0F9D8A] bg-[#E8F7F3] px-2 py-0.5 rounded border border-[#0F9D8A]/30 font-semibold">
                  Step {currentStep + 1} of {STEPS.length}
                </span>
              </div>
              <p className="text-xs text-[#536B7E]">
                End-to-end patient care journey across hospital workspaces and CareQueue.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-[#243746] cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Content */}
        <div className="p-6 space-y-5 text-xs">
          {/* Progress bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
            <div
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
              className="bg-gradient-to-r from-[#0F9D8A] to-[#14B8A6] h-full transition-all duration-300"
            />
          </div>

          <div className="p-4 bg-[#F8FCFB] rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-[#0F9D8A] uppercase">
                Phase {Math.floor(currentStep / 3) + 1} · Role: {currentStepData.role.toUpperCase()}
              </span>
              <span className="text-[10px] text-[#536B7E] font-mono">
                Screen: {currentStepData.targetView}
              </span>
            </div>

            <h4 className="text-base font-bold text-[#243746] tracking-tight">
              {currentStepData.title}
            </h4>

            <p className="text-[#536B7E] leading-relaxed text-xs">
              {currentStepData.desc}
            </p>
          </div>

          {/* Quick Jump Step Dots */}
          <div className="flex items-center justify-between gap-1 pt-1">
            {STEPS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentStep(idx);
                  s.execute();
                }}
                className={`flex-1 h-2 rounded-full transition-colors cursor-pointer ${
                  idx === currentStep
                    ? 'bg-[#0F9D8A]'
                    : idx < currentStep
                    ? 'bg-[#0F9D8A]/50'
                    : 'bg-slate-200'
                }`}
                title={`Step ${idx + 1}: ${s.title}`}
              />
            ))}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-slate-100 bg-[#F8FCFB] flex items-center justify-between text-xs">
          <button
            onClick={() => {
              setCurrentStep(0);
              STEPS[0].execute();
            }}
            className="text-[#536B7E] hover:text-[#243746] flex items-center gap-1 cursor-pointer font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart Tour</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-[#243746] hover:bg-white disabled:opacity-40 cursor-pointer shadow-xs"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              className="px-5 py-1.5 bg-[#0F9D8A] hover:bg-[#0B7A6B] text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>{currentStep === STEPS.length - 1 ? 'Finish Tour' : 'Next Step'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
