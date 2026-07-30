"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Loader2, TrendingUp, ShoppingBag, Package, Eye, Activity } from 'lucide-react';

export default function SellerStatisticsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    productsCount: 0,
    totalOrders: 0,
    totalViews: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const productsQ = query(collection(db, 'products'), where('sellerId', '==', user.uid));
        const productsSnap = await getDocs(productsQ);
        
        // Simulating orders and views for now until proper analytics are implemented
        setStats({
          productsCount: productsSnap.size,
          totalOrders: 42, 
          totalViews: 1250
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
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
        <h1 className="text-2xl font-bold text-slate-900">الإحصائيات والأداء</h1>
        <p className="text-slate-500 mt-1">نظرة شاملة على أداء منتجاتك ومبيعاتك.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-500 font-bold text-sm">إجمالي المنتجات</h3>
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats.productsCount}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-500 font-bold text-sm">الطلبات المكتملة</h3>
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats.totalOrders}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-500 font-bold text-sm">مشاهدات المنتجات</h3>
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats.totalViews}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-500 font-bold text-sm">معدل التحويل</h3>
            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">3.4%</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center flex flex-col items-center justify-center mt-8">
        <Activity className="w-16 h-16 text-slate-300 mb-4" />
        <h3 className="text-xl font-bold text-slate-900">الرسوم البيانية قادمة قريباً</h3>
        <p className="text-slate-500 mt-2 max-w-md">نحن نعمل على توفير رسوم بيانية تفصيلية لتحليل مبيعاتك بشكل أفضل في التحديث القادم.</p>
      </div>
    </div>
  );
}