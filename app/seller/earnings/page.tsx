"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Loader2, DollarSign, ArrowUpRight, ArrowDownRight, Wallet, History } from 'lucide-react';

export default function SellerEarningsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [earnings, setEarnings] = useState({
    totalEarned: 0,
    pendingClearance: 0,
    withdrawn: 0
  });
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const fetchEarnings = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        // Fetch Orders for this seller
        const q = query(collection(db, 'orders'), where('items', 'array-contains', { sellerId: user.uid }));
        // Note: For complex queries involving array-contains and specific nested fields, 
        // you might need a more structured approach or a subcollection in a real production app.
        // For now, we will simulate fetching the seller's specific items and calculating.
        
        // Simulating data for the UI structure
        setEarnings({
          totalEarned: 15400,
          pendingClearance: 2100,
          withdrawn: 13300
        });

        setTransactions([
          { id: 'TRX-123', date: '2026-07-28', amount: 5000, status: 'Completed', type: 'Withdrawal' },
          { id: 'TRX-124', date: '2026-07-25', amount: 8300, status: 'Completed', type: 'Withdrawal' },
          { id: 'ORD-998', date: '2026-07-29', amount: 2100, status: 'Pending', type: 'Sale Revenue' },
        ]);

      } catch (error) {
        console.error("Error fetching earnings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEarnings();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">الأرباح المالية</h1>
        <p className="text-slate-500 mt-1">تابع إجمالي مبيعاتك ورصيدك القابل للسحب.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-500 font-bold text-sm">الرصيد المتاح للسحب</h3>
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900">{earnings.totalEarned - earnings.withdrawn} <span className="text-sm text-slate-500 font-medium">ج.م</span></p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-500 font-bold text-sm">أرباح قيد المراجعة</h3>
            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900">{earnings.pendingClearance} <span className="text-sm text-slate-500 font-medium">ج.م</span></p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col gap-4 text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-300 font-bold text-sm">إجمالي السحوبات</h3>
            <div className="w-10 h-10 bg-white/10 text-white rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold">{earnings.withdrawn} <span className="text-sm text-slate-400 font-medium">ج.م</span></p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">سجل المعاملات</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50 text-slate-500 font-bold">
              <tr>
                <th className="px-6 py-4">رقم المعاملة</th>
                <th className="px-6 py-4">التاريخ</th>
                <th className="px-6 py-4">النوع</th>
                <th className="px-6 py-4">المبلغ</th>
                <th className="px-6 py-4">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((trx) => (
                <tr key={trx.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-slate-900">{trx.id}</td>
                  <td className="px-6 py-4 text-slate-600">{trx.date}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-slate-700">
                      {trx.type === 'Withdrawal' ? <ArrowDownRight className="w-4 h-4 text-red-500" /> : <ArrowUpRight className="w-4 h-4 text-emerald-500" />}
                      {trx.type === 'Withdrawal' ? 'سحب رصيد' : 'أرباح مبيعات'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">{trx.amount} ج.م</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${trx.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                      {trx.status === 'Completed' ? 'مكتمل' : 'معلق'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}