"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/components/AuthProvider';
import { Loader2, DollarSign, Package, ShoppingCart, TrendingUp, CreditCard } from 'lucide-react';
import { Product, Order } from '@/types';

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalProducts: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });

  useEffect(() => {
    const fetchSellerStats = async () => {
      if (!user) return;
      setIsLoading(true);
      
      try {
        // 1. Fetch Seller Products
        const productsQuery = query(collection(db, "products"), where("sellerId", "==", user.uid));
        const productsSnap = await getDocs(productsQuery);
        const productsCount = productsSnap.size;

        // 2. Fetch Seller Orders (Simplified logic for MVP)
        // In a real complex app, you'd query orders containing items from this seller.
        // For MVP, assuming we have a flat structure or we iterate through recent orders.
        // Here we just mock the aggregation to show the UI, as complex cross-collection queries 
        // require Cloud Functions. We will simulate the stats based on active products.
        
        let estimatedRevenue = 0;
        productsSnap.forEach(doc => {
           const p = doc.data() as Product;
           // Mocking revenue based on sales (if we had a salesCount field)
           // estimatedRevenue += (p.price * (p.salesCount || 0));
        });

        setStats({
          totalRevenue: 15400, // Mock data for presentation
          totalProducts: productsCount,
          pendingOrders: 5,    // Mock data
          completedOrders: 24, // Mock data
        });

      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSellerStats();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">نظرة عامة</h1>
        <p className="text-slate-500 mt-1">مرحباً بك في لوحة تحكم متجرك. تابع مبيعاتك وأرباحك من هنا.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-500 font-bold text-sm">إجمالي الأرباح</h3>
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900">{stats.totalRevenue.toLocaleString('ar-EG')} ج.م</p>
            <p className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> +12% هذا الشهر
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-500 font-bold text-sm">المنتجات المعروضة</h3>
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900">{stats.totalProducts}</p>
            <Link href="/seller/products" className="text-xs text-blue-600 font-bold hover:underline mt-1 block">إدارة المنتجات</Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-500 font-bold text-sm">طلبات قيد التجهيز</h3>
            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900">{stats.pendingOrders}</p>
            <Link href="/seller/orders" className="text-xs text-orange-600 font-bold hover:underline mt-1 block">عرض الطلبات</Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-500 font-bold text-sm">عمليات السحب</h3>
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900">متاح</p>
            <Link href="/seller/withdraw" className="text-xs text-purple-600 font-bold hover:underline mt-1 block">طلب سحب الأرباح</Link>
          </div>
        </div>

      </div>
      
      {/* Informational Banner */}
      <div className="bg-blue-600 rounded-2xl p-6 md:p-8 text-white shadow-lg shadow-blue-600/20 mt-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold mb-2">هل أنت جاهز لزيادة مبيعاتك؟</h2>
          <p className="text-blue-100 text-sm max-w-xl">
            قم بإضافة صور عالية الجودة لمنتجاتك وكتابة وصف دقيق للوصول إلى عدد أكبر من العملاء. تذكر أن عمولة المنصة هي 10% فقط من المبيعات الناجحة.
          </p>
        </div>
        <Link 
          href="/seller/products/add" 
          className="bg-white text-blue-600 font-bold py-3 px-8 rounded-xl shrink-0 hover:bg-slate-50 transition-colors shadow-sm"
        >
          إضافة منتج جديد
        </Link>
      </div>

    </div>
  );
}