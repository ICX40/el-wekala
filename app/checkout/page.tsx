"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { useCart } from '@/components/CartProvider';
import { auth } from '@/firebase/config';
import { Order } from '@/types';
import { Loader2, ArrowRight, ShieldCheck, MapPin, CreditCard, Ticket } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  
  const [isLoading, setIsLoading] = useState(false);
  
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("القاهرة");
  const [state, setState] = useState("");
  
  const [paymentMethod, setPaymentMethod] = useState<Order['paymentMethod']>("Cash on Delivery");

  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPercentage: number } | null>(null);
  const [isCheckingPromo, setIsCheckingPromo] = useState(false);

  const shippingCost = cartTotal > 0 ? 50 : 0;
  const discountAmount = appliedPromo ? (cartTotal * appliedPromo.discountPercentage) / 100 : 0;
  const finalTotal = cartTotal + shippingCost - discountAmount;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/checkout');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (cartItems.length === 0) {
      router.push('/cart');
    }
  }, [cartItems, router]);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;

    setIsCheckingPromo(true);
    try {
      const response = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoInput }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid Promo Code');
      }

      setAppliedPromo({
        code: data.code,
        discountPercentage: data.discountPercentage
      });
      toast.success(`تم تطبيق كود الخصم بنجاح (${data.discountPercentage}%)!`);
      
    } catch (err: any) {
      console.error("Promo validation error:", err);
      toast.error(err.message || "كود الخصم غير صحيح أو غير مفعل.");
      setAppliedPromo(null);
    } finally {
      setIsCheckingPromo(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsLoading(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User not authenticated properly. Please refresh and try again.");
      }
      
      const token = await currentUser.getIdToken();

      const simplifiedItems = cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        name: item.product.name,
        image: item.product.images[0] || ""
      }));

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user.uid,
          items: simplifiedItems,
          shippingAddress: { fullName, phoneNumber, address, city, state },
          paymentMethod: paymentMethod,
          promoCode: appliedPromo?.code || null
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error((data && data.error) ? data.error : "Network or Server Error. Failed to process order.");
      }
      
      clearCart();
      router.push('/account');
      toast.success("تم تسجيل طلبك بنجاح! شكراً لتسوقك معنا.");

    } catch (err: any) {
      console.error("Order error:", err);
      toast.error(err.message || "حدث خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || !user || cartItems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      
      <div className="flex items-center gap-4 mb-8">
        <Link href="/cart" className="p-2 bg-surface border border-border rounded-lg hover:bg-muted transition-colors">
          <ArrowRight className="w-5 h-5 text-foreground" />
        </Link>
        <h1 className="text-2xl font-bold text-foreground">إتمام الطلب</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-8 space-y-6">
          <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-6">
            
            <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                <MapPin className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">عنوان الشحن</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">الاسم بالكامل *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">رقم الموبايل *</label>
                  <input
                    type="tel"
                    required
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-left dir-ltr"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">العنوان بالتفصيل (الشارع، رقم العمارة، الشقة) *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">المحافظة *</label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="القاهرة">القاهرة</option>
                    <option value="الجيزة">الجيزة</option>
                    <option value="الإسكندرية">الإسكندرية</option>
                    <option value="باقي المحافظات">باقي المحافظات</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">المدينة / المنطقة *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                <CreditCard className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">طريقة الدفع</h2>
              </div>
              
              <div className="space-y-3">
                <label className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'Cash on Delivery' ? 'border-primary bg-primary/5' : 'border-input hover:border-primary/50'}`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="payment" 
                      value="Cash on Delivery"
                      checked={paymentMethod === 'Cash on Delivery'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <span className="font-medium text-foreground">الدفع عند الاستلام (كاش)</span>
                  </div>
                </label>
                
                <label className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'Vodafone Cash' ? 'border-primary bg-primary/5' : 'border-input hover:border-primary/50'}`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="payment" 
                      value="Vodafone Cash"
                      checked={paymentMethod === 'Vodafone Cash'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <span className="font-medium text-foreground">فودافون كاش</span>
                  </div>
                </label>

                <label className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'InstaPay' ? 'border-primary bg-primary/5' : 'border-input hover:border-primary/50'}`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="payment" 
                      value="InstaPay"
                      checked={paymentMethod === 'InstaPay'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <span className="font-medium text-foreground">إنستا باي (InstaPay)</span>
                  </div>
                </label>

                <label className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'Credit Card' ? 'border-primary bg-primary/5' : 'border-input hover:border-primary/50'}`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="payment" 
                      value="Credit Card"
                      checked={paymentMethod === 'Credit Card'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <span className="font-medium text-foreground">البطاقة البنكية (فيزا / ماستركارد)</span>
                  </div>
                </label>
              </div>
            </div>

          </form>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-surface border border-border rounded-xl shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-bold text-foreground mb-6 border-b border-border pb-4">ملخص الطلب</h2>
            
            <div className="mb-6 space-y-2">
              <label className="text-xs font-bold text-foreground flex items-center gap-1">
                <Ticket className="w-3.5 h-3.5 text-primary" />
                هل لديك كود خصم؟
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="أدخل الكود..."
                  className="flex-1 bg-background border border-input rounded-lg px-3 py-2 text-sm uppercase font-mono font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={isCheckingPromo}
                  className="bg-primary text-primary-foreground font-bold px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isCheckingPromo ? <Loader2 className="w-4 h-4 animate-spin" /> : 'تطبيق'}
                </button>
              </div>
            </div>

            <div className="space-y-4 mb-6 max-h-48 overflow-y-auto pr-2">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex gap-3 items-center">
                  <div className="w-12 h-12 shrink-0 bg-background border border-border rounded overflow-hidden">
                    <img 
                      src={item.product.images[0] || 'https://placehold.co/100x100?text=No+Image'} 
                      alt={item.product.name} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">الكمية: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 text-sm mb-6 border-t border-border pt-4">
              <div className="flex justify-between text-muted-foreground">
                <span>المجموع الفرعي (قبل الخصم)</span>
                <span className="font-medium text-foreground">{cartTotal.toLocaleString('ar-EG')} ج.م</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>رسوم الشحن</span>
                <span className="font-medium text-foreground">{shippingCost.toLocaleString('ar-EG')} ج.م</span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-success font-medium">
                  <span>الخصم ({appliedPromo.code}):</span>
                  <span>- {discountAmount.toLocaleString('ar-EG')} ج.م</span>
                </div>
              )}
            </div>

            <div className="border-t border-border pt-4 mb-8 flex justify-between items-center">
              <span className="font-bold text-foreground text-lg">الإجمالي النهائي</span>
              <span className="font-extrabold text-primary text-2xl">{finalTotal.toLocaleString('ar-EG')} ج.م</span>
            </div>

            <button 
              type="submit"
              form="checkout-form"
              disabled={isLoading}
              className="w-full bg-accent hover:bg-orange-600 text-white h-12 rounded-xl font-bold flex items-center justify-center transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                  جاري التأكيد...
                </>
              ) : (
                "تأكيد الطلب"
              )}
            </button>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-success" />
              <span>تسوق آمن ومحمي 100%</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}