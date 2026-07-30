"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/components/AuthProvider';
import { Loader2, UploadCloud, Store, CheckCircle2, UserCheck, AlertCircle, Camera, CreditCard, ChevronRight, ChevronLeft } from 'lucide-react';

export default function SellerApplicationPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(); // Assuming useAuth provides a loading state
  
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Step 1: Business Data
  const [formData, setFormData] = useState({
    businessName: "",
    bio: "",
    category: "الإلكترونيات والموبايلات",
  });

  // Step 2: Payment Methods
  const [paymentData, setPaymentData] = useState({
    vodafoneCash: "",
    instapay: "",
    fawryYellowCard: "",
  });

  // Step 3: Identity & KYC
  const [images, setImages] = useState({
    idFront: "",
    idBack: "",
    selfie: ""
  });

  // Camera States
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Fix the redirect bug by waiting for auth to resolve
  useEffect(() => {
    // If your AuthProvider doesn't have 'loading', we use a small timeout to let Firebase init
    const timer = setTimeout(() => {
      setIsAuthChecking(false);
      if (!user && !authLoading) {
        router.push('/login');
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [user, authLoading, router]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access denied", err);
      alert("يرجى السماح للمتصفح بالوصول إلى الكاميرا لالتقاط الصورة.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  };

  const captureSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        const imageData = canvasRef.current.toDataURL('image/jpeg', 0.8);
        setImages(prev => ({ ...prev, selfie: imageData }));
        stopCamera();
      }
    }
  };

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

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.businessName || !formData.bio) {
        setErrorMsg("يرجى ملء جميع بيانات المتجر.");
        return;
      }
    }
    if (currentStep === 2) {
      if (!paymentData.vodafoneCash && !paymentData.instapay && !paymentData.fawryYellowCard) {
        setErrorMsg("يرجى إدخال وسيلة دفع واحدة على الأقل لاستلام أرباحك.");
        return;
      }
    }
    setErrorMsg("");
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setErrorMsg("");
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!images.idFront || !images.idBack || !images.selfie) {
      setErrorMsg("يرجى إرفاق جميع الصور المطلوبة (وجه البطاقة، ظهر البطاقة، والسيلفي).");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const sellerId = generateShortId('SEL');

      const applicationData = {
        userId: user.uid,
        sellerShortId: sellerId,
        status: 'Pending',
        businessName: formData.businessName,
        bio: formData.bio,
        category: formData.category,
        paymentMethods: paymentData,
        documents: images,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "seller_applications"), applicationData);
      
      await updateDoc(doc(db, "users", user.uid), {
        applicationStatus: 'Pending_Seller'
      });

      setSuccessMsg("تم تقديم الطلب بنجاح! سيتم مراجعة هويتك وبياناتك من قبل الإدارة.");
      
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

  if (isAuthChecking) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 space-y-8" dir="rtl">
      
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Store className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">انضم كتاجر في الوكالة</h1>
        <p className="text-slate-500">أكمل الخطوات الثلاثة لتوثيق حسابك وبدء البيع.</p>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10 rounded-full"></div>
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 -z-10 rounded-full transition-all duration-300"
          style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%', right: 0, left: 'auto' }}
        ></div>
        
        {[1, 2, 3].map((step) => (
          <div key={step} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-4 transition-colors ${
            currentStep >= step ? 'bg-blue-600 border-white text-white shadow-md' : 'bg-slate-200 border-white text-slate-500'
          }`}>
            {step}
          </div>
        ))}
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
        
        {/* STEP 1: Business Info */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Store className="w-6 h-6 text-blue-600" />
              الخطوة 1: معلومات النشاط التجاري
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">اسم المتجر / العلامة التجارية</label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  placeholder="مثال: مؤسسة الأمانة للإلكترونيات"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">عرف عن نفسك وعن الشغل بتاعك</label>
                <textarea
                  required
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 resize-none"
                  placeholder="اكتب نبذة عن المنتجات التي تبيعها وخبرتك في السوق..."
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">التصنيف الأساسي لمنتجاتك</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                >
                  <option>الإلكترونيات والموبايلات</option>
                  <option>الأزياء والملابس</option>
                  <option>الجمال والعطور</option>
                  <option>المنزل والأجهزة</option>
                  <option>الرياضة والخارج</option>
                  <option>أخرى</option>
                </select>
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <button onClick={nextStep} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all">
                التالي
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Payment Methods */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-blue-600" />
              الخطوة 2: طرق استلام الأرباح
            </h3>
            <p className="text-sm text-slate-500">أدخل بيانات الدفع الخاصة بك لاستلام أرباحك. هذه البيانات سرية وستظهر للإدارة فقط. (يرجى إدخال وسيلة واحدة على الأقل).</p>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">رقم فودافون كاش (Vodafone Cash)</label>
                <input
                  type="text"
                  value={paymentData.vodafoneCash}
                  onChange={(e) => setPaymentData({...paymentData, vodafoneCash: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 dir-ltr text-right"
                  placeholder="010xxxxxxxxx"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">حساب إنستاباي (InstaPay Address)</label>
                <input
                  type="text"
                  value={paymentData.instapay}
                  onChange={(e) => setPaymentData({...paymentData, instapay: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 dir-ltr text-right"
                  placeholder="username@instapay"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">رقم بطاقة فوري الصفراء (Fawry Yellow Card)</label>
                <input
                  type="text"
                  value={paymentData.fawryYellowCard}
                  onChange={(e) => setPaymentData({...paymentData, fawryYellowCard: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 dir-ltr text-right"
                  placeholder="رقم الكارت المكون من 16 رقم"
                />
              </div>
            </div>

            <div className="pt-6 flex justify-between items-center border-t border-slate-100">
              <button onClick={prevStep} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all">
                <ChevronRight className="w-5 h-5" />
                السابق
              </button>
              <button onClick={nextStep} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all">
                التالي
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: KYC & Camera */}
        {currentStep === 3 && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-blue-600" />
              الخطوة 3: توثيق الهوية (KYC)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* ID Cards Upload */}
              <div className="space-y-4">
                <span className="text-sm font-bold text-slate-900 block border-b border-slate-100 pb-2">صور بطاقة الهوية</span>
                
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-blue-500 transition-colors bg-slate-50">
                  <input type="file" accept="image/*" id="idFront" className="hidden" onChange={(e) => handleImageChange(e, 'idFront')} />
                  <label htmlFor="idFront" className="cursor-pointer flex flex-col items-center justify-center h-full">
                    {images.idFront ? (
                      <img src={images.idFront} alt="ID Front" className="h-32 object-cover rounded-lg mb-2 w-full" />
                    ) : (
                      <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                    )}
                    <span className="text-sm font-bold text-slate-700">صورة البطاقة (الوجه)</span>
                  </label>
                </div>

                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-blue-500 transition-colors bg-slate-50">
                  <input type="file" accept="image/*" id="idBack" className="hidden" onChange={(e) => handleImageChange(e, 'idBack')} />
                  <label htmlFor="idBack" className="cursor-pointer flex flex-col items-center justify-center h-full">
                    {images.idBack ? (
                      <img src={images.idBack} alt="ID Back" className="h-32 object-cover rounded-lg mb-2 w-full" />
                    ) : (
                      <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                    )}
                    <span className="text-sm font-bold text-slate-700">صورة البطاقة (الخلف)</span>
                  </label>
                </div>
              </div>

              {/* Camera Selfie Capture */}
              <div className="space-y-4">
                <span className="text-sm font-bold text-slate-900 block border-b border-slate-100 pb-2">التقاط صورة سيلفي</span>
                
                <div className="bg-slate-900 rounded-xl overflow-hidden relative aspect-[3/4] flex flex-col items-center justify-center shadow-inner">
                  
                  {images.selfie ? (
                    <>
                      <img src={images.selfie} alt="Captured Selfie" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => { setImages(prev => ({...prev, selfie: ""})); startCamera(); }}
                        className="absolute bottom-4 bg-white/90 text-slate-900 font-bold px-4 py-2 rounded-lg text-sm shadow-md hover:bg-white transition-colors"
                      >
                        إعادة الالتقاط
                      </button>
                    </>
                  ) : (
                    <>
                      <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover ${!isCameraActive ? 'hidden' : ''}`}></video>
                      <canvas ref={canvasRef} className="hidden"></canvas>
                      
                      {!isCameraActive ? (
                        <div className="text-center p-6">
                          <Camera className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-50" />
                          <p className="text-white text-sm font-bold mb-4">يجب التقاط صورة حية لوجهك</p>
                          <button 
                            type="button"
                            onClick={startCamera}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg text-sm"
                          >
                            فتح الكاميرا
                          </button>
                        </div>
                      ) : (
                        <button 
                          type="button"
                          onClick={captureSelfie}
                          className="absolute bottom-6 bg-white w-16 h-16 rounded-full border-4 border-slate-300 shadow-xl flex items-center justify-center hover:scale-105 transition-transform"
                        >
                          <div className="w-12 h-12 bg-blue-600 rounded-full"></div>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

            </div>

            <div className="pt-6 flex justify-between items-center border-t border-slate-100">
              <button type="button" onClick={prevStep} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all">
                <ChevronRight className="w-5 h-5" />
                السابق
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !images.selfie}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                تقديم الطلب
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}