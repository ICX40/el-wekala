"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';
import { Loader2, Mail, Lock, User, CheckCircle2, XCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Password Policy States
  const [hasUpperCase, setHasUpperCase] = useState(false);
  const [hasLowerCase, setHasLowerCase] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  const [hasMinLength, setHasMinLength] = useState(false);

  useEffect(() => {
    setHasUpperCase(/[A-Z]/.test(password));
    setHasLowerCase(/[a-z]/.test(password));
    setHasNumber(/[0-9]/.test(password));
    setHasSpecialChar(/[^A-Za-z0-9]/.test(password));
    setHasMinLength(password.length >= 6);
  }, [password]);

  const isPasswordValid = hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && hasMinLength;

  // Function to generate short ID
  const generateShortId = (prefix: string) => {
    return `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid) {
      setError('يرجى التأكد من استيفاء كلمة المرور لجميع متطلبات الأمان.');
      return;
    }

    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين.');
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      const customerId = generateShortId('CUS');

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        shortId: customerId,
        email: user.email,
        displayName: name,
        role: 'Customer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      router.push('/');
    } catch (err: any) {
      console.error("Registration error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError('هذا البريد الإلكتروني مسجل بالفعل.');
      } else {
        setError(err.message || 'فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        const customerId = generateShortId('CUS');
        
        await setDoc(userDocRef, {
          uid: user.uid,
          shortId: customerId,
          email: user.email,
          displayName: user.displayName || 'مستخدم جوجل',
          photoURL: user.photoURL,
          role: 'Customer',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      router.push('/');
    } catch (err: any) {
      console.error("Google Sign-In error:", err);
      setError(err.message || 'فشل تسجيل الدخول باستخدام جوجل.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const PolicyItem = ({ isValid, text }: { isValid: boolean, text: string }) => (
    <div className={`flex items-center gap-2 text-[11px] sm:text-xs font-medium transition-colors ${isValid ? 'text-emerald-600' : 'text-slate-400'}`}>
      {isValid ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50" dir="rtl">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-4xl shadow-xl shadow-blue-900/5 border border-slate-100">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">إنشاء حساب</h2>
          <p className="mt-2 text-sm text-slate-500">
            انضم إلينا وابدأ التسوق اليوم.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleRegister}>
          
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full pr-11 pl-4 py-3.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-slate-50 focus:bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                placeholder="الاسم بالكامل"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pr-11 pl-4 py-3.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-slate-50 focus:bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                placeholder="البريد الإلكتروني"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pr-11 pl-4 py-3.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-slate-50 focus:bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                placeholder="كلمة المرور"
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-y-3 gap-x-2">
              <PolicyItem isValid={hasMinLength} text="6 أحرف على الأقل" />
              <PolicyItem isValid={hasUpperCase} text="حرف كبير (A-Z)" />
              <PolicyItem isValid={hasLowerCase} text="حرف صغير (a-z)" />
              <PolicyItem isValid={hasNumber} text="رقم (0-9)" />
              <div className="col-span-2">
                <PolicyItem isValid={hasSpecialChar} text="رمز خاص (!@#...)" />
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full pr-11 pl-4 py-3.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-slate-50 focus:bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                placeholder="تأكيد كلمة المرور"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !isPasswordValid}
            className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'إنشاء حساب'}
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-400 font-medium">أو تابع باستخدام</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 border border-slate-200 rounded-xl shadow-sm bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 active:scale-[0.98]"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                إنشاء حساب باستخدام جوجل
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-8">
          <p className="text-sm text-slate-600">
            لديك حساب بالفعل؟{' '}
            <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}