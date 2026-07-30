"use client";

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import { Trash2, Minus, Plus, ShoppingCart, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

  const shippingCost = cartTotal > 0 ? 50 : 0; // Fixed shipping for now
  const finalTotal = cartTotal + shippingCost;

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
          <ShoppingCart className="w-12 h-12 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-4">عربة التسوق فارغة</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          يبدو أنك لم تضف أي منتجات إلى عربة التسوق الخاصة بك حتى الآن. اكتشف آلاف المنتجات المميزة وابدأ التسوق!
        </p>
        <Link 
          href="/products" 
          className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-bold transition-colors"
        >
          العودة للتسوق
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">عربة التسوق</h1>
        <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm font-medium">
          {cartItems.length} منتجات
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
            
            {/* Header (Desktop only) */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-border bg-muted/30 text-sm font-semibold text-muted-foreground">
              <div className="col-span-6">المنتج</div>
              <div className="col-span-2 text-center">السعر</div>
              <div className="col-span-3 text-center">الكمية</div>
              <div className="col-span-1 text-center">حذف</div>
            </div>

            {/* Items */}
            <div className="divide-y divide-border">
              {cartItems.map((item) => {
                const price = item.product.discount && item.product.discount > 0
                  ? item.product.price - (item.product.price * (item.product.discount / 100))
                  : item.product.price;
                const itemTotal = price * item.quantity;

                return (
                  <div key={item.product.id} className="p-4 flex flex-col md:grid md:grid-cols-12 gap-4 items-center">
                    
                    {/* Product Info */}
                    <div className="col-span-6 flex items-center gap-4 w-full">
                      <div className="w-20 h-20 shrink-0 bg-background border border-border rounded-lg overflow-hidden p-1">
                        <img 
                          src={item.product.images[0] || 'https://placehold.co/100x100?text=No+Image'} 
                          alt={item.product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex flex-col">
                        <Link href={`/product/${item.product.id}`} className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2">
                          {item.product.name}
                        </Link>
                        <span className="text-xs text-muted-foreground mt-1">SKU: {item.product.sku}</span>
                      </div>
                    </div>

                    {/* Mobile Price Label */}
                    <div className="w-full flex justify-between items-center md:hidden mt-2">
                      <span className="text-sm font-medium text-muted-foreground">السعر:</span>
                      <span className="font-bold text-foreground">{price.toLocaleString('ar-EG')} ج.م</span>
                    </div>

                    {/* Desktop Price */}
                    <div className="col-span-2 text-center hidden md:block">
                      <span className="font-bold text-foreground">{price.toLocaleString('ar-EG')} ج.م</span>
                    </div>

                    {/* Quantity */}
                    <div className="col-span-3 w-full md:w-auto flex justify-between md:justify-center items-center">
                      <span className="text-sm font-medium text-muted-foreground md:hidden">الكمية:</span>
                      <div className="flex items-center border border-border rounded-lg bg-background h-10">
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-10 h-full flex items-center justify-center text-foreground hover:bg-muted disabled:opacity-50 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <div className="w-12 h-full flex items-center justify-center border-x border-border font-bold text-sm text-foreground">
                          {item.quantity}
                        </div>
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="w-10 h-full flex items-center justify-center text-foreground hover:bg-muted disabled:opacity-50 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Remove Action */}
                    <div className="col-span-1 flex justify-end md:justify-center w-full md:w-auto mt-2 md:mt-0">
                      <button 
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-2 text-muted-foreground hover:text-error hover:bg-error/10 rounded-lg transition-colors flex items-center gap-2 md:gap-0"
                      >
                        <Trash2 className="w-5 h-5" />
                        <span className="md:hidden text-sm font-medium text-error">حذف المنتج</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
            
            {/* Clear Cart Button */}
            <div className="p-4 border-t border-border bg-muted/10 flex justify-between items-center">
              <Link href="/products" className="text-primary hover:text-primary-hover font-medium text-sm flex items-center gap-1">
                <ArrowRight className="w-4 h-4" />
                متابعة التسوق
              </Link>
              <button 
                onClick={clearCart}
                className="text-sm font-medium text-muted-foreground hover:text-error transition-colors"
              >
                تفريغ السلة بالكامل
              </button>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-surface border border-border rounded-xl shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-bold text-foreground mb-6 border-b border-border pb-4">ملخص الطلب</h2>
            
            <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between text-muted-foreground">
                <span>المجموع الفرعي ({cartItems.length} منتجات)</span>
                <span className="font-medium text-foreground">{cartTotal.toLocaleString('ar-EG')} ج.م</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>تكلفة الشحن (تقديرية)</span>
                <span className="font-medium text-foreground">{shippingCost.toLocaleString('ar-EG')} ج.م</span>
              </div>
            </div>

            <div className="border-t border-border pt-4 mb-8 flex justify-between items-center">
              <span className="font-bold text-foreground text-lg">الإجمالي</span>
              <span className="font-extrabold text-primary text-2xl">{finalTotal.toLocaleString('ar-EG')} ج.م</span>
            </div>

            <Link 
              href="/checkout"
              className="w-full bg-accent hover:bg-orange-600 text-white h-12 rounded-xl font-bold flex items-center justify-center transition-colors shadow-md"
            >
              متابعة للدفع
            </Link>

            <div className="mt-4 text-xs text-center text-muted-foreground">
              الضرائب مشمولة في السعر. يمكنك إدخال كوبونات الخصم في الخطوة القادمة.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}