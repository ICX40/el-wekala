"use client";

import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, orderBy, query } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Order } from '@/types';
import { Loader2, Search, ShoppingBag } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedOrders: Order[] = [];
      querySnapshot.forEach((doc) => {
        fetchedOrders.push({ id: doc.id, ...doc.data() } as Order);
      });
      setOrders(fetchedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus as Order["status"] } : order
      ));
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("حدث خطأ أثناء تحديث حالة الطلب.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.shippingAddress.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Cancelled': return 'bg-red-50 text-red-600 border-red-100';
      case 'Processing':
      case 'Shipped': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Pending':
      default: return 'bg-orange-50 text-orange-600 border-orange-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Pending': return 'قيد المراجعة';
      case 'Processing': return 'قيد التجهيز';
      case 'Shipped': return 'تم الشحن';
      case 'Delivered': return 'تم التوصيل';
      case 'Cancelled': return 'تم الإلغاء';
      default: return status;
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
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">إدارة الطلبات</h1>
          <p className="text-slate-500 mt-1">متابعة وتحديث حالة جميع الطلبات في المنصة.</p>
        </div>
        
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute right-3 top-2.5 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="بحث برقم الطلب أو اسم العميل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="px-6 py-4">رقم الطلب</th>
                <th className="px-6 py-4">العميل</th>
                <th className="px-6 py-4">التاريخ</th>
                <th className="px-6 py-4">الإجمالي</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4">تحديث الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    لا توجد طلبات تطابق بحثك حالياً.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-blue-600">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{order.shippingAddress.fullName}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{order.shippingAddress.phoneNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-6 py-4 font-extrabold text-slate-900">
                      {order.finalAmount.toLocaleString('ar-EG')} ج.م
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {updatingId === order.id ? (
                          <Loader2 className="w-5 h-5 text-blue-600 animate-spin mx-auto" />
                        ) : (
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-xs font-bold text-slate-700"
                          >
                            <option value="Pending">قيد المراجعة</option>
                            <option value="Processing">قيد التجهيز</option>
                            <option value="Shipped">تم الشحن</option>
                            <option value="Delivered">تم التوصيل</option>
                            <option value="Cancelled">تم الإلغاء</option>
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}