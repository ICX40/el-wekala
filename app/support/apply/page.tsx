"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/components/AuthProvider';
import { Loader2, UploadCloud, Headset, CheckCircle2, UserCheck, AlertCircle } from 'lucide-react';

export default function SupportApplicationPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    phone: "",
    experience: "",
    availability: "دوام كامل (Full Time)",
  });

  const [images, setImages] = useState({
    idFront: "",
    idBack: "",
    selfie: ""
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("حجم الصورة يجب أن يكون أقل من 2 ميجابايت");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const generateShortId = (prefix: string) => {
    return `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMsg("يجب تسجيل الدخول أولاً.");
      return;
    }

    if (!images.idFront || !images.idBack || !images.selfie) {
      setErrorMsg("يرجى إرفاق جميع الصور المطلوبة للتوثيق.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const supportId = generateShortId('SUP');

      const applicationData = {
        userId: user.uid,
        supportShortId: supportId,
        status: 'Pending',
        phone: formData.phone,
        experience: formData.experience,
        availability: formData.availability,
        documents: images,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "support_applications"), applicationData);
      
      await updateDoc(doc(db, "users", user.uid), {
        applicationStatus: 'Pending_Support'
      });

      setSuccessMsg("تم تقديم طلب التوظيف بنجاح! سيتم مراجعة بياناتك والتواصل معك قريباً.");
      
      setTimeout(() => {
        router.push('/account');
      }, 3000);

    } catch (error) {
      console.error("Error submitting application:", error);
      setErrorMsg("حدث خطأ أثناء إرسال الطلب.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 space-y-8" dir="rtl">
      
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Headset className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">انضم لفريق الدعم الفني</h1>
        <p className="text-slate-500">نبحث عن أشخاص شغوفين بمساعدة العملاء للعمل ضمن فريق الوكالة.</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl flex items-center gap-3 border border-emerald-200">
          <CheckCircle2 className="w-6 h-6 shrink-0" />
          <p className="font-bold">{successMsg}</p>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-200">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <p className="font-bold">{errorMsg}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Professional Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Headset className="w-5 h-5 text-purple-600" />
              البيانات المهنية والتواصل
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">رقم الهاتف للتواصل المباشر</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 dir-ltr text-right"
                  placeholder="01xxxxxxxxx"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">الخبرات السابقة في مجال الدعم الفني</label>
                <textarea
                  required
                  rows={4}
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 resize-none"
                  placeholder="اذكر الأماكن التي عملت بها مسبقاً وما هي طبيعة عملك..."
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">أوقات التفرغ للعمل</label>
                <select
                  value={formData.availability}
                  onChange={(e) => setFormData({...formData, availability: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
                >
                  <option>دوام كامل (Full Time)</option>
                  <option>دوام جزئي - صباحي (Part Time - AM)</option>
                  <option>دوام جزئي - مسائي (Part Time - PM)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Identity Verification (KYC) */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-purple-600" />
              توثيق الهوية (إلزامي)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-purple-500 transition-colors bg-slate-50">
                <input type="file" accept="image/*" id="idFrontSup" className="hidden" onChange={(e) => handleImageChange(e, 'idFront')} />
                <label htmlFor="idFrontSup" className="cursor-pointer flex flex-col items-center justify-center h-full">
                  {images.idFront ? (
                    <img src={images.idFront} alt="ID Front" className="h-24 object-cover rounded-lg mb-2" />
                  ) : (
                    <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                  )}
                  <span className="text-sm font-bold text-slate-700">صورة البطاقة (الوجه)</span>
                </label>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-purple-500 transition-colors bg-slate-50">
                <input type="file" accept="image/*" id="idBackSup" className="hidden" onChange={(e) => handleImageChange(e, 'idBack')} />
                <label htmlFor="idBackSup" className="cursor-pointer flex flex-col items-center justify-center h-full">
                  {images.idBack ? (
                    <img src={images.idBack} alt="ID Back" className="h-24 object-cover rounded-lg mb-2" />
                  ) : (
                    <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                  )}
                  <span className="text-sm font-bold text-slate-700">صورة البطاقة (الخلف)</span>
                </label>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-purple-500 transition-colors bg-slate-50">
                <input type="file" accept="image/*" id="selfieSup" className="hidden" onChange={(e) => handleImageChange(e, 'selfie')} />
                <label htmlFor="selfieSup" className="cursor-pointer flex flex-col items-center justify-center h-full">
                  {images.selfie ? (
                    <img src={images.selfie} alt="Selfie" className="h-24 object-cover rounded-lg mb-2" />
                  ) : (
                    <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                  )}
                  <span className="text-sm font-bold text-slate-700">صورة سيلفي واضحة</span>
                </label>
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center">الحد الأقصى لحجم الصورة 2 ميجابايت.</p>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'تقديم طلب التوظيف'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}