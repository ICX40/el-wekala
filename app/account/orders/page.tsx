"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/components/AuthProvider';
import { Order } from '@/types';
import { Loader2, Package, Clock, CheckCircle, XCircle, Search } from 'lucide-react';

export default function CustomerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      try {
        const q = query(
          collection(db, "orders"),
          where("customerId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        
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

    fetchOrders();
  }, [user]);

  const filteredOrders = orders.filter(order => 
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'Delivered': return <CheckCircle className="w-5 h-5 text-success" />;
      case 'Cancelled': return <XCircle className="w-5 h-5 text-error" />;
      case 'Processing':
      case 'Shipped': return <Package className="w-5 h-5 text-primary" />;
      case 'Pending':
      default: return <Clock className="w-5 h-5 text-warning" />;
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'Pending': return 'قيد المراجعة';
      case 'Processing': return 'قيد التجهيز';
      case 'Shipped': return 'تم الشحن';
      case 'Delivered': return 'تم التوصيل';
      case 'Cancelled': return 'ملغي';
      default: return status;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Delivered': return 'bg-success/10 text-success';
      case 'Cancelled': return 'bg-error/10 text-error';
      case 'Processing':
      case 'Shipped': return 'bg-primary/10 text-primary';
      case 'Pending':
      default: return 'bg-warning/10 text-warning';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="text-2xl font-bold text-foreground">طلباتي</h1>
        <p className="text-muted-foreground mt-1">تابع حالة طلباتك واستعرض تفاصيل مشترياتك السابقة.</p>
      </div>

      {/* Search Bar */}
      <div className="bg-surface p-4 rounded-xl border border-border shadow-sm flex items-center">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="ابحث برقم الطلب..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-muted-foreground opacity-50 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">لا توجد طلبات بعد</h3>
            <p className="text-muted-foreground mb-6">لم تقم بإجراء أي طلبات حتى الآن. اكتشف منتجاتنا وابدأ التسوق.</p>
            <Link 
              href="/products" 
              className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
            >
              اذهب للمتجر
            </Link>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            لا توجد نتائج تطابق بحثك.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold text-foreground">رقم الطلب</th>
                  <th className="px-6 py-4 font-semibold text-foreground">التاريخ</th>
                  <th className="px-6 py-4 font-semibold text-foreground">طريقة الدفع</th>
                  <th className="px-6 py-4 font-semibold text-foreground">الإجمالي</th>
                  <th className="px-6 py-4 font-semibold text-foreground">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((order) => {
                  const date = new Date(order.createdAt).toLocaleDateString('ar-EG');
                  
                  return (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/account/orders/${order.id}`} className="font-semibold text-primary hover:underline">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{date}</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {order.paymentMethod === 'Cash on Delivery' ? 'دفع عند الاستلام' : order.paymentMethod}
                      </td>
                      <td className="px-6 py-4 font-bold text-foreground">{order.finalAmount.toLocaleString('ar-EG')} ج.م</td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {getStatusText(order.status)}
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