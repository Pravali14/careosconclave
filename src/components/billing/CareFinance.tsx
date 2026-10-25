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
} from 'lucide-react';
import { useCareOS } from '../../services/store';
import { Invoice } from '../../types/hospital';

export const CareFinance: React.FC = () => {
  const { invoices, recordPayment } = useCareOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI/QR' | 'Credit/Debit Card' | 'Insurance'>('UPI/QR');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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

  const filteredInvoices = invoices.filter((inv) => {
    const q = searchTerm.toLowerCase();
    return (
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.patientName.toLowerCase().includes(q)
    );
  });

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

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search invoice number, patient name..."
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
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-[#243746] rounded text-xs cursor-pointer shadow-xs"
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

      {/* Invoice Detail Modal */}
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
                className="text-slate-400 hover:text-[#243746]"
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

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
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
