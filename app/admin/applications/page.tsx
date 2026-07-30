"use client";

import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import { useAuth } from '@/components/AuthProvider';
import { Loader2, CheckCircle, XCircle, Store, Headset, UserCheck, CreditCard } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AdminApplicationsPage() {
  const { user } = useAuth();
  const [sellerApps, setSellerApps] = useState<any[]>([]);
  const [supportApps, setSupportApps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'seller' | 'support'>('seller');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const qSeller = query(collection(db, "seller_applications"), where("status", "==", "Pending"));
      const sellerSnap = await getDocs(qSeller);
      const sApps: any[] = [];
      sellerSnap.forEach(doc => sApps.push({ id: doc.id, ...doc.data() }));
      setSellerApps(sApps);

      const qSupport = query(collection(db, "support_applications"), where("status", "==", "Pending"));
      const supportSnap = await getDocs(qSupport);
      const supApps: any[] = [];
      supportSnap.forEach(doc => supApps.push({ id: doc.id, ...doc.data() }));
      setSupportApps(supApps);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("حدث خطأ أثناء جلب الطلبات.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleProcessApplication = async (application: any, type: 'seller' | 'support', action: 'approve' | 'reject') => {
    const confirmMessage = action === 'approve' 
      ? "هل أنت متأكد من الموافقة على هذا الطلب وترقية الحساب؟" 
      : "هل أنت متأكد من رفض هذا الطلب؟";
      
    if (!window.confirm(confirmMessage)) return;
    
    if (!user) {
      toast.error("حدث خطأ: المصادقة غير صالحة.");
      return;
    }

    setProcessingId(application.id);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User not authenticated properly");
      }
      
      const token = await currentUser.getIdToken();

      const response = await fetch('/api/admin/promote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          applicationId: application.id,
          userId: application.userId,
          type: type,
          action: action
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process application');
      }

      if (type === 'seller') {
        setSellerApps(prev => prev.filter(app => app.id !== application.id));
      } else {
        setSupportApps(prev => prev.filter(app => app.id !== application.id));
      }

      toast.success(action === 'approve' ? "تمت الموافقة وترقية الحساب بنجاح!" : "تم رفض الطلب بنجاح.");
      
    } catch (error) {
      console.error(`Error processing application (${action}):`, error);
      toast.error("حدث خطأ أثناء معالجة الطلب في السيرفر.");
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto" dir="rtl">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">مراجعة طلبات الانضمام (KYC)</h1>
          <p className="text-slate-500 mt-1">التحقق من الهوية وصور البطاقة لترقية العملاء إلى تجار أو دعم فني.</p>
        </div>
        <Link href="/admin" className="text-blue-600 font-bold hover:underline text-sm bg-blue-50 px-4 py-2 rounded-lg">
          العودة للوحة الإدارة
        </Link>
      </div>

      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('seller')}
          className={`flex items-center gap-2 py-4 px-6 font-bold text-sm transition-colors border-b-2 ${
            activeTab === 'seller' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Store className="w-4 h-4" />
          طلبات التجار ({sellerApps.length})
        </button>
        <button
          onClick={() => setActiveTab('support')}
          className={`flex items-center gap-2 py-4 px-6 font-bold text-sm transition-colors border-b-2 ${
            activeTab === 'support' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Headset className="w-4 h-4" />
          طلبات الدعم الفني ({supportApps.length})
        </button>
      </div>

      <div className="space-y-6">
        
        {/* SELLER APPLICATIONS */}
        {activeTab === 'seller' && (
          sellerApps.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
              <UserCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900">لا توجد طلبات تجار جديدة</h3>
              <p className="text-slate-500 mt-1">لقد قمت بمراجعة جميع الطلبات.</p>
            </div>
          ) : (
            sellerApps.map(app => (
              <div key={app.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row gap-8">
                
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <span className="bg-blue-100 text-blue-700 font-mono text-xs font-bold px-2 py-1 rounded">
                      {app.sellerShortId}
                    </span>
                    <h2 className="text-xl font-bold text-slate-900">{app.businessName}</h2>
                  </div>
                  
                  <div>
                    <span className="text-xs font-bold text-slate-500 block mb-1">النبذة (Bio)</span>
                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                      {app.bio}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-xs font-bold text-slate-500 block mb-1">القسم</span>
                    <span className="text-sm font-bold text-slate-900">{app.category}</span>
                  </div>

                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-orange-800 flex items-center gap-1 mb-2">
                      <CreditCard className="w-4 h-4" />
                      وسائل الدفع (خاص بالإدارة)
                    </h4>
                    <div className="space-y-1.5 text-sm">
                      {app.paymentMethods?.vodafoneCash && (
                        <div className="flex justify-between border-b border-orange-200/50 pb-1">
                          <span className="text-slate-600">فودافون كاش:</span>
                          <span className="font-bold font-mono text-slate-900">{app.paymentMethods.vodafoneCash}</span>
                        </div>
                      )}
                      {app.paymentMethods?.instapay && (
                        <div className="flex justify-between border-b border-orange-200/50 pb-1">
                          <span className="text-slate-600">إنستاباي:</span>
                          <span className="font-bold font-mono text-slate-900">{app.paymentMethods.instapay}</span>
                        </div>
                      )}
                      {app.paymentMethods?.fawryYellowCard && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">فوري الأصفر:</span>
                          <span className="font-bold font-mono text-slate-900">{app.paymentMethods.fawryYellowCard}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-1/2 space-y-4">
                  <span className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 block">مستندات الهوية (KYC)</span>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-500 text-center block">سيلفي</span>
                      <img src={app.documents.selfie} alt="Selfie" className="w-full h-32 object-cover rounded-xl border border-slate-200 shadow-sm cursor-zoom-in hover:opacity-90" onClick={() => window.open(app.documents.selfie)} />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-500 text-center block">البطاقة (وجه)</span>
                      <img src={app.documents.idFront} alt="Front" className="w-full h-32 object-cover rounded-xl border border-slate-200 shadow-sm cursor-zoom-in hover:opacity-90" onClick={() => window.open(app.documents.idFront)} />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-500 text-center block">البطاقة (ظهر)</span>
                      <img src={app.documents.idBack} alt="Back" className="w-full h-32 object-cover rounded-xl border border-slate-200 shadow-sm cursor-zoom-in hover:opacity-90" onClick={() => window.open(app.documents.idBack)} />
                    </div>
                  </div>
                </div>

                <div className="flex lg:flex-col justify-end gap-3 lg:border-r lg:border-slate-100 lg:pr-6 lg:w-48">
                  <button 
                    onClick={() => handleProcessApplication(app, 'seller', 'approve')}
                    disabled={processingId === app.id}
                    className="flex-1 lg:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {processingId === app.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                    قبول وترقية
                  </button>
                  <button 
                    onClick={() => handleProcessApplication(app, 'seller', 'reject')}
                    disabled={processingId === app.id}
                    className="flex-1 lg:flex-none bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors border border-red-200 disabled:opacity-50"
                  >
                    {processingId === app.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                    رفض الطلب
                  </button>
                </div>

              </div>
            ))
          )
        )}

        {/* SUPPORT APPLICATIONS */}
        {activeTab === 'support' && (
          supportApps.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
              <UserCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900">لا توجد طلبات دعم فني جديدة</h3>
              <p className="text-slate-500 mt-1">لقد قمت بمراجعة جميع الطلبات.</p>
            </div>
          ) : (
            supportApps.map(app => (
              <div key={app.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row gap-8">
                
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <span className="bg-purple-100 text-purple-700 font-mono text-xs font-bold px-2 py-1 rounded">
                      {app.supportShortId}
                    </span>
                    <h2 className="text-xl font-bold text-slate-900">طلب انضمام للدعم</h2>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-bold text-slate-500 block mb-1">رقم الهاتف</span>
                      <span className="text-sm font-bold text-slate-900 dir-ltr block text-right">{app.phone}</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-500 block mb-1">التفرغ</span>
                      <span className="text-sm font-bold text-slate-900">{app.availability}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-500 block mb-1">الخبرات السابقة</span>
                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                      {app.experience}
                    </p>
                  </div>
                </div>

                <div className="w-full lg:w-1/2 space-y-4">
                  <span className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 block">مستندات الهوية (KYC)</span>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-500 text-center block">سيلفي</span>
                      <img src={app.documents.selfie} alt="Selfie" className="w-full h-32 object-cover rounded-xl border border-slate-200 shadow-sm cursor-zoom-in hover:opacity-90" onClick={() => window.open(app.documents.selfie)} />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-500 text-center block">البطاقة (وجه)</span>
                      <img src={app.documents.idFront} alt="Front" className="w-full h-32 object-cover rounded-xl border border-slate-200 shadow-sm cursor-zoom-in hover:opacity-90" onClick={() => window.open(app.documents.idFront)} />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-500 text-center block">البطاقة (ظهر)</span>
                      <img src={app.documents.idBack} alt="Back" className="w-full h-32 object-cover rounded-xl border border-slate-200 shadow-sm cursor-zoom-in hover:opacity-90" onClick={() => window.open(app.documents.idBack)} />
                    </div>
                  </div>
                </div>

                <div className="flex lg:flex-col justify-end gap-3 lg:border-r lg:border-slate-100 lg:pr-6 lg:w-48">
                  <button 
                    onClick={() => handleProcessApplication(app, 'support', 'approve')}
                    disabled={processingId === app.id}
                    className="flex-1 lg:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {processingId === app.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                    قبول التوظيف
                  </button>
                  <button 
                    onClick={() => handleProcessApplication(app, 'support', 'reject')}
                    disabled={processingId === app.id}
                    className="flex-1 lg:flex-none bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors border border-red-200 disabled:opacity-50"
                  >
                    {processingId === app.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                    رفض الطلب
                  </button>
                </div>

              </div>
            ))
          )
        )}

      </div>
    </div>
  );
}