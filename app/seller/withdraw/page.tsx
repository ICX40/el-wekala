"use client";

import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/components/AuthProvider';
import { Loader2, CreditCard, Building2, Wallet, CheckCircle2 } from 'lucide-react';

export default function WithdrawPage() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  
  const [formData, setFormData] = useState({
    amount: "",
    method: "bank_transfer",
    accountName: "",
    accountNumber: "",
    bankName: "",
  });

  // Mock available balance
  const availableBalance = 15400;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (Number(formData.amount) > availableBalance) {
      alert("المبلغ المطلوب أكبر من الرصيد المتاح.");
      return;
    }

    setIsSubmitting(true);
    setSuccessMsg("");

    try {
      const withdrawalRequest = {
        sellerId: user.uid,
        amount: Number(formData.amount),
        method: formData.method,
        accountDetails: {
          accountName: formData.accountName,
          accountNumber: formData.accountNumber,
          bankName: formData.bankName,
        },
        status: "Pending", // Admin needs to approve
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "withdrawals"), withdrawalRequest);
      setSuccessMsg("تم إرسال طلب السحب بنجاح. ستتم المراجعة والتحويل خلال 3-5 أيام عمل.");
      
      // Reset form
      setFormData({
        amount: "",
        method: "bank_transfer",
        accountName: "",
        accountNumber: "",
        bankName: "",
      });

    } catch (error) {
      console.error("Error submitting withdrawal:", error);
      alert("حدث خطأ أثناء إرسال الطلب.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6" dir="rtl">
      
      <div>
        <h1 className="text-2xl font-bold text-slate-900">سحب الأرباح</h1>
        <p className="text-slate-500 mt-1">اطلب تحويل أرباحك إلى حسابك البنكي أو محفظتك الإلكترونية.</p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <Wallet className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500">الرصيد القابل للسحب</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">
              {availableBalance.toLocaleString('ar-EG')} <span className="text-lg">ج.م</span>
            </p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl flex items-center gap-3 border border-emerald-200">
          <CheckCircle2 className="w-6 h-6 shrink-0" />
          <p className="font-bold">{successMsg}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">تفاصيل الطلب</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">المبلغ المراد سحبه (ج.م)</label>
                <input
                  type="number"
                  required
                  min="100"
                  max={availableBalance}
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  placeholder="الحد الأدنى 100 ج.م"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">طريقة التحويل</label>
                <select
                  value={formData.method}
                  onChange={(e) => setFormData({...formData, method: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                >
                  <option value="bank_transfer">تحويل بنكي</option>
                  <option value="instapay">إنستاباي (InstaPay)</option>
                  <option value="wallet">محفظة إلكترونية (Vodafone Cash)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">بيانات الحساب المستقبل</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">الاسم الثلاثي لصاحب الحساب</label>
                <input
                  type="text"
                  required
                  value={formData.accountName}
                  onChange={(e) => setFormData({...formData, accountName: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>

              {formData.method === 'bank_transfer' && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">اسم البنك</label>
                  <input
                    type="text"
                    required={formData.method === 'bank_transfer'}
                    value={formData.bankName}
                    onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    placeholder="مثال: البنك الأهلي المصري"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  {formData.method === 'bank_transfer' ? 'رقم الحساب أو IBAN' : 'رقم الهاتف المحمول'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 dir-ltr text-right"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={isSubmitting || Number(formData.amount) <= 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'تقديم طلب السحب'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}