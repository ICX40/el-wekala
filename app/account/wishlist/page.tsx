"use client";

import React from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function WishlistPage() {
  // In a full implementation, we will fetch the wishlisted products here.
  // For now, we display the beautiful empty state as per standard E-commerce flow.

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">المفضلة</h1>
        <p className="text-[#64748B] mt-1">المنتجات التي قمت بحفظها لشرائها لاحقاً.</p>
      </div>

      <div className="bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] shadow-sm p-12 flex flex-col items-center justify-center text-center min-h-[40vh]">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 border border-red-100">
          <Heart className="w-10 h-10 text-[#EF4444]" />
        </div>
        <h3 className="text-xl font-bold text-[#0F172A] mb-2">قائمتك فارغة</h3>
        <p className="text-[#64748B] mb-8 max-w-sm">
          لم تقم بإضافة أي منتجات إلى المفضلة حتى الآن. تصفح الموقع واضغط على علامة القلب لحفظ المنتجات التي تعجبك.
        </p>
        <Link
          href="/products"
          className="bg-[#2563EB] hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-colors shadow-sm"
        >
          تصفح المنتجات
        </Link>
      </div>
      
    </div>
  );
}