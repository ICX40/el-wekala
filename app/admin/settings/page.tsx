"use client";

import React, { useState } from 'react';
import { Loader2, Settings, Percent, Mail, Phone, Save, CheckCircle2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  
  // In a fully integrated app, these would be fetched from a 'settings' document in Firestore
  const [formData, setFormData] = useState({
    siteName: "الوكالة",
    commissionRate: "10",
    supportEmail: "support@elwekala.com",
    supportPhone: "+201001234567",
    maintenanceMode: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg("");

    try {
      // Simulate saving to Firestore
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccessMsg("تم حفظ إعدادات المنصة بنجاح!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("حدث خطأ أثناء حفظ الإعدادات.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir="rtl">
      
      <div>
        <h1 className="text-2xl font-bold text-slate-900">إعدادات المنصة</h1>
        <p className="text-slate-500 mt-1">إدارة الإعدادات العامة للمتجر، العمولة، وبيانات التواصل.</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl flex items-center gap-3 border border-emerald-200">
          <CheckCircle2 className="w-6 h-6 shrink-0" />
          <p className="font-bold">{successMsg}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <form onSubmit={handleSaveSettings} className="p-6 md:p-8 space-y-8">
          
          {/* General Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              الإعدادات العامة
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">اسم المنصة</label>
                <input
                  type="text"
                  name="siteName"
                  required
                  value={formData.siteName}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Percent className="w-4 h-4 text-blue-600" />
                  عمولة المنصة من التجار (%)
                </label>
                <input
                  type="number"
                  name="commissionRate"
                  required
                  min="0"
                  max="100"
                  value={formData.commissionRate}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Contact Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">بيانات التواصل والدعم</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  البريد الإلكتروني للدعم
                </label>
                <input
                  type="email"
                  name="supportEmail"
                  required
                  value={formData.supportEmail}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-900 dir-ltr text-right"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  رقم الهاتف (الخط الساخن)
                </label>
                <input
                  type="text"
                  name="supportPhone"
                  required
                  value={formData.supportPhone}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-900 dir-ltr text-right"
                />
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">إعدادات النظام</h3>
            
            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                id="maintenanceMode"
                name="maintenanceMode"
                checked={formData.maintenanceMode}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="maintenanceMode" className="text-sm font-bold text-slate-700 cursor-pointer select-none flex-1">
                تفعيل وضع الصيانة
                <p className="text-xs text-slate-500 font-normal mt-0.5">سيتم إيقاف الموقع للزوار وإظهار رسالة الصيانة.</p>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-10 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              حفظ الإعدادات
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}