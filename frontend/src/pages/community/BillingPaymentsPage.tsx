import { useEffect, useState } from 'react';
import { billingApi } from '@/services/communityApi';
import type { MaintenanceBill } from '@/types/community';
import { TopBar } from '@/components/layout/TopBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/useToast';

export function BillingPaymentsPage() {
  const [bills, setBills] = useState<MaintenanceBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingBill, setPayingBill] = useState<MaintenanceBill | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState<{ receiptNumber: string; transactionId: string; date: string; amount: number; bill: MaintenanceBill } | null>(null);
  const { pushToast } = useToast();

  const loadBills = async () => {
    setLoading(true);
    try {
      const res = await billingApi.getBills(0, 50);
      setBills(res.data?.content || []);
    } catch {
      pushToast({ type: 'error', title: 'Failed to fetch bills', description: 'Check backend server.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
  }, []);

  const handleCreateBill = async () => {
    try {
      await billingApi.createBill(1);
      pushToast({ type: 'success', title: 'Maintenance Bill Generated', description: 'Generated monthly bill for resident.' });
      loadBills();
    } catch {
      pushToast({ type: 'error', title: 'Bill Generation Failed', description: 'Resident ID 1 must exist.' });
    }
  };

  const executeRazorpayPayment = async () => {
    if (!payingBill) return;
    setProcessing(true);
    try {
      const txnId = `RZP_TEST_${Date.now()}`;
      const payRes = await billingApi.processPayment({
        billId: payingBill.id,
        amount: payingBill.outstandingAmount > 0 ? payingBill.outstandingAmount : payingBill.totalAmount,
        paymentMethod: 'RAZORPAY',
        transactionId: txnId,
        razorpayOrderId: `order_${Date.now()}`,
        razorpayPaymentId: `pay_${Date.now()}`,
        razorpaySignature: 'simulated_signature_hash',
      });

      const receiptData = {
        receiptNumber: payRes.data?.receiptNumber || `REC-RZP-${Date.now()}`,
        transactionId: txnId,
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        amount: payingBill.outstandingAmount > 0 ? payingBill.outstandingAmount : payingBill.totalAmount,
        bill: payingBill,
      };

      setReceipt(receiptData);
      pushToast({
        type: 'success',
        title: 'Payment Successful! 🎉',
        description: `Receipt #${receiptData.receiptNumber} generated via Razorpay Sandbox.`,
      });
      setPayingBill(null);
      loadBills();
    } catch {
      pushToast({ type: 'error', title: 'Payment Failed', description: 'Transaction declined or server error.' });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'PARTIALLY_PAID': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'OVERDUE': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TopBar title="Maintenance Billing & Razorpay Payments" subtitle="Generate monthly bills, collect online payments via Razorpay sandbox, and issue receipts." />
        <button
          onClick={handleCreateBill}
          className="self-start rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 hover:bg-cyan-300 transition-all shadow-lg hover:shadow-cyan-500/20 sm:self-auto text-sm"
        >
          + Generate Maintenance Bill
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : bills.length === 0 ? (
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-12 text-center text-slate-400">
          <p className="text-lg font-medium">No maintenance bills found</p>
          <p className="mt-1 text-sm text-slate-500">Click Generate Bill to create a new monthly invoice.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bills.map((bill) => (
            <article key={bill.id} className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md flex flex-col justify-between space-y-4 hover:border-white/20 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-cyan-400">{bill.billNumber}</span>
                  <span className={`rounded-xl border px-3 py-1 text-xs font-bold ${getStatusBadge(bill.status)}`}>
                    {bill.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">{bill.residentName}</h3>
                <p className="text-xs text-slate-400 font-mono">Billing Period: {bill.billingMonth || 'Sept 2026'}</p>
                <div className="rounded-2xl bg-slate-950 p-4 border border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Monthly Society Maintenance:</span>
                    <span className="font-mono text-white">₹{bill.totalAmount - 500}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Parking & Security Surcharge:</span>
                    <span className="font-mono text-white">₹500</span>
                  </div>
                  <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-sm">
                    <span className="text-white">Total Billable Dues:</span>
                    <span className="font-mono text-cyan-300">₹{bill.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  <span>Due Date: </span>
                  <span className="text-amber-300 font-semibold">{bill.dueDate}</span>
                </div>
                {bill.status === 'PAID' ? (
                  <span className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 text-xs font-bold text-emerald-300 flex items-center gap-1">
                    <span>✓</span> PAID
                  </span>
                ) : (
                  <button
                    onClick={() => setPayingBill(bill)}
                    className="rounded-2xl bg-emerald-400 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-300 transition-all shadow-md"
                  >
                    Pay Dues (Razorpay) →
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Razorpay Interactive Sandbox Payment Modal */}
      {payingBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[2.5rem] border border-cyan-500/40 bg-slate-900 p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-blue-600/20 p-2.5 border border-blue-500/30 text-blue-400 font-black text-xl">
                  💳
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Razorpay Sandbox Gateway</h3>
                  <p className="text-[11px] text-slate-400">Royal Heights Housing Society Ltd.</p>
                </div>
              </div>
              <button onClick={() => setPayingBill(null)} className="text-slate-400 hover:text-white text-lg font-bold">✕</button>
            </div>

            <div className="rounded-2xl bg-slate-950 p-4 border border-white/10 space-y-2">
              <p className="text-xs text-slate-400">Paying for Flat Invoice:</p>
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-sm">{payingBill.billNumber}</span>
                <span className="font-mono font-extrabold text-lg text-emerald-400">₹{payingBill.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Select Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setPaymentMethod('UPI')}
                  className={`rounded-2xl border p-3 text-center transition-all text-xs font-bold ${
                    paymentMethod === 'UPI' ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300' : 'border-white/10 bg-slate-950 text-slate-400'
                  }`}
                >
                  <span className="block text-base mb-1">📱</span>
                  <span>UPI / QR</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('CARD')}
                  className={`rounded-2xl border p-3 text-center transition-all text-xs font-bold ${
                    paymentMethod === 'CARD' ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300' : 'border-white/10 bg-slate-950 text-slate-400'
                  }`}
                >
                  <span className="block text-base mb-1">💳</span>
                  <span>Debit/Credit</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('NETBANKING')}
                  className={`rounded-2xl border p-3 text-center transition-all text-xs font-bold ${
                    paymentMethod === 'NETBANKING' ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300' : 'border-white/10 bg-slate-950 text-slate-400'
                  }`}
                >
                  <span className="block text-base mb-1">🏦</span>
                  <span>NetBanking</span>
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={executeRazorpayPayment}
                disabled={processing}
                className="w-full rounded-2xl bg-emerald-400 py-3.5 text-sm font-bold text-slate-950 hover:bg-emerald-300 transition-all shadow-lg hover:shadow-emerald-500/20"
              >
                {processing ? 'Processing Secure Payment...' : `Complete Payment (₹${payingBill.totalAmount.toLocaleString()})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Payment Receipt Modal */}
      {receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-[2.5rem] border border-emerald-500/40 bg-slate-900 p-8 space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-3xl">
                ✓
              </div>
              <h2 className="text-2xl font-extrabold text-white">Payment Successful</h2>
              <p className="text-xs text-emerald-300 font-semibold">Official Society Payment Receipt</p>
            </div>

            <div className="rounded-2xl bg-slate-950 p-6 border border-white/10 space-y-3 text-xs font-mono">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400">Receipt No:</span>
                <span className="text-cyan-300 font-bold">{receipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400">Razorpay Txn ID:</span>
                <span className="text-white font-bold">{receipt.transactionId}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400">Resident / Flat:</span>
                <span className="text-white font-bold">{receipt.bill.residentName}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400">Payment Date:</span>
                <span className="text-white">{receipt.date}</span>
              </div>
              <div className="flex justify-between pt-2 text-base font-bold">
                <span className="text-white">Total Amount Paid:</span>
                <span className="text-emerald-400 font-extrabold">₹{receipt.amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 rounded-2xl border border-white/10 bg-slate-800 py-3 text-xs font-bold text-white hover:bg-slate-700"
              >
                🖨️ Print Receipt
              </button>
              <button
                onClick={() => setReceipt(null)}
                className="flex-1 rounded-2xl bg-cyan-400 py-3 text-xs font-bold text-slate-950 hover:bg-cyan-300"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
