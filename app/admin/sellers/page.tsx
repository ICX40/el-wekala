"use client";

import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { SellerProfile } from '@/types';
import { Loader2, Search, Store, Ban, CheckCircle, XCircle } from 'lucide-react';

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [filteredSellers, setFilteredSellers] = useState<SellerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const q = query(
          collection(db, "users"),
          where("role", "==", "Seller")
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedSellers: SellerProfile[] = [];
        
        querySnapshot.forEach((doc) => {
          fetchedSellers.push({ uid: doc.id, ...doc.data() } as SellerProfile);
        });

        setSellers(fetchedSellers);
        setFilteredSellers(fetchedSellers);
      } catch (error) {
        console.error("Error fetching sellers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSellers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredSellers(sellers);
    } else {
      const lowercasedTerm = searchTerm.toLowerCase();
      const filtered = sellers.filter(
        s => 
          s.displayName?.toLowerCase().includes(lowercasedTerm) || 
          s.storeName?.toLowerCase().includes(lowercasedTerm) ||
          s.email?.toLowerCase().includes(lowercasedTerm)
      );
      setFilteredSellers(filtered);
    }
  }, [searchTerm, sellers]);

  const handleStatusChange = async (sellerId: string, newStatus: SellerProfile['status']) => {
    setUpdatingId(sellerId);
    try {
      const sellerRef = doc(db, "users", sellerId);
      await updateDoc(sellerRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      const updatedSellers = sellers.map(s => 
        s.uid === sellerId ? { ...s, status: newStatus } : s
      );
      setSellers(updatedSellers);
      setFilteredSellers(updatedSellers);
    } catch (error) {
      console.error("Error updating seller status:", error);
      alert("حدث خطأ أثناء محاولة تحديث حالة التاجر.");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: SellerProfile['status']) => {
    switch (status) {
      case 'Approved': return <span className="bg-success/10 text-success px-3 py-1 rounded-full text-xs font-bold">مقبول</span>;
      case 'Rejected': return <span className="bg-error/10 text-error px-3 py-1 rounded-full text-xs font-bold">مرفوض</span>;
      case 'Suspended': return <span className="bg-warning/10 text-warning px-3 py-1 rounded-full text-xs font-bold">موقوف</span>;
      case 'Pending':
      default: return <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs font-bold">قيد المراجعة</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-medium">جاري تحميل بيانات التجار...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة التجار</h1>
          <p className="text-muted-foreground mt-1">مراجعة حسابات المتاجر، وقبولها، أو إيقافها.</p>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-bold flex items-center gap-2">
          <Store className="w-5 h-5" />
          {filteredSellers.length} متجر
        </div>
      </div>

      <div className="bg-surface p-4 rounded-xl border border-border shadow-sm flex items-center">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="ابحث باسم المتجر أو التاجر..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
        {filteredSellers.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <Store className="w-16 h-16 text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">لا توجد متاجر</h3>
            <p className="text-muted-foreground text-sm">
              لم نتمكن من العثور على أي حساب مسجل كتاجر.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-foreground">بيانات المتجر</th>
                  <th className="px-6 py-4 text-sm font-semibold text-foreground">معلومات الاتصال</th>
                  <th className="px-6 py-4 text-sm font-semibold text-foreground">الرصيد المتاح</th>
                  <th className="px-6 py-4 text-sm font-semibold text-foreground">الحالة</th>
                  <th className="px-6 py-4 text-sm font-semibold text-foreground">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSellers.map((seller) => {
                  return (
                    <tr key={seller.uid} className="hover:bg-muted/30 transition-colors">
                      
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">{seller.storeName || "اسم المتجر غير محدد"}</span>
                          <span className="text-xs text-muted-foreground mt-1">المالك: {seller.displayName}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm text-foreground">{seller.email}</span>
                          {seller.phoneNumber && <span className="text-xs text-muted-foreground">{seller.phoneNumber}</span>}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-bold text-foreground">
                          {(seller.balance || 0).toLocaleString('ar-EG')} ج.م
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {getStatusBadge(seller.status)}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleStatusChange(seller.uid, 'Approved')}
                            disabled={updatingId === seller.uid || seller.status === 'Approved'}
                            className="p-2 text-success hover:bg-success/10 rounded-md transition-colors disabled:opacity-30"
                            title="قبول"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleStatusChange(seller.uid, 'Suspended')}
                            disabled={updatingId === seller.uid || seller.status === 'Suspended'}
                            className="p-2 text-warning hover:bg-warning/10 rounded-md transition-colors disabled:opacity-30"
                            title="إيقاف مؤقت"
                          >
                            <Ban className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleStatusChange(seller.uid, 'Rejected')}
                            disabled={updatingId === seller.uid || seller.status === 'Rejected'}
                            className="p-2 text-error hover:bg-error/10 rounded-md transition-colors disabled:opacity-30"
                            title="رفض"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                          {updatingId === seller.uid && <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />}
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}