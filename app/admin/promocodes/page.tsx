"use client";

import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Loader2, Ticket, CheckCircle2, Trash2, Plus, Percent, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface PromoCode {
  id: string;
  code: string;
  discountPercentage: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminPromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    discountPercentage: "",
    isActive: true
  });

  const fetchPromoCodes = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "promo_codes"));
      const fetchedCodes: PromoCode[] = [];
      querySnapshot.forEach((doc) => {
        fetchedCodes.push({ id: doc.id, ...doc.data() } as PromoCode);
      });
      fetchedCodes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPromoCodes(fetchedCodes);
    } catch (error) {
      console.error("Error fetching promo codes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const handleCreatePromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    const upperCaseCode = formData.code.toUpperCase().trim();

    if (!upperCaseCode || !formData.discountPercentage) {
      setErrorMsg("يرجى إدخال كود الخصم ونسبة الخصم.");
      setIsSubmitting(false);
      return;
    }

    const exists = promoCodes.find(p => p.code === upperCaseCode);
    if (exists) {
      setErrorMsg("كود الخصم هذا موجود بالفعل.");
      setIsSubmitting(false);
      return;
    }

    try {
      const newPromo = {
        code: upperCaseCode,
        discountPercentage: Number(formData.discountPercentage),
        isActive: formData.isActive,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, "promo_codes"), newPromo);
      
      setPromoCodes([{ id: docRef.id, ...newPromo }, ...promoCodes]);
      setSuccessMsg("تم إضافة كود الخصم بنجاح!");
      setFormData({ code: "", discountPercentage: "", isActive: true });

      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error) {
      console.error("Error creating promo code:", error);
      setErrorMsg("حدث خطأ أثناء إنشاء الكود.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setProcessingId(id);
    try {
      await updateDoc(doc(db, "promo_codes", id), {
        isActive: !currentStatus
      });
      setPromoCodes(promoCodes.map(p => p.id === id ? { ...p, isActive: !currentStatus } : p));
    } catch (error) {
      console.error("Error updating status:", error);
      alert("حدث خطأ أثناء تحديث حالة الكود.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string, codeName: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف كود الخصم "${codeName}" نهائياً؟`)) return;
    setProcessingId(id);
    try {
      await deleteDoc(doc(db, "promo_codes", id));
      setPromoCodes(promoCodes.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error deleting promo code:", error);
      alert("حدث خطأ أثناء عملية الحذف.");
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin"/>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">إدارة أكواد الخصم (Promo Codes)</h1>
          <p className="text-slate-500 mt-1">قم بإنشاء كوبونات خصم للعملاء وعرضها كإعلانات على الموقع.</p>
        </div>
        <Link className="text-blue-600 font-bold hover:underline text-sm bg-blue-50 px-4 py-2 rounded-lg" href="/admin">
          العودة للوحة الإدارة
        </Link>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl flex items-center gap-3 border border-emerald-200">
          <CheckCircle2 className="w-6 h-6 shrink-0"/>
          <p className="font-bold">{successMsg}</p>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-200">
          <AlertCircle className="w-6 h-6 shrink-0"/>
          <p className="font-bold">{errorMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-fit">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600"/>
            إنشاء كود جديد
          </h3>
          <form onSubmit={handleCreatePromoCode} className="space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-2">كلمة الكود</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 dir-ltr text-left font-mono font-bold"
                placeholder="مثال: WEKALA20"
              />
            </div>
            
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-2 flex items-center gap-1">
                نسبة الخصم <Percent className="w-3 h-3"/>
              </label>
              <input
                type="number"
                required
                min="1"
                max="99"
                value={formData.discountPercentage}
                onChange={(e) => setFormData({...formData, discountPercentage: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 dir-ltr text-left"
                placeholder="مثال: 15"
              />
            </div>

            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="isActive" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                تفعيل الكود فوراً
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin"/> : <Ticket className="w-5 h-5"/>}
              إصدار الكود
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-blue-600"/>
              الأكواد الحالية
            </h3>
            <span className="bg-blue-50 text-blue-600 font-bold px-3 py-1 rounded-full text-xs">
              {promoCodes.length} كود
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="px-6 py-4">الكود</th>
                  <th className="px-6 py-4">نسبة الخصم</th>
                  <th className="px-6 py-4">الحالة</th>
                  <th className="px-6 py-4">تاريخ الإنشاء</th>
                  <th className="px-6 py-4">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {promoCodes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      <Ticket className="w-12 h-12 mx-auto text-slate-300 mb-3"/>
                      لم تقم بإنشاء أي أكواد خصم بعد.
                    </td>
                  </tr>
                ) : (
                  promoCodes.map((promo) => (
                    <tr key={promo.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-extrabold text-blue-600 text-base">
                        {promo.code}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {promo.discountPercentage}%
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(promo.id, promo.isActive)}
                          disabled={processingId === promo.id}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                            promo.isActive 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100' 
                            : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {processingId === promo.id ? 'جاري...' : (promo.isActive ? 'نشط' : 'متوقف')}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {new Date(promo.createdAt).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleDelete(promo.id, promo.code)}
                          disabled={processingId === promo.id}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="حذف الكود نهائياً"
                        >
                          {processingId === promo.id ? <Loader2 className="w-5 h-5 animate-spin"/> : <Trash2 className="w-5 h-5"/>}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}