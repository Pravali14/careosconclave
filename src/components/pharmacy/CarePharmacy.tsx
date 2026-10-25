import React, { useState } from 'react';
import {
  Pill,
  CheckCircle2,
  AlertTriangle,
  Package,
  Search,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useCareOS } from '../../services/store';

export const CarePharmacy: React.FC = () => {
  const { prescriptions, pharmacyItems, dispenseMedication } = useCareOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'dispense' | 'inventory'>('dispense');

  const pendingPrescriptions = prescriptions.filter((p) => p.status !== 'dispensed');
  const lowStockItems = pharmacyItems.filter((i) => i.stockQuantity <= i.minStockThreshold);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#E8F7F3] border border-[#0F9D8A]/30 flex items-center justify-center text-[#0F9D8A]">
            <Pill className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#243746]">CarePharmacy — Central Hospital Dispensary</h2>
              <span className="text-xs text-[#536B7E] font-mono">(Pharmacist Ravi)</span>
            </div>
            <p className="text-xs text-[#536B7E]">
              Prescription fulfillment pipeline, batch verification, and real-time inventory ledger.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#E8F7F3] p-1 rounded-lg border border-[#0F9D8A]/20">
          <button
            onClick={() => setActiveTab('dispense')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'dispense'
                ? 'bg-[#0F9D8A] text-white shadow-xs'
                : 'text-[#243746] hover:text-[#0F9D8A]'
            }`}
          >
            Dispense Queue ({pendingPrescriptions.length})
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-[#0F9D8A] text-white shadow-xs'
                : 'text-[#243746] hover:text-[#0F9D8A]'
            }`}
          >
            Stock Inventory ({pharmacyItems.length})
          </button>
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockItems.length > 0 && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs flex items-center justify-between text-amber-900 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              <strong className="font-bold">{lowStockItems.length} Medication items</strong> are currently below safe threshold levels: {lowStockItems.map((i) => `${i.name} (${i.stockQuantity})`).join(', ')}.
            </span>
          </div>
          <span className="text-[11px] font-mono text-amber-800 bg-amber-100 font-bold px-2 py-0.5 rounded border border-amber-300">
            Reorder Alert
          </span>
        </div>
      )}

      {/* Tab 1: Dispense Queue */}
      {activeTab === 'dispense' && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-[#536B7E] uppercase tracking-wider">
            Incoming OPD Prescriptions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prescriptions.map((rx) => {
              const isFullyDispensed = rx.status === 'dispensed';
              return (
                <div
                  key={rx.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4 text-xs"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <span className="font-bold text-[#243746] text-sm block">{rx.patientName}</span>
                      <span className="text-[11px] text-[#536B7E]">
                        Prescribed by {rx.doctorName} · {rx.date}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                        isFullyDispensed
                          ? 'bg-[#E8F7F3] text-[#0F9D8A] border border-[#0F9D8A]/30'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {rx.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#536B7E] block text-[11px]">Clinical Diagnosis</span>
                    <span className="text-[#243746] font-semibold">{rx.diagnosis}</span>
                  </div>

                  {/* Medications List */}
                  <div className="space-y-2">
                    <span className="text-[#536B7E] font-semibold block text-[11px]">
                      Prescribed Drug Items:
                    </span>
                    {rx.medications.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 bg-[#F8FCFB] rounded-lg border border-slate-200 flex items-center justify-between gap-2"
                      >
                        <div>
                          <span className="font-bold text-[#243746] block">{item.drugName}</span>
                          <span className="text-[10px] text-[#536B7E] font-mono">
                            {item.dosage} · {item.frequency} · {item.duration}
                          </span>
                        </div>

                        <div>
                          {item.dispensed ? (
                            <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Dispensed
                            </span>
                          ) : (
                            <button
                              onClick={() => dispenseMedication(rx.id, item.id)}
                              className="px-3 py-1 bg-[#0F9D8A] hover:bg-[#0B7A6B] text-white font-bold rounded text-[11px] transition-colors shadow-xs cursor-pointer"
                            >
                              Dispense
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-[#536B7E]">Estimated Pharmacy Bill:</span>
                    <span className="font-mono font-bold text-[#0F9D8A] text-sm">₹{rx.pharmacyCharge}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Stock Inventory */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#243746]">Medication Stock Ledger</h3>
              <p className="text-xs text-[#536B7E]">
                Track real-time quantities, reorder thresholds, and active batch expiration dates.
              </p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search medication name, code, category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#F8FCFB] border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#243746] outline-none w-64 focus:border-[#0F9D8A]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#E8F7F3]/70 text-[#243746] uppercase text-[10px] tracking-wider border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Medication Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Batch &amp; Expiry</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-right">In Stock</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pharmacyItems
                  .filter((item) => {
                    const q = searchTerm.toLowerCase();
                    return (
                      item.name.toLowerCase().includes(q) ||
                      item.code.toLowerCase().includes(q) ||
                      item.category.toLowerCase().includes(q)
                    );
                  })
                  .map((item) => {
                    const isLow = item.stockQuantity <= item.minStockThreshold;
                    return (
                      <tr key={item.id} className="hover:bg-[#F8FCFB] transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-bold text-[#243746] block">{item.name}</span>
                          <span className="text-[10px] font-mono text-[#536B7E]">{item.code}</span>
                        </td>
                        <td className="py-3 px-3 text-[#536B7E]">{item.category}</td>
                        <td className="py-3 px-3 font-mono text-[11px] text-[#536B7E]">
                          {item.batchNumber} (Exp: {item.expiryDate})
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-[#243746]">
                          ₹{item.unitPrice.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-[#243746]">
                          {item.stockQuantity}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {isLow ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                              Low Stock
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E8F7F3] text-[#0F9D8A] border border-[#0F9D8A]/20">
                              Nominal
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
