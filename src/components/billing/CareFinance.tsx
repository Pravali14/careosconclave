import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Download,
  Search,
  DollarSign,
  Shield,
  FileCheck,
  PlusCircle,
  Trash2,
  FileText,
} from 'lucide-react';
import { useCareOS } from '../../services/store';
import { Invoice } from '../../types/hospital';

interface NewBillItem {
  id: string;
  description: string;
  department: 'OPD' | 'Radiology' | 'Pathology' | 'Pharmacy' | 'IPD' | 'Emergency';
  amount: number;
}

const BILL_PRESETS: Array<{ description: string; department: NewBillItem['department']; amount: number }> = [
  { description: 'Senior Consultant OPD Fee', department: 'OPD', amount: 600 },
  { description: 'Digital Chest X-Ray PA View', department: 'Radiology', amount: 850 },
  { description: 'Complete Blood Count (CBC) & ESR', department: 'Pathology', amount: 450 },
  { description: 'Comprehensive Metabolic Panel (CMP)', department: 'Pathology', amount: 950 },
  { description: 'Emergency Triaged Stabilization', department: 'Emergency', amount: 1200 },
  { description: 'Pharmacy Prescription Dispensing', department: 'Pharmacy', amount: 540 },
  { description: 'Daycare Bed Observation (6 Hours)', department: 'IPD', amount: 1500 },
  { description: 'ECG 12-Lead Diagnostic Tracing', department: 'OPD', amount: 350 },
];

export const CareFinance: React.FC = () => {
  const { invoices, recordPayment, patients, createInvoice } = useCareOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI/QR' | 'Credit/Debit Card' | 'Insurance'>('UPI/QR');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // New Bill Creation State
  const [showNewBillModal, setShowNewBillModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [billItems, setBillItems] = useState<NewBillItem[]>([
    { id: '1', description: 'Senior Consultant OPD Fee', department: 'OPD', amount: 600 },
  ]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [markPaidImmediately, setMarkPaidImmediately] = useState<boolean>(false);
  const [immediatePayMethod, setImmediatePayMethod] = useState<string>('UPI/QR');
  const [newBillSuccess, setNewBillSuccess] = useState<string | null>(null);

  // Financial Metrics
  const totalBilled = invoices.reduce((acc, i) => acc + i.totalAmount, 0);
  const totalCollected = invoices.reduce((acc, i) => acc + i.paidAmount, 0);
  const totalOutstanding = totalBilled - totalCollected;

  const handleOpenPayment = (inv: Invoice) => {
    setSelectedInvoice(inv);
    const balance = inv.totalAmount - inv.paidAmount;
    setPaymentAmount(balance > 0 ? balance : 0);
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || paymentAmount <= 0) return;
    recordPayment(selectedInvoice.id, paymentAmount, paymentMethod);
    setShowPaymentModal(false);
  };

  const openNewBillForPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setBillItems([
      { id: Date.now().toString(), description: 'Follow-up Clinical Service', department: 'OPD', amount: 500 },
    ]);
    setDiscountAmount(0);
    setMarkPaidImmediately(false);
    setShowNewBillModal(true);
    setSelectedInvoice(null);
  };

  const handleAddBillItem = () => {
    const newItem: NewBillItem = {
      id: Date.now().toString(),
      description: 'Medical Consultation / Investigation',
      department: 'OPD',
      amount: 400,
    };
    setBillItems([...billItems, newItem]);
  };

  const handleRemoveBillItem = (id: string) => {
    if (billItems.length === 1) return;
    setBillItems(billItems.filter((item) => item.id !== id));
  };

  const handleAddPreset = (preset: typeof BILL_PRESETS[0]) => {
    setBillItems([
      ...billItems,
      {
        id: Date.now().toString() + Math.random(),
        description: preset.description,
        department: preset.department,
        amount: preset.amount,
      },
    ]);
  };

  const handleCreateBillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === selectedPatientId) || patients[0];
    if (!patient || billItems.length === 0) return;

    const subtotal = billItems.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
    const finalTotal = Math.max(0, subtotal - discountAmount);
    const initialPaid = markPaidImmediately ? finalTotal : 0;

    const created = createInvoice(
      patient.id,
      patient.name,
      billItems.map((item) => ({
        description: item.description,
        amount: Number(item.amount) || 0,
        department: item.department,
      })),
      discountAmount,
      initialPaid,
      markPaidImmediately ? immediatePayMethod : undefined
    );

    setNewBillSuccess(`Invoice ${created.invoiceNumber} generated successfully for ${patient.name}!`);
    setTimeout(() => {
      setNewBillSuccess(null);
      setShowNewBillModal(false);
    }, 1400);
  };

  const filteredInvoices = invoices.filter((inv) => {
    const q = searchTerm.toLowerCase();
    return (
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.patientName.toLowerCase().includes(q)
    );
  });

  const billSubtotal = billItems.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
  const billTotal = Math.max(0, billSubtotal - discountAmount);

  return (
    <div className="space-y-6">
      {/* Header & Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-[#536B7E] block mb-1">Total Hospital Billing</span>
          <span className="text-2xl font-bold font-mono text-[#243746] tabular-nums">
            ₹{totalBilled.toLocaleString()}
          </span>
          <span className="text-[11px] text-[#536B7E] block mt-1">Aggregated across all clinical departments</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-[#536B7E] block mb-1">Collections Received</span>
          <span className="text-2xl font-bold font-mono text-[#0F9D8A] tabular-nums">
            ₹{totalCollected.toLocaleString()}
          </span>
          <span className="text-[11px] text-emerald-700 block mt-1 font-medium">
            {Math.round((totalCollected / (totalBilled || 1)) * 100)}% realization rate
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-[#536B7E] block mb-1">Outstanding Balances</span>
          <span className="text-2xl font-bold font-mono text-amber-700 tabular-nums">
            ₹{totalOutstanding.toLocaleString()}
          </span>
          <span className="text-[11px] text-[#536B7E] block mt-1">Pending patient settlement / TPA claim</span>
        </div>
      </div>

      {/* Main Table: Centralized Invoices */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#243746]">Centralized Billing Ledger</h3>
            <p className="text-xs text-[#536B7E]">
              Synchronized ledger capturing consultation, imaging, laboratory, and pharmacy charges.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (patients.length > 0) setSelectedPatientId(patients[0].id);
                setShowNewBillModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F9D8A] hover:bg-[#0B7A6B] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              + Create New Bill
            </button>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search invoice or patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#F8FCFB] border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#243746] outline-none w-56 focus:border-[#0F9D8A]"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#E8F7F3]/70 text-[#243746] uppercase text-[10px] tracking-wider border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Invoice Ref</th>
                <th className="py-2.5 px-3">Patient Name</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Line Items</th>
                <th className="py-2.5 px-3 text-right">Total Bill</th>
                <th className="py-2.5 px-3 text-right">Paid</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => {
                const balance = inv.totalAmount - inv.paidAmount;
                const isPaid = inv.status === 'paid';
                return (
                  <tr key={inv.id} className="hover:bg-[#F8FCFB] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#0F9D8A]">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-[#243746] block">{inv.patientName}</span>
                      {inv.insuranceClaimId && (
                        <span className="text-[10px] text-sky-700 flex items-center gap-1 font-medium">
                          <Shield className="w-3 h-3 text-sky-600" /> TPA: {inv.insuranceClaimId} ({inv.insuranceClaimStatus})
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-[#536B7E]">{inv.date}</td>
                    <td className="py-3 px-3 text-[#536B7E]">
                      {inv.items.length} items ({inv.items.map((i) => i.department).filter((v, i, a) => a.indexOf(v) === i).join(', ')})
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#243746] tabular-nums">
                      ₹{inv.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-700 font-bold tabular-nums">
                      ₹{inv.paidAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                          isPaid
                            ? 'bg-[#E8F7F3] text-[#0F9D8A] border border-[#0F9D8A]/30'
                            : inv.status === 'partially_paid'
                            ? 'bg-amber-50 text-amber-800 border border-amber-300'
                            : 'bg-rose-50 text-rose-700 border border-rose-300'
                        }`}
                      >
                        {inv.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-[#243746] rounded text-xs cursor-pointer shadow-xs font-medium"
                          title="View Itemized Breakdown"
                        >
                          View
                        </button>
                        {!isPaid && (
                          <button
                            onClick={() => handleOpenPayment(inv)}
                            className="px-2.5 py-1 bg-[#0F9D8A] hover:bg-[#0B7A6B] text-white font-bold rounded text-xs transition-colors cursor-pointer shadow-xs"
                          >
                            Collect ₹{balance}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Detail Modal with "+ Create New Bill for Patient" button */}
      {selectedInvoice && !showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs font-bold text-[#0F9D8A]">
                  {selectedInvoice.invoiceNumber}
                </span>
                <h3 className="text-base font-bold text-[#243746]">Itemized Invoice Breakdown</h3>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-[#243746] p-1 text-sm rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#536B7E] pb-1 border-b border-slate-100">
                <span>Patient: <strong className="text-[#243746]">{selectedInvoice.patientName}</strong></span>
                <span>Date: <strong className="text-[#243746] font-mono">{selectedInvoice.date}</strong></span>
              </div>

              <div className="space-y-1.5 py-2">
                {selectedInvoice.items.map((item) => (
                  <div key={item.id} className="flex justify-between py-1 border-b border-slate-50">
                    <div>
                      <span className="text-[#243746] font-medium block">{item.description}</span>
                      <span className="text-[10px] text-[#536B7E] font-mono">{item.department}</span>
                    </div>
                    <span className="font-mono text-[#243746] font-bold tabular-nums">
                      ₹{item.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-1">
                <div className="flex justify-between text-[#536B7E]">
                  <span>Subtotal</span>
                  <span className="font-mono text-[#243746]">₹{selectedInvoice.subtotal.toLocaleString()}</span>
                </div>
                {selectedInvoice.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount</span>
                    <span className="font-mono">-₹{selectedInvoice.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#243746] font-bold text-sm">
                  <span>Total Amount</span>
                  <span className="font-mono text-[#0F9D8A]">₹{selectedInvoice.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Amount Paid</span>
                  <span className="font-mono">₹{selectedInvoice.paidAmount.toLocaleString()}</span>
                </div>
                {selectedInvoice.totalAmount - selectedInvoice.paidAmount > 0 && (
                  <div className="flex justify-between text-amber-700 font-bold">
                    <span>Balance Due</span>
                    <span className="font-mono">
                      ₹{(selectedInvoice.totalAmount - selectedInvoice.paidAmount).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => openNewBillForPatient(selectedInvoice.patientId)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E8F7F3] hover:bg-[#d6f2ea] text-[#0F9D8A] font-bold text-xs rounded border border-[#0F9D8A]/30 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Add New Bill for this Patient
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-1.5 rounded border border-slate-200 text-[#243746] text-xs cursor-pointer hover:bg-slate-50"
                >
                  Close
                </button>
                {selectedInvoice.totalAmount > selectedInvoice.paidAmount && (
                  <button
                    onClick={() => {
                      handleOpenPayment(selectedInvoice);
                    }}
                    className="px-4 py-1.5 bg-[#0F9D8A] text-white text-xs font-bold rounded cursor-pointer shadow-xs hover:bg-[#0B7A6B]"
                  >
                    Record Payment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW BILL MODAL */}
      {showNewBillModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-[#E8F7F3] text-[#0F9D8A]">
                  <FileText className="w-3 h-3" /> CareOS Billing Engine
                </span>
                <h3 className="text-base font-bold text-[#243746] mt-1">Generate New Hospital Invoice</h3>
              </div>
              <button
                onClick={() => setShowNewBillModal(false)}
                className="text-slate-400 hover:text-[#243746] p-1 text-sm rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            {newBillSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {newBillSuccess}
              </div>
            )}

            <form onSubmit={handleCreateBillSubmit} className="space-y-4 text-xs">
              {/* Patient Selection */}
              <div>
                <label className="text-[#243746] font-semibold block mb-1">Select Patient</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full bg-[#F8FCFB] border border-slate-200 rounded p-2 text-[#243746] outline-none focus:border-[#0F9D8A]"
                  required
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.uhid}) — Phone: {p.phone} | Age: {p.age} | {p.gender}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <span className="text-[11px] font-semibold text-[#536B7E] block mb-1.5">
                  Quick Clinical Department Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {BILL_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddPreset(preset)}
                      className="text-[11px] px-2.5 py-1 bg-[#F8FCFB] hover:bg-[#E8F7F3] hover:text-[#0F9D8A] border border-slate-200 hover:border-[#0F9D8A]/40 rounded text-[#243746] font-medium transition-all cursor-pointer"
                    >
                      + {preset.description} (₹{preset.amount})
                    </button>
                  ))}
                </div>
              </div>

              {/* Line Items Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#243746]">Itemized Bill Lines ({billItems.length})</span>
                  <button
                    type="button"
                    onClick={handleAddBillItem}
                    className="text-[#0F9D8A] hover:underline font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Add Custom Line
                  </button>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
                  {billItems.map((item, index) => (
                    <div key={item.id} className="p-2.5 bg-white flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <div className="flex-1 w-full sm:w-auto">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => {
                            const updated = [...billItems];
                            updated[index].description = e.target.value;
                            setBillItems(updated);
                          }}
                          placeholder="Service / Medication / Procedure name"
                          className="w-full bg-[#F8FCFB] border border-slate-200 rounded px-2.5 py-1.5 text-xs text-[#243746] outline-none focus:border-[#0F9D8A]"
                          required
                        />
                      </div>
                      <div className="w-32">
                        <select
                          value={item.department}
                          onChange={(e) => {
                            const updated = [...billItems];
                            updated[index].department = e.target.value as any;
                            setBillItems(updated);
                          }}
                          className="w-full bg-[#F8FCFB] border border-slate-200 rounded px-2 py-1.5 text-xs text-[#243746] outline-none focus:border-[#0F9D8A]"
                        >
                          <option value="OPD">OPD</option>
                          <option value="Radiology">Radiology</option>
                          <option value="Pathology">Pathology</option>
                          <option value="Pharmacy">Pharmacy</option>
                          <option value="IPD">IPD</option>
                          <option value="Emergency">Emergency</option>
                        </select>
                      </div>
                      <div className="w-28 flex items-center gap-1">
                        <span className="text-slate-400 font-mono">₹</span>
                        <input
                          type="number"
                          min={0}
                          value={item.amount}
                          onChange={(e) => {
                            const updated = [...billItems];
                            updated[index].amount = Number(e.target.value) || 0;
                            setBillItems(updated);
                          }}
                          className="w-full bg-[#F8FCFB] border border-slate-200 rounded px-2 py-1.5 text-xs font-mono font-bold text-[#243746] outline-none focus:border-[#0F9D8A]"
                          required
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveBillItem(item.id)}
                        disabled={billItems.length === 1}
                        className="text-slate-400 hover:text-rose-600 disabled:opacity-30 p-1 cursor-pointer"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Calculation Summary */}
              <div className="bg-[#F8FCFB] p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between text-[#536B7E]">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold text-[#243746]">₹{billSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-[#536B7E]">
                  <span>Concession / Discount (₹):</span>
                  <input
                    type="number"
                    min={0}
                    max={billSubtotal}
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                    className="w-24 bg-white border border-slate-200 rounded px-2 py-1 text-right font-mono text-xs text-[#243746] outline-none focus:border-[#0F9D8A]"
                  />
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-[#243746] pt-1 border-t border-slate-200">
                  <span>Net Payable:</span>
                  <span className="text-[#0F9D8A] font-mono text-base">₹{billTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Settlement Toggle */}
              <div className="bg-[#E8F7F3]/40 p-3 rounded-lg border border-[#0F9D8A]/20 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={markPaidImmediately}
                    onChange={(e) => setMarkPaidImmediately(e.target.checked)}
                    className="accent-[#0F9D8A] w-4 h-4 rounded"
                  />
                  <span className="font-semibold text-[#243746]">
                    Collect &amp; Settle in Full Now (Immediate Receipt)
                  </span>
                </label>

                {markPaidImmediately && (
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-[11px] text-[#536B7E]">Payment Mode:</span>
                    <select
                      value={immediatePayMethod}
                      onChange={(e) => setImmediatePayMethod(e.target.value)}
                      className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-[#243746] outline-none focus:border-[#0F9D8A]"
                    >
                      <option value="UPI/QR">UPI / QR Code</option>
                      <option value="Cash">Cash at Counter</option>
                      <option value="Credit/Debit Card">Credit / Debit Card POS</option>
                      <option value="Insurance">TPA Insurance Cashless</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewBillModal(false)}
                  className="px-4 py-2 rounded border border-slate-200 text-[#243746] hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0F9D8A] hover:bg-[#0B7A6B] text-white font-bold rounded-lg cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Receipt className="w-4 h-4" />
                  Generate Invoice Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Processing Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-[#243746]">Record Invoice Payment</h3>
            <p className="text-xs text-[#536B7E]">
              Processing payment for {selectedInvoice.patientName} ({selectedInvoice.invoiceNumber})
            </p>

            <form onSubmit={handleConfirmPayment} className="space-y-4 text-xs">
              <div>
                <label className="text-[#243746] font-semibold block mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-[#F8FCFB] border border-slate-200 rounded p-2 text-[#243746] outline-none focus:border-[#0F9D8A]"
                >
                  <option value="UPI/QR">UPI / QR Code (PhonePe, GPay, Paytm)</option>
                  <option value="Cash">Cash at Billing Counter</option>
                  <option value="Credit/Debit Card">Credit / Debit Card POS</option>
                  <option value="Insurance">TPA Insurance Cashless</option>
                </select>
              </div>

              <div>
                <label className="text-[#243746] font-semibold block mb-1">Amount to Collect (₹)</label>
                <input
                  type="number"
                  min={1}
                  max={selectedInvoice.totalAmount - selectedInvoice.paidAmount}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full bg-[#F8FCFB] border border-slate-200 rounded p-2 text-[#243746] font-mono font-bold outline-none focus:border-[#0F9D8A]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-3 py-1.5 rounded border border-slate-200 text-[#243746] hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0F9D8A] hover:bg-[#0B7A6B] text-white font-bold rounded cursor-pointer shadow-xs"
                >
                  Confirm &amp; Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
