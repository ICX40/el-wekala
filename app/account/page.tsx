"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import Link from 'next/link';
import { User, ShoppingBag, Heart, MapPin, Calendar, Mail, Loader2, ShieldCheck, Store, Headset, Clock } from 'lucide-react';

export default function AccountProfilePage() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">الملف الشخصي</h1>
        <p className="text-slate-500 mt-1">معلومات حسابك الشخصي ونظرة عامة على نشاطك في المنصة.</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
        
        {userData?.role === 'Admin' && (
          <div className="absolute top-0 right-0 bg-slate-900 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            مدير النظام
          </div>
        )}

        <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-3xl shrink-0 border border-blue-100 shadow-inner mt-4 md:mt-0 relative">
          {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <User className="w-12 h-12" />}
        </div>
        
        <div className="flex-1 text-center md:text-right space-y-2">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900">{user?.displayName || "مستخدم الوكالة"}</h2>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border w-fit mx-auto md:mx-0 ${
              userData?.role === 'Admin' ? 'bg-slate-100 text-slate-700 border-slate-200' :
              userData?.role === 'Seller' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
              userData?.role === 'Support' ? 'bg-purple-50 text-purple-600 border-purple-100' :
              'bg-blue-50 text-blue-600 border-blue-100'
            }`}>
              {userData?.role || 'Customer'}
            </span>
          </div>
          
          <p className="text-slate-500 text-sm flex items-center justify-center md:justify-start gap-2">
            <Mail className="w-4 h-4 text-slate-400" />
            {user?.email}
          </p>

          <p className="text-slate-400 text-xs flex flex-col sm:flex-row sm:items-center justify-center md:justify-start gap-1 sm:gap-4 mt-1">
            <span className="flex items-center justify-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              تاريخ الانضمام: {new Date(userData?.createdAt || Date.now()).toLocaleDateString('ar-EG')}
            </span>
            {userData?.shortId && (
              <span className="font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">
                ID: {userData.shortId}
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full md:w-auto">
          <Link
            href="/account/settings"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-6 rounded-xl text-center text-sm transition-colors"
          >
            تعديل الحساب
          </Link>
          
          {userData?.role === 'Seller' && (
            <Link
              href="/seller"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl text-center text-sm transition-colors shadow-sm flex justify-center items-center gap-2"
            >
              <Store className="w-4 h-4" />
              لوحة التاجر
            </Link>
          )}

          {userData?.role === 'Support' && (
            <Link
              href="/support"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-6 rounded-xl text-center text-sm transition-colors shadow-sm flex justify-center items-center gap-2"
            >
              <Headset className="w-4 h-4" />
              لوحة الدعم الفني
            </Link>
          )}

          {userData?.role === 'Admin' && (
            <Link
              href="/admin"
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-6 rounded-xl text-center text-sm transition-colors shadow-sm flex justify-center items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              لوحة الإدارة
            </Link>
          )}
        </div>
      </div>

      {/* Application Status Alert */}
      {userData?.applicationStatus && (
        <div className="bg-orange-50 border border-orange-200 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
             <Clock className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">طلبك قيد المراجعة</h3>
            <p className="text-xs text-slate-600 mt-1">
              لقد قمت بتقديم طلب للترقية إلى ({userData.applicationStatus === 'Pending_Seller' ? 'تاجر' : 'دعم فني'}) وجاري مراجعته من قبل الإدارة. سيتم تفعيل حسابك قريباً.
            </p>
          </div>
        </div>
      )}

      {/* Apply for Jobs Section (Only for Customers without pending applications) */}
      {userData?.role === 'Customer' && !userData?.applicationStatus && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-5 text-center sm:text-right shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-white text-blue-600 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-blue-50">
              <Store className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 text-lg">انضم كتاجر</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">افتح متجرك الخاص وابدأ في بيع منتجاتك لآلاف العملاء. نطلب فقط التحقق من الهوية لضمان الأمان.</p>
              <Link href="/apply-seller" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl text-sm transition-all active:scale-95 shadow-sm shadow-blue-600/20">
                تقديم طلب تاجر
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-5 text-center sm:text-right shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-white text-purple-600 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-purple-50">
              <Headset className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 text-lg">فريق الدعم الفني</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">هل تجيد مساعدة الآخرين وحل المشكلات؟ انضم لفريق خدمة العملاء الخاص بنا واعمل بمرونة.</p>
              <Link href="/support/apply" className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-xl text-sm transition-all active:scale-95 shadow-sm shadow-purple-600/20">
                تقديم طلب توظيف
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quick Links Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href="/account/orders"
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-600/50 transition-all group flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">الطلبات</h3>
            <p className="text-xs text-slate-500 mt-0.5">متابعة وعرض حالة طلباتك السابقة</p>
          </div>
        </Link>

        <Link
          href="/account/wishlist"
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-600/50 transition-all group flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">المفضلة</h3>
            <p className="text-xs text-slate-500 mt-0.5">المنتجات المحفوظة لشرائها لاحقاً</p>
          </div>
        </Link>

        <Link
          href="/account/addresses"
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-600/50 transition-all group flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">عناوين التوصيل</h3>
            <p className="text-xs text-slate-500 mt-0.5">إدارة عناوين الشحن الخاصة بك</p>
          </div>
        </Link>
      </div>
    </div>
  );
}