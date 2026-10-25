import React, { useState } from 'react';
import {
  FlaskConical,
  Radio,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import { useCareOS } from '../../services/store';
import { DiagnosticOrder } from '../../types/hospital';

export const CareDiagnostics: React.FC = () => {
  const { diagnosticOrders, fulfillDiagnosticOrder } = useCareOS();
  const [activeTab, setActiveTab] = useState<'Radiology' | 'Laboratory'>('Radiology');
  const [selectedOrder, setSelectedOrder] = useState<DiagnosticOrder | null>(null);

  // Form states for fulfilling/signing a report
  const [findings, setFindings] = useState('');
  const [impression, setImpression] = useState('');
  const [verifierName, setVerifierName] = useState('Dr. Vikramaditya Mehta (Chief Radiologist)');

  const filteredOrders = diagnosticOrders.filter((d) => d.department === activeTab);
  const pendingOrders = filteredOrders.filter((d) => d.status !== 'completed');
  const completedOrders = filteredOrders.filter((d) => d.status === 'completed');

  const handleOpenOrder = (ord: DiagnosticOrder) => {
    setSelectedOrder(ord);
    if (ord.department === 'Radiology') {
      setFindings(
        ord.findings ||
          'Adequate inspiratory effort. Cardiothoracic ratio is within normal limits (0.47). Both lung fields are clear of focal alveolar consolidation, pneumothorax, or pleural effusion. Bony thoracic cage and soft tissues are unremarkable.'
      );
      setImpression(ord.impression || 'Normal study with no acute cardiopulmonary abnormalities detected.');
      setVerifierName('Dr. Vikramaditya Mehta (Chief Radiologist, DMRD)');
    } else {
      setFindings(
        ord.findings ||
          'Total Cholesterol: 184 mg/dL (Desirable: <200)\nTriglycerides: 142 mg/dL (Normal: <150)\nHDL: 48 mg/dL (Optimal: >40)\nLDL: 108 mg/dL (Optimal: <100)\nSerum Creatinine: 0.9 mg/dL (Normal: 0.7 - 1.2)'
      );
      setImpression(ord.impression || 'Normal baseline lipid profile and renal function parameters.');
      setVerifierName('Dr. K. S. Rao (Chief Pathologist, MD Pathology)');
    }
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    fulfillDiagnosticOrder(selectedOrder.id, findings, impression, verifierName);
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radio className="w-5 h-5 text-[#0F9D8A]" />
            <h2 className="text-lg font-bold text-[#243746] tracking-tight">
              CareDiagnostics — Radiology &amp; Pathology Laboratory
            </h2>
          </div>
          <p className="text-xs text-[#536B7E]">
            Real-time cross-department diagnostic orders, sample tracking, and clinician report verification.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#E8F7F3] p-1 rounded-lg border border-[#0F9D8A]/20">
          <button
            onClick={() => {
              setActiveTab('Radiology');
              setSelectedOrder(null);
            }}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'Radiology'
                ? 'bg-[#0F9D8A] text-white shadow-xs'
                : 'text-[#243746] hover:text-[#0F9D8A]'
            }`}
          >
            Radiology &amp; Imaging
          </button>
          <button
            onClick={() => {
              setActiveTab('Laboratory');
              setSelectedOrder(null);
            }}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'Laboratory'
                ? 'bg-[#0F9D8A] text-white shadow-xs'
                : 'text-[#243746] hover:text-[#0F9D8A]'
            }`}
          >
            Pathology &amp; Labs
          </button>
        </div>
      </div>

      {/* Grid: Order Queue & Report Finalizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Orders Queue */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-[#536B7E] uppercase tracking-wider">
            {activeTab} Worklist ({pendingOrders.length} Pending)
          </h3>

          <div className="space-y-3">
            {pendingOrders.length === 0 ? (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs text-center text-xs text-[#536B7E]">
                All diagnostic orders in {activeTab} have been processed and signed.
              </div>
            ) : (
              pendingOrders.map((ord) => (
                <div
                  key={ord.id}
                  onClick={() => handleOpenOrder(ord)}
                  className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedOrder?.id === ord.id
                      ? 'bg-[#E8F7F3] border-[#0F9D8A] shadow-xs'
                      : 'bg-white border-slate-200 hover:border-[#0F9D8A]/40 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono font-bold text-[#0F9D8A]">{ord.orderNumber}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                        ord.urgency === 'stat'
                          ? 'bg-rose-50 text-rose-700 border border-rose-300'
                          : ord.urgency === 'urgent'
                          ? 'bg-amber-50 text-amber-700 border border-amber-300'
                          : 'bg-[#E8F7F3] text-[#0F9D8A] border border-[#0F9D8A]/30'
                      }`}
                    >
                      {ord.urgency}
                    </span>
                  </div>

                  <h4 className="font-bold text-[#243746] text-sm mb-1">{ord.testName}</h4>
                  <p className="text-[#536B7E]">Patient: <span className="text-[#243746] font-semibold">{ord.patientName}</span></p>
                  <p className="text-[11px] text-[#536B7E] mt-1">
                    Ordered by: {ord.doctorName} · {ord.orderedAt}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Completed Orders Archive */}
          {completedOrders.length > 0 && (
            <div className="pt-4 border-t border-slate-200">
              <span className="text-xs font-bold text-[#536B7E] block mb-2 uppercase">
                Completed &amp; Released ({completedOrders.length})
              </span>
              <div className="space-y-2">
                {completedOrders.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => handleOpenOrder(ord)}
                    className="p-3 bg-white rounded-lg border border-slate-200 text-xs cursor-pointer hover:border-[#0F9D8A]/40 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[#536B7E]">{ord.orderNumber}</span>
                      <span className="text-emerald-700 font-semibold text-[11px]">✓ Released</span>
                    </div>
                    <span className="text-[#243746] font-bold block truncate">{ord.testName}</span>
                    <span className="text-[10px] text-[#536B7E]">{ord.patientName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Clinical Report Verification & Sign-off */}
        <div className="lg:col-span-2">
          {selectedOrder ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs text-[#0F9D8A] font-mono font-bold block">
                    {selectedOrder.orderNumber} · {selectedOrder.department}
                  </span>
                  <h3 className="text-base font-bold text-[#243746]">{selectedOrder.testName}</h3>
                </div>

                <div className="text-right">
                  <span className="text-xs text-[#243746] block font-bold">
                    {selectedOrder.patientName}
                  </span>
                  <span className="text-[11px] text-[#536B7E]">
                    Ordered by {selectedOrder.doctorName}
                  </span>
                </div>
              </div>

              {selectedOrder.status === 'completed' ? (
                /* Read-Only Verified View */
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-[#E8F7F3] border border-[#0F9D8A]/30 rounded-lg text-[#0F9D8A] flex items-center gap-2 font-medium">
                    <ShieldCheck className="w-5 h-5 text-[#0F9D8A]" />
                    <span>
                      Report finalized and cryptographically verified by {selectedOrder.verifiedBy} at {selectedOrder.completedAt}.
                    </span>
                  </div>

                  <div>
                    <h5 className="font-bold text-[#243746] mb-1">Detailed Findings</h5>
                    <div className="p-4 bg-[#F8FCFB] rounded-lg border border-slate-200 font-mono text-[#243746] whitespace-pre-line leading-relaxed">
                      {selectedOrder.findings}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-bold text-[#243746] mb-1">Clinical Impression</h5>
                    <div className="p-3 bg-[#F8FCFB] rounded-lg border border-slate-200 text-[#243746] font-medium">
                      {selectedOrder.impression}
                    </div>
                  </div>
                </div>
              ) : (
                /* Editable Finalization Form */
                <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
                  <div>
                    <label className="text-[#243746] font-bold block mb-1">
                      Observations / Findings / Quantitative Results
                    </label>
                    <textarea
                      rows={6}
                      value={findings}
                      onChange={(e) => setFindings(e.target.value)}
                      placeholder="Enter detailed radiologic or pathological findings..."
                      className="w-full bg-[#F8FCFB] border border-slate-200 rounded-lg p-3 text-[#243746] font-mono outline-none focus:border-[#0F9D8A] leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="text-[#243746] font-bold block mb-1">
                      Summary Impression / Conclusion
                    </label>
                    <input
                      type="text"
                      value={impression}
                      onChange={(e) => setImpression(e.target.value)}
                      placeholder="e.g. Normal baseline study, No active focal pathology"
                      className="w-full bg-[#F8FCFB] border border-slate-200 rounded-lg p-2.5 text-[#243746] outline-none focus:border-[#0F9D8A]"
                    />
                  </div>

                  <div>
                    <label className="text-[#243746] font-bold block mb-1">
                      Verified &amp; Signed By (Authorized Specialist)
                    </label>
                    <input
                      type="text"
                      value={verifierName}
                      onChange={(e) => setVerifierName(e.target.value)}
                      className="w-full bg-[#F8FCFB] border border-slate-200 rounded-lg p-2.5 text-[#243746] outline-none focus:border-[#0F9D8A]"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[#536B7E] text-[11px]">
                      Cost: ₹{selectedOrder.cost} (Automatically billed to patient ledger)
                    </span>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#0F9D8A] hover:bg-[#0B7A6B] text-white font-bold rounded-lg transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Sign &amp; Release Diagnostic Report</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-12 text-center text-xs text-[#536B7E]">
              <FlaskConical className="w-10 h-10 text-[#0F9D8A]/40 mx-auto mb-2" />
              <p>Select a pending diagnostic order from the worklist to review and enter laboratory findings.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
