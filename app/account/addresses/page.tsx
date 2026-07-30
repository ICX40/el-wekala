"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { MapPin, Plus, Trash2, Loader2, Home, Briefcase } from 'lucide-react';

interface Address {
  id: string;
  title: string;
  city: string;
  street: string;
  phone: string;
}

export default function AddressesPage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form state
  const [newTitle, setNewTitle] = useState("المنزل");
  const [newCity, setNewCity] = useState("");
  const [newStreet, setNewStreet] = useState("");
  const [newPhone, setNewPhone] = useState("");

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const q = query(collection(db, "addresses"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      const fetched: Address[] = [];
      snapshot.forEach(doc => {
        fetched.push({ id: doc.id, ...doc.data() } as Address);
      });
      setAddresses(fetched);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsAdding(true);
    try {
      const addressData = {
        userId: user.uid,
        title: newTitle,
        city: newCity,
        street: newStreet,
        phone: newPhone,
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, "addresses"), addressData);
      setAddresses([...addresses, { id: docRef.id, ...addressData }]);
      
      // Reset form
      setNewCity("");
      setNewStreet("");
      setNewPhone("");
      setNewTitle("المنزل");
    } catch (error) {
      console.error("Error adding address:", error);
      alert("حدث خطأ أثناء إضافة العنوان.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا العنوان؟")) return;
    try {
      await deleteDoc(doc(db, "addresses", id));
      setAddresses(addresses.filter(a => a.id !== id));
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">دفتر العناوين</h1>
        <p className="text-slate-500 mt-1">أدر عناوينك المحفوظة لتسريع عملية الشراء في المرات القادمة.</p>
      </div>

      {/* Add New Address Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
          <Plus className="w-5 h-5 text-blue-600" />
          إضافة عنوان جديد
        </h2>
        <form onSubmit={handleAddAddress} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">نوع العنوان</label>
            <select
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            >
              <option value="المنزل">المنزل</option>
              <option value="العمل">العمل</option>
              <option value="أخرى">أخرى</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">المدينة / المحافظة</label>
            <input
              type="text"
              required
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              placeholder="مثال: القاهرة"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-bold text-slate-700">العنوان بالتفصيل (الشارع، المبنى، الشقة)</label>
            <input
              type="text"
              required
              value={newStreet}
              onChange={(e) => setNewStreet(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              placeholder="مثال: 15 شارع اللاسلكي، المعادي"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-bold text-slate-700">رقم الهاتف للتواصل</label>
            <input
              type="tel"
              required
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              placeholder="رقم الموبايل"
            />
          </div>

          <div className="md:col-span-2 pt-2">
            <button
              type="submit"
              disabled={isAdding}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : 'حفظ العنوان'}
            </button>
          </div>
        </form>
      </div>

      {/* Saved Addresses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.length === 0 ? (
          <div className="md:col-span-2 bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-8 text-center text-slate-500">
            لا توجد عناوين محفوظة حالياً.
          </div>
        ) : (
          addresses.map((address) => (
            <div key={address.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative group hover:border-blue-600/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                  {address.title === 'العمل' ? <Briefcase className="w-6 h-6" /> : <Home className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{address.title}</h3>
                  <p className="text-sm text-slate-600 mb-1">{address.city} - {address.street}</p>
                  <p className="text-sm font-medium text-slate-900 dir-ltr text-right">{address.phone}</p>
                </div>
              </div>
              
              <button 
                onClick={() => handleDelete(address.id)}
                className="absolute top-4 left-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                title="حذف العنوان"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}