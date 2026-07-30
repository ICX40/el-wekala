"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/components/AuthProvider';
import { Loader2, Users, ShoppingBag, Package, Settings, AlertTriangle, FileText, Ticket, TrendingUp, Banknote } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    pendingApplications: 0,
    totalRevenue: 0,
    platformProfit: 0,
  });

  const COMMISSION_RATE = 0.10; 

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!user) {
        router.push('/login');
        return;
      }
      
      setIsLoading(true);
      try {
        const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid)));
        let role = 'Customer';
        userDoc.forEach(doc => {
          role = doc.data().role;
        });

        if (role !== 'Admin') {
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        setIsAdmin(true);

        const usersSnap = await getDocs(collection(db, "users"));
        const productsSnap = await getDocs(collection(db, "products"));
        const ordersSnap = await getDocs(collection(db, "orders"));
        
        const pendingSellersSnap = await getDocs(query(collection(db, "seller_applications"), where("status", "==", "Pending")));
        const pendingSupportSnap = await getDocs(query(collection(db, "support_applications"), where("status", "==", "Pending")));

        let calculatedRevenue = 0;
        ordersSnap.forEach((doc) => {
          const orderData = doc.data();
          if (orderData.status !== 'Cancelled' && orderData.status !== 'Rejected') {
            calculatedRevenue += (orderData.finalAmount || 0);
          }
        });

        const calculatedProfit = calculatedRevenue * COMMISSION_RATE;

        setStats({
          totalUsers: usersSnap.size,
          totalProducts: productsSnap.size,
          totalOrders: ordersSnap.size,
          pendingApplications: pendingSellersSnap.size + pendingSupportSnap.size,
          totalRevenue: calculatedRevenue,
          platformProfit: calculatedProfit,
        });

      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[50vh] text-center space-y-4">
        <AlertTriangle className="w-16 h-16 text-red-500" />
        <h2 className="text-2xl font-bold text-slate-900">غير مصرح بالدخول</h2>
        <p className="text-slate-500">هذه الصفحة مخصصة لمديري النظام فقط.</p>
        <Link href="/" className="text-blue-600 font-bold hover:underline">العودة للرئيسية</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">لوحة تحكم الإدارة (Admin Panel)</h1>
        <p className="text-slate-500 mt-1">نظرة عامة على أداء المنصة وإدارة جميع الأقسام.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl shadow-md flex flex-col gap-4 text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-300 font-bold text-sm">إجمالي مبيعات المنصة</h3>
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold">{stats.totalRevenue.toLocaleString('ar-EG')} <span className="text-sm font-medium text-slate-400">ج.م</span></p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 p-6 rounded-2xl shadow-md flex flex-col gap-4 text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-emerald-100 font-bold text-sm">أرباح المنصة ({COMMISSION_RATE * 100}%)</h3>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Banknote className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold">{stats.platformProfit.toLocaleString('ar-EG')} <span className="text-sm font-medium text-emerald-200">ج.م</span></p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-500 font-bold text-sm">طلبات توثيق الهوية</h3>
            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900">{stats.pendingApplications}</p>
            {stats.pendingApplications > 0 && (
              <span className="absolute top-4 left-4 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-500 font-bold text-sm">إجمالي المستخدمين</h3>
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900">{stats.totalUsers}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-500 font-bold text-sm">المنتجات المعروضة</h3>
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900">{stats.totalProducts}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-500 font-bold text-sm">إجمالي الطلبات</h3>
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900">{stats.totalOrders}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-4">
        
        <Link href="/admin/applications" className="bg-orange-50 border border-orange-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group flex flex-col items-center justify-center text-center gap-3">
          <div className="w-14 h-14 bg-white text-orange-600 rounded-full flex items-center justify-center shadow-sm">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-orange-900">مراجعة طلبات الانضمام</h3>
            <p className="text-xs text-orange-700 mt-1">الموافقة على التجار والدعم الفني</p>
          </div>
        </Link>

        <Link href="/admin/orders" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-600/50 hover:shadow-md transition-all group flex flex-col items-center justify-center text-center gap-3">
          <div className="w-14 h-14 bg-slate-50 text-slate-700 rounded-full flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shadow-sm">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">إدارة الطلبات</h3>
            <p className="text-xs text-slate-500 mt-1">تحديث حالة طلبات العملاء</p>
          </div>
        </Link>

        <Link href="/admin/products" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-600/50 hover:shadow-md transition-all group flex flex-col items-center justify-center text-center gap-3">
          <div className="w-14 h-14 bg-slate-50 text-slate-700 rounded-full flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shadow-sm">
            <Package className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">إدارة المنتجات</h3>
            <p className="text-xs text-slate-500 mt-1">مراقبة وحذف منتجات التجار</p>
          </div>
        </Link>

        <Link href="/admin/promocodes" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-600/50 hover:shadow-md transition-all group flex flex-col items-center justify-center text-center gap-3">
          <div className="w-14 h-14 bg-slate-50 text-slate-700 rounded-full flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shadow-sm">
            <Ticket className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">إدارة الخصومات</h3>
            <p className="text-xs text-slate-500 mt-1">إنشاء وتفعيل كوبونات الخصم</p>
          </div>
        </Link>

        <Link href="/admin/settings" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-600/50 hover:shadow-md transition-all group flex flex-col items-center justify-center text-center gap-3">
          <div className="w-14 h-14 bg-slate-50 text-slate-700 rounded-full flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shadow-sm">
            <Settings className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">إعدادات المنصة</h3>
            <p className="text-xs text-slate-500 mt-1">العمولة، وبيانات التواصل</p>
          </div>
        </Link>

      </div>
    </div>
  );
}