import React, { useState, useEffect } from 'react';
import { CareOSProvider, useCareOS } from './services/store';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavView } from './components/layout/Sidebar';
import { CareQueueBoard } from './components/queue/CareQueueBoard';
import { ClinicSimulation } from './components/queue/ClinicSimulation';
import { CareReception } from './components/reception/CareReception';
import { CareDoctor } from './components/doctor/CareDoctor';
import { CareDiagnostics } from './components/diagnostics/CareDiagnostics';
import { CareNurse } from './components/nurse/CareNurse';
import { CarePharmacy } from './components/pharmacy/CarePharmacy';
import { CareFinance } from './components/billing/CareFinance';
import { CareAdmin } from './components/admin/CareAdmin';
import { CarePatient } from './components/patient/CarePatient';
import { CareVoiceAssistant } from './components/ai/CareVoiceAssistant';
import { MultiAgentNetwork } from './components/ai/MultiAgentNetwork';
import { HackathonTourModal } from './components/demo/HackathonTourModal';
import { TestSuiteModal } from './components/tests/TestSuiteModal';

const CareOSAppContent: React.FC = () => {
  const { currentRole } = useCareOS();
  const [currentView, setCurrentView] = useState<NavView>('queue_live');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDemoTourOpen, setIsDemoTourOpen] = useState(false);
  const [isTestSuiteOpen, setIsTestSuiteOpen] = useState(false);

  // Automatically switch view when user changes role in navbar
  useEffect(() => {
    switch (currentRole) {
      case 'receptionist':
        setCurrentView('reception');
        break;
      case 'doctor':
        setCurrentView('doctor');
        break;
      case 'radiology':
      case 'laboratory':
        setCurrentView('diagnostics');
        break;
      case 'nurse':
        setCurrentView('nurse');
        break;
      case 'pharmacist':
        setCurrentView('pharmacy');
        break;
      case 'billing':
        setCurrentView('billing');
        break;
      case 'patient':
        setCurrentView('patient');
        break;
      case 'hospital_admin':
      case 'super_admin':
        if (currentView !== 'queue_live' && currentView !== 'queue_sim') {
          setCurrentView('admin');
        }
        break;
    }
  }, [currentRole]);

  return (
    <div className="min-h-screen bg-white text-[#243746] flex flex-col font-['Plus_Jakarta_Sans']">
      {/* Top Bar */}
      <Navbar
        onOpenDemoTour={() => setIsDemoTourOpen(true)}
        onOpenTestSuite={() => setIsTestSuiteOpen(true)}
      />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          currentView={currentView}
          onSelectView={setCurrentView}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Content Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F8FCFB]">
          {currentView === 'queue_live' && <CareQueueBoard />}
          {currentView === 'queue_sim' && <ClinicSimulation />}
          {currentView === 'reception' && <CareReception />}
          {currentView === 'doctor' && <CareDoctor />}
          {currentView === 'diagnostics' && <CareDiagnostics />}
          {currentView === 'nurse' && <CareNurse />}
          {currentView === 'pharmacy' && <CarePharmacy />}
          {currentView === 'billing' && <CareFinance />}
          {currentView === 'admin' && <CareAdmin />}
          {currentView === 'patient' && <CarePatient />}
          {currentView === 'ai_voice' && <CareVoiceAssistant />}
          {currentView === 'ai_agents' && <MultiAgentNetwork />}
        </main>
      </div>

      {/* Interactive Hackathon Tour Modal */}
      <HackathonTourModal
        isOpen={isDemoTourOpen}
        onClose={() => setIsDemoTourOpen(false)}
        onNavigate={(view) => setCurrentView(view)}
      />

      {/* Automated QA Test Suite Modal */}
      <TestSuiteModal
        isOpen={isTestSuiteOpen}
        onClose={() => setIsTestSuiteOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <CareOSProvider>
      <CareOSAppContent />
    </CareOSProvider>
  );
}
