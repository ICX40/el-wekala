"use client";

import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/components/AuthProvider';
import { Order } from '@/types';
import { Loader2, Package, Search, CheckCircle, XCircle, Clock, Save } from 'lucide-react';

export default function SellerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      try {
        // Fetch all orders
        // Note: For a production app with massive data, it's better to store sellerIds array on the order document. 
        // For MVP, we filter client-side.
        const querySnapshot = await getDocs(collection(db, "orders"));
        const fetchedOrders: Order[] = [];
        
        querySnapshot.forEach((doc) => {
          const orderData = { id: doc.id, ...doc.data() } as Order;
          // Check if this order contains any item belonging to this seller
          const hasSellerItem = orderData.items.some(item => item.sellerId === user.uid);
          if (hasSellerItem) {
            fetchedOrders.push(orderData);
          }
        });

        // Sort by newest first
        fetchedOrders.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setOrders(fetchedOrders);
        setFilteredOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  // Handle Search Filtering
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(orders);
    } else {
      const lowercasedTerm = searchTerm.toLowerCase();
      const filtered = orders.filter(
        order => order.orderNumber.toLowerCase().includes(lowercasedTerm)
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, orders]);

  // Alias for search filter state setter to avoid confusion
  const setFilteredProducts = setFilteredOrders;

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    setUpdatingId(orderId);
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      // Update local state
      const updatedOrders = orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      setFilteredOrders(updatedOrders);
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("حدث خطأ أثناء محاولة تحديث حالة الطلب.");
    } finally {
      setUpdatingId(null);
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-medium">جاري تحميل الطلبات...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة الطلبات</h1>
          <p className="text-muted-foreground mt-1">متابعة وتحديث حالات الطلبات الخاصة بمنتجاتك.</p>
        </div>
      </div>

      <div className="bg-surface p-4 rounded-xl border border-border shadow-sm flex items-center">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="ابحث برقم الطلب (مثال: ORD-123)..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">لا يوجد طلبات بعد</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              لم يقم أي عميل بشراء منتجاتك حتى الآن. بمجرد إتمام أول طلب، سيظهر هنا.
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <Search className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-foreground mb-2">لا توجد نتائج</h3>
            <p className="text-muted-foreground text-sm">
              لم نتمكن من العثور على طلب يطابق "{searchTerm}".
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-foreground">الطلب والعميل</th>
                  <th className="px-6 py-4 text-sm font-semibold text-foreground">منتجاتك في الطلب</th>
                  <th className="px-6 py-4 text-sm font-semibold text-foreground">إجمالي مستحقاتك</th>
                  <th className="px-6 py-4 text-sm font-semibold text-foreground">الحالة</th>
                  <th className="px-6 py-4 text-sm font-semibold text-foreground">تحديث الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((order) => {
                  // Filter items to show ONLY the ones belonging to this specific seller
                  const sellerItems = order.items.filter(item => item.sellerId === user?.uid);
                  
                  // Calculate the total money this seller made from this specific order
                  const sellerTotal = sellerItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                  
                  const date = new Date(order.createdAt).toLocaleDateString('ar-EG');

                  return (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      
                      {/* Order Info */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-primary">{order.orderNumber}</span>
                          <span className="text-sm text-foreground mt-1">{order.shippingAddress.fullName}</span>
                          <span className="text-xs text-muted-foreground">{date}</span>
                          <span className="text-xs text-muted-foreground mt-1 bg-muted w-fit px-2 py-0.5 rounded">
                            {order.paymentMethod === 'Cash on Delivery' ? 'دفع عند الاستلام' : order.paymentMethod}
                          </span>
                        </div>
                      </td>

                      {/* Items Info */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          {sellerItems.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <img src={item.image || 'https://placehold.co/40'} alt={item.name} className="w-8 h-8 rounded border border-border object-cover" />
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-foreground line-clamp-1 max-w-[150px]" title={item.name}>
                                  {item.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground">الكمية: {item.quantity}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Total Amount for this seller */}
                      <td className="px-6 py-4">
                        <span className="font-bold text-foreground">
                          {sellerTotal.toLocaleString('ar-EG')} ج.م
                        </span>
                      </td>

                      {/* Current Status */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {getStatusIcon(order.status)}
                          <span className="text-sm font-medium text-foreground">
                            {order.status === 'Pending' ? 'قيد المراجعة' :
                             order.status === 'Processing' ? 'قيد التجهيز' :
                             order.status === 'Shipped' ? 'تم الشحن' :
                             order.status === 'Delivered' ? 'تم التوصيل' : 'ملغي'}
                          </span>
                        </div>
                      </td>

                      {/* Update Action */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <select 
                            className="bg-background border border-border text-foreground text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                            disabled={updatingId === order.id}
                          >
                            <option value="Pending">قيد المراجعة</option>
                            <option value="Processing">قيد التجهيز</option>
                            <option value="Shipped">تم الشحن</option>
                            <option value="Delivered">تم التوصيل</option>
                            <option value="Cancelled">إلغاء الطلب</option>
                          </select>
                          {updatingId === order.id && <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />}
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