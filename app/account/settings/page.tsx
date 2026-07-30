"use client";

import React, { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { auth, db } from '@/firebase/config';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { Loader2, User, Mail, Save, CheckCircle2 } from 'lucide-react';

export default function AccountSettingsPage() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setSuccessMsg("");
    
    try {
      // 1. Update Firebase Auth Profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: displayName
        });
      }

      // 2. Update Firestore User Document
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        displayName: displayName,
        updatedAt: new Date().toISOString()
      });

      setSuccessMsg("تم تحديث بيانات الحساب بنجاح!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("حدث خطأ أثناء تحديث البيانات.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">إعدادات الحساب</h1>
        <p className="text-[#64748B] mt-1">تعديل بياناتك الشخصية المسجلة لدينا.</p>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden max-w-2xl">
        <form onSubmit={handleUpdateProfile} className="p-6 md:p-8 space-y-6">
          
          {successMsg && (
            <div className="bg-[#10B981]/10 text-[#10B981] p-4 rounded-lg flex items-center gap-2 border border-[#10B981]/20">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <p className="text-sm font-bold">{successMsg}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <User className="w-4 h-4 text-[#2563EB]" />
              الاسم بالكامل
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-3 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-[#0F172A]"
              placeholder="أدخل اسمك بالكامل"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#2563EB]" />
              البريد الإلكتروني
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ""}
              className="w-full bg-[#E2E8F0]/50 border border-[#E2E8F0] rounded-lg px-4 py-3 text-[#64748B] cursor-not-allowed"
              title="لا يمكن تغيير البريد الإلكتروني حالياً"
            />
            <p className="text-xs text-[#94A3B8]">البريد الإلكتروني مرتبط بحسابك ولا يمكن تعديله لأسباب أمنية.</p>
          </div>

          <div className="pt-4 border-t border-[#E2E8F0]">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              حفظ التعديلات
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}