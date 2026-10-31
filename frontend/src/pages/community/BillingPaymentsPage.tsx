import { useEffect, useState } from 'react';
import { billingApi } from '@/services/communityApi';
import type { MaintenanceBill, PaymentResponse } from '@/types/community';
import { TopBar } from '@/components/layout/TopBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/useToast';
import { useRole } from '@/context/RoleContext';

export function BillingPaymentsPage() {
  const { role } = useRole();
  const isAdmin = role === 'ADMIN';

  const [bills, setBills] = useState<MaintenanceBill[]>([]);
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PENDING_DUES' | 'PAYMENT_HISTORY'>('PENDING_DUES');

  // Admin bill generation modal state
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    billType: 'Monthly Society Maintenance',
    customType: '',
    amount: 2500,
    description: '',
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
  });

  // Resident payment modal state
  const [payingBill, setPayingBill] = useState<MaintenanceBill | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState<{
    receiptNumber: string;
    transactionId: string;
    date: string;
    amount: number;
    billNumber: string;
    residentName: string;
  } | null>(null);

  const { pushToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [resBills, resPayments] = await Promise.allSettled([
        billingApi.getBills(0, 50),
        billingApi.getPayments(0, 50),
      ]);

      if (resBills.status === 'fulfilled') {
        const bList: any = resBills.value;
        const items: MaintenanceBill[] = Array.isArray(bList)
          ? bList
          : Array.isArray(bList?.data)
          ? bList.data
          : (bList?.data?.content || bList?.content || []);
        setBills(items);
      }

      if (resPayments.status === 'fulfilled') {
        const pList: any = resPayments.value;
        const items: PaymentResponse[] = Array.isArray(pList)
          ? pList
          : Array.isArray(pList?.data)
          ? pList.data
          : (pList?.data?.content || pList?.content || []);
        setPayments(items);
      }
    } catch (err) {
      console.error('Error loading billing data:', err);
      pushToast({ type: 'error', title: 'Failed to fetch billing data', description: 'Please check your connection.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [role]);

  // Admin: Batch generate bills for all residents
  const handleGenerateBillsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const finalType = generateForm.billType === 'OTHER'
        ? (generateForm.customType.trim() || 'Society Special Utility Surcharge')
        : generateForm.billType;

      await billingApi.generateSocietyBills({
        billType: finalType,
        amount: Number(generateForm.amount),
        description: generateForm.description.trim() || `Official Society Invoice: ${finalType}`,
        dueDate: generateForm.dueDate,
      });

      pushToast({
        type: 'success',
        title: 'Bills Generated for All Residents! 📢',
        description: `Successfully issued "${finalType}" of ₹${Number(generateForm.amount).toLocaleString()} to all society flats.`,
      });
      setShowGenerateModal(false);
      setGenerateForm({
        billType: 'Monthly Society Maintenance',
        customType: '',
        amount: 2500,
        description: '',
        dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      });
      await loadData();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Check connection or registered residents.';
      pushToast({ type: 'error', title: 'Bill Generation Failed', description: msg });
    } finally {
      setGenerating(false);
    }
  };

  // Resident / Admin: Razorpay payment flow
  const executeRazorpayPayment = async () => {
    if (!payingBill) return;
    setProcessing(true);
    try {
      const txnId = `RZP_TEST_${Date.now()}`;
      const payAmount = payingBill.outstandingAmount > 0 ? payingBill.outstandingAmount : payingBill.totalAmount;

      const payRes = await billingApi.processPayment({
        billId: payingBill.id,
        amount: payAmount,
        paymentMethod: 'RAZORPAY',
        transactionId: txnId,
        razorpayOrderId: `order_${Date.now()}`,
        razorpayPaymentId: `pay_${Date.now()}`,
        razorpaySignature: 'simulated_signature_hash',
      });

      const receiptData = {
        receiptNumber: payRes.data?.receiptNumber || `REC-RZP-${Date.now()}`,
        transactionId: txnId,
        date: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        amount: payAmount,
        billNumber: payingBill.billNumber,
        residentName: payingBill.residentName,
      };

      setReceipt(receiptData);
      pushToast({
        type: 'success',
        title: 'Payment Successful! 🎉',
        description: `Dues paid. Receipt #${receiptData.receiptNumber} issued. Moved to Previous Payments.`,
      });
      setPayingBill(null);
      // Reload both bills and payments so paid bill is cleared from dues and shown in history
      await loadData();
    } catch (err) {
      console.error('Payment error:', err);
      pushToast({ type: 'error', title: 'Payment Failed', description: 'Transaction could not be completed.' });
    } finally {
      setProcessing(false);
    }
  };

  // Filter pending/unpaid dues vs paid bills
  const pendingBills = bills.filter((b) => b.status !== 'PAID');
  const paidBills = bills.filter((b) => b.status === 'PAID');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'PARTIALLY_PAID':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'OVERDUE':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default:
        return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
    }
  };

  return (
    <section className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TopBar
          title={isAdmin ? 'Society Billing & Maintenance Dues' : 'My Society Maintenance & Dues'}
          subtitle={
            isAdmin
              ? 'Issue bills to all society residents, monitor payment status, and manage financial receivables.'
              : 'Review your outstanding invoices, pay dues via Razorpay gateway, and view payment receipts.'
          }
        />

        {/* Admin Controls: Generate Bill & Clear Bills */}
        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            {bills.length > 0 && (
              <button
                onClick={async () => {
                  if (window.confirm("Are you sure you want to delete ALL generated maintenance bills from the admin panel?")) {
                    try {
                      await billingApi.clearAllBills();
                      pushToast({ type: 'success', title: 'All Bills Cleared', description: 'Removed all generated maintenance bills from the system.' });
                      await loadData();
                    } catch {
                      pushToast({ type: 'error', title: 'Failed to clear bills' });
                    }
                  }
                }}
                className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 font-bold text-rose-300 hover:bg-rose-500/20 transition-all text-xs flex items-center gap-1.5"
              >
                <span>🗑️</span> Remove All Bills
              </button>
            )}

            <button
              onClick={() => setShowGenerateModal(true)}
              className="rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 hover:bg-cyan-300 transition-all shadow-lg hover:shadow-cyan-500/20 text-xs flex items-center gap-2"
            >
              <span>📜</span> + Generate Bill (All Residents)
            </button>
          </div>
        )}
      </div>

      {/* Tabs: Active / Pending Dues vs Previous Payments */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('PENDING_DUES')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'PENDING_DUES'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>⏳</span> Outstanding Bills & Dues
          {pendingBills.length > 0 && (
            <span className="rounded-full bg-rose-500/30 text-rose-300 px-2 py-0.5 text-[10px] font-extrabold border border-rose-500/40">
              {pendingBills.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('PAYMENT_HISTORY')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'PAYMENT_HISTORY'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>✓</span> Previous Payments & Receipts
          {payments.length > 0 && (
            <span className="rounded-full bg-emerald-500/30 text-emerald-300 px-2 py-0.5 text-[10px] font-extrabold border border-emerald-500/40">
              {payments.length}
            </span>
          )}
        </button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <LoadingSpinner />
      ) : activeTab === 'PENDING_DUES' ? (
        pendingBills.length === 0 ? (
          <div className="rounded-[2rem] border border-emerald-500/20 bg-emerald-950/10 p-12 text-center text-slate-400">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 text-3xl mb-3 border border-emerald-500/30">
              ✓
            </div>
            <p className="text-lg font-bold text-white">No Outstanding Dues!</p>
            <p className="mt-1 text-sm text-slate-400">
              {isAdmin
                ? 'All resident maintenance bills are currently clear. Use "+ Generate Bill" to issue new invoices.'
                : 'All your society dues are fully paid. Check the "Previous Payments & Receipts" tab to see completed receipts.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingBills.map((bill) => {
              const itemTitle = bill.items?.[0]?.name || 'Monthly Society Maintenance';
              const itemDesc = bill.items?.[0]?.description || 'Common amenities, security & facilities maintenance.';
              return (
                <article
                  key={bill.id}
                  className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md flex flex-col justify-between space-y-4 hover:border-white/20 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-cyan-400">{bill.billNumber}</span>
                      <span className={`rounded-xl border px-3 py-1 text-xs font-bold ${getStatusBadge(bill.status)}`}>
                        {bill.status}
                      </span>
                    </div>

                    <div>
                      <span className="inline-block rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 text-[11px] font-bold text-cyan-300 mb-1">
                        {itemTitle}
                      </span>
                      <h3 className="text-lg font-bold text-white">{bill.residentName}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2">{itemDesc}</p>
                    </div>

                    <div className="rounded-2xl bg-slate-950 p-4 border border-white/5 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>Total Invoice Amount:</span>
                        <span className="font-mono text-white">₹{bill.totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Paid So Far:</span>
                        <span className="font-mono text-emerald-400">₹{(bill.paidAmount || 0).toLocaleString()}</span>
                      </div>
                      <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-sm">
                        <span className="text-white">Outstanding Due:</span>
                        <span className="font-mono text-rose-400">
                          ₹{(bill.outstandingAmount > 0 ? bill.outstandingAmount : bill.totalAmount).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                    <div className="text-xs text-slate-400">
                      <span>Due: </span>
                      <span className="text-amber-300 font-semibold">{bill.dueDate}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isAdmin && (
                        <button
                          onClick={async () => {
                            if (window.confirm(`Delete bill ${bill.billNumber} for ${bill.residentName}?`)) {
                              try {
                                await billingApi.deleteBill(bill.id);
                                pushToast({ type: 'success', title: 'Bill Removed', description: `${bill.billNumber} deleted.` });
                                await loadData();
                              } catch {
                                pushToast({ type: 'error', title: 'Failed to delete bill' });
                              }
                            }
                          }}
                          className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-2.5 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition-all"
                          title="Delete Bill"
                        >
                          🗑️
                        </button>
                      )}

                      {!isAdmin ? (
                        <button
                          onClick={() => setPayingBill(bill)}
                          className="rounded-2xl bg-emerald-400 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-300 transition-all shadow-md flex items-center gap-1.5"
                        >
                          <span>💳</span> Pay Dues
                        </button>
                      ) : (
                        <span className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[11px] font-bold text-amber-300">
                          Pending Resident Payment
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )
      ) : (
        /* PREVIOUS PAYMENTS & RECEIPTS TAB */
        payments.length === 0 && paidBills.length === 0 ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-12 text-center text-slate-400">
            <p className="text-lg font-medium">No payment history yet</p>
            <p className="mt-1 text-sm text-slate-500">Completed payments and official receipts will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((p) => (
              <div
                key={p.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 text-lg">
                    ✓
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">Receipt #{p.receiptNumber}</span>
                      <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                        {p.paymentStatus || 'PAID'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                      Txn: {p.transactionId} • Method: {p.paymentMethod || 'RAZORPAY'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  <div className="text-right">
                    <span className="block font-mono text-base font-extrabold text-emerald-400">
                      ₹{p.amountPaid.toLocaleString()}
                    </span>
                    <span className="block text-[11px] text-slate-400">
                      {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('en-IN') : 'Completed'}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setReceipt({
                        receiptNumber: p.receiptNumber,
                        transactionId: p.transactionId,
                        date: p.paymentDate
                          ? new Date(p.paymentDate).toLocaleString('en-IN')
                          : new Date().toLocaleString('en-IN'),
                        amount: p.amountPaid,
                        billNumber: `Bill #${p.billId}`,
                        residentName: 'Society Resident',
                      });
                    }}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10"
                  >
                    View Receipt 🖨️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ADMIN: Generate Society Bills for ALL Residents Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-[2.5rem] border border-cyan-500/30 bg-slate-900 p-6 space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>📜</span> Generate Society Maintenance Bill
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  This will generate and assign this invoice to <span className="text-cyan-300 font-bold">ALL registered resident flats</span>.
                </p>
              </div>
              <button onClick={() => setShowGenerateModal(false)} className="text-slate-400 hover:text-white font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateBillsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Select Bill Type</label>
                <select
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400 text-sm"
                  value={generateForm.billType}
                  onChange={(e) => setGenerateForm({ ...generateForm, billType: e.target.value })}
                >
                  <option value="Monthly Society Maintenance">Monthly Society Maintenance</option>
                  <option value="Water Utility Surcharge">Water Utility Surcharge</option>
                  <option value="Electricity Common Area Charge">Electricity Common Area Charge</option>
                  <option value="Sinking Fund / Capital Reserve">Sinking Fund / Capital Reserve</option>
                  <option value="Diwali & Festival Event Fund">Diwali & Festival Event Fund</option>
                  <option value="Security & Gate Automation Levy">Security & Gate Automation Levy</option>
                  <option value="OTHER">Other / Custom Bill Type</option>
                </select>
              </div>

              {generateForm.billType === 'OTHER' && (
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Custom Bill Type Name</label>
                  <input
                    required
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400 text-sm"
                    value={generateForm.customType}
                    onChange={(e) => setGenerateForm({ ...generateForm, customType: e.target.value })}
                    placeholder="e.g. Swimming Pool Renovation Surcharge"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Amount Per Flat (₹)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400 text-sm font-mono font-bold"
                    value={generateForm.amount}
                    onChange={(e) => setGenerateForm({ ...generateForm, amount: Number(e.target.value) })}
                    placeholder="2500"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Payment Due Date</label>
                  <input
                    type="date"
                    required
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400 text-sm"
                    value={generateForm.dueDate}
                    onChange={(e) => setGenerateForm({ ...generateForm, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">
                  Description / Remarks (Optional)
                </label>
                <textarea
                  rows={2}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-2.5 text-white outline-none focus:border-cyan-400 text-sm"
                  value={generateForm.description}
                  onChange={(e) => setGenerateForm({ ...generateForm, description: e.target.value })}
                  placeholder="e.g. Standard monthly maintenance covering generator diesel, garden, cleaning, and security."
                />
              </div>

              <div className="rounded-2xl bg-cyan-950/20 border border-cyan-500/20 p-3 text-xs text-cyan-300">
                ℹ️ Generating this bill will deliver the invoice to each resident profile with Razorpay payment options.
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3 font-semibold text-slate-300 hover:bg-white/10 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="flex-1 rounded-2xl bg-cyan-400 py-3 font-bold text-slate-950 hover:bg-cyan-300 transition-all text-xs shadow-lg"
                >
                  {generating ? 'Issuing to All Residents...' : 'Generate & Issue Bills 🚀'}
                </button>
              </div>
            </form>
          </div>
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
                  <h3 className="text-base font-bold text-white">Razorpay Payment Gateway</h3>
                  <p className="text-[11px] text-slate-400">Shiv Elite Township Housing Society</p>
                </div>
              </div>
              <button onClick={() => setPayingBill(null)} className="text-slate-400 hover:text-white text-lg font-bold">
                ✕
              </button>
            </div>

            <div className="rounded-2xl bg-slate-950 p-4 border border-white/10 space-y-2">
              <p className="text-xs text-slate-400">Paying for Invoice:</p>
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-sm">{payingBill.billNumber}</span>
                <span className="font-mono font-extrabold text-lg text-emerald-400">
                  ₹{(payingBill.outstandingAmount > 0 ? payingBill.outstandingAmount : payingBill.totalAmount).toLocaleString()}
                </span>
              </div>
              {payingBill.items?.[0]?.name && (
                <p className="text-xs text-cyan-300 font-medium">Type: {payingBill.items[0].name}</p>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Select Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`rounded-2xl border p-3 text-center transition-all text-xs font-bold ${
                    paymentMethod === 'UPI' ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300' : 'border-white/10 bg-slate-950 text-slate-400'
                  }`}
                >
                  <span className="block text-base mb-1">📱</span>
                  <span>UPI / QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`rounded-2xl border p-3 text-center transition-all text-xs font-bold ${
                    paymentMethod === 'CARD' ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300' : 'border-white/10 bg-slate-950 text-slate-400'
                  }`}
                >
                  <span className="block text-base mb-1">💳</span>
                  <span>Debit/Credit</span>
                </button>
                <button
                  type="button"
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
                type="button"
                onClick={executeRazorpayPayment}
                disabled={processing}
                className="w-full rounded-2xl bg-emerald-400 py-3.5 text-sm font-bold text-slate-950 hover:bg-emerald-300 transition-all shadow-lg hover:shadow-emerald-500/20"
              >
                {processing
                  ? 'Processing Secure Payment...'
                  : `Complete Payment (₹${(payingBill.outstandingAmount > 0 ? payingBill.outstandingAmount : payingBill.totalAmount).toLocaleString()})`}
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
                <span className="text-slate-400">Invoice:</span>
                <span className="text-white font-bold">{receipt.billNumber}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400">Resident / Flat:</span>
                <span className="text-white font-bold">{receipt.residentName}</span>
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
                type="button"
                onClick={() => window.print()}
                className="flex-1 rounded-2xl border border-white/10 bg-slate-800 py-3 text-xs font-bold text-white hover:bg-slate-700"
              >
                🖨️ Print Receipt
              </button>
              <button
                type="button"
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
