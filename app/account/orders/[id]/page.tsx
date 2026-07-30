"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Order } from '@/types';
import { Loader2, ArrowRight, Package, MapPin, CreditCard } from 'lucide-react';

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!params?.id) return;
      try {
        const docRef = doc(db, "orders", params.id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setOrder({ id: docSnap.id, ...docSnap.data() } as Order);
        } else {
          console.error("Order not found");
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [params?.id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
        <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900">لم يتم العثور على الطلب</h2>
        <Link href="/account/orders" className="text-blue-600 hover:underline mt-2 inline-block">العودة لقائمة الطلبات</Link>
      </div>
    );
  }

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'Cancelled': return 'bg-red-50 text-red-600 border-red-200';
      case 'Processing':
      case 'Shipped': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'Pending':
      default: return 'bg-orange-50 text-orange-600 border-orange-200';
    }
  };

  const orderDate = new Date(order.createdAt).toLocaleDateString('ar-EG', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="space-y-6 max-w-4xl">
      
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <Link href="/account/orders" className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">تفاصيل الطلب {order.orderNumber}</h1>
          <p className="text-slate-500 text-sm mt-1">{orderDate}</p>
        </div>
        
        <div className={`mr-auto px-4 py-1.5 rounded-full border text-sm font-bold ${getStatusColor(order.status)}`}>
          {getStatusText(order.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-800">
              المنتجات ({order.items.length})
            </div>
            <div className="divide-y divide-slate-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-4 flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                  <div className="w-24 h-24 bg-white border border-slate-200 rounded-xl overflow-hidden shrink-0 p-2">
                    <img src={item.image || 'https://placehold.co/100'} alt={item.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 text-center sm:text-right">
                    <h3 className="font-bold text-slate-900 line-clamp-2 hover:text-blue-600 transition-colors">
                      <Link href={`/product/${item.productId}`}>{item.name}</Link>
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">الكمية: {item.quantity}</p>
                  </div>
                  <div className="font-extrabold text-slate-900 text-lg whitespace-nowrap">
                    {(item.price * item.quantity).toLocaleString('ar-EG')} ج.م
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">ملخص الدفع</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>المجموع الفرعي</span>
                <span>{order.totalAmount.toLocaleString('ar-EG')} ج.م</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>رسوم الشحن</span>
                <span className="text-emerald-600 font-bold">مجانًا</span>
              </div>
              <div className="flex justify-between font-extrabold text-lg text-slate-900 border-t border-slate-100 pt-3">
                <span>الإجمالي</span>
                <span className="text-red-600">{order.finalAmount.toLocaleString('ar-EG')} ج.م</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              عنوان التوصيل
            </h3>
            <div className="text-sm text-slate-600 space-y-1">
              <p className="font-bold text-slate-900">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}</p>
              <p className="dir-ltr text-right mt-2">{order.shippingAddress.phoneNumber}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              طريقة الدفع
            </h3>
            <p className="text-sm font-bold text-slate-700">
              {order.paymentMethod === 'Cash on Delivery' ? 'الدفع نقداً عند الاستلام' : 'بطاقة بنكية'}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}