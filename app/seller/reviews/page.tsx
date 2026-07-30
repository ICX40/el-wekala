"use client";

import React, { useState } from 'react';
import { Star, MessageCircle, MoreVertical } from 'lucide-react';

export default function SellerReviewsPage() {
  const [reviews, setReviews] = useState([
    {
      id: 1,
      customerName: 'طارق عبدلله',
      productName: 'سماعات أبل إيربودز برو',
      rating: 5,
      date: '2026-07-29',
      comment: 'المنتج ممتاز جداً وتغليف رائع، شكراً جزيلاً.',
      image: 'https://placehold.co/50x50?text=AirPods'
    },
    {
      id: 2,
      customerName: 'منى سعيد',
      productName: 'ساعة ذكية رياضية',
      rating: 4,
      date: '2026-07-27',
      comment: 'المنتج جيد لكن التوصيل تأخر يوم واحد.',
      image: 'https://placehold.co/50x50?text=Watch'
    }
  ]);

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">تقييمات العملاء</h1>
        <p className="text-slate-500 mt-1">تابع آراء العملاء في منتجاتك وحافظ على تقييمك المرتفع.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6">
        <div className="text-center shrink-0 border-l border-slate-100 pl-6">
          <p className="text-4xl font-black text-slate-900">4.5</p>
          <div className="flex text-amber-400 my-1 justify-center">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${i < 4 ? 'fill-current' : 'text-slate-300'}`} />
            ))}
          </div>
          <p className="text-xs text-slate-500">من {reviews.length} تقييم</p>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center gap-3 text-sm">
              <span className="w-3 font-medium text-slate-600">{star}</span>
              <Star className="w-3 h-3 text-slate-400" />
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-400 rounded-full" 
                  style={{ width: star === 5 ? '50%' : star === 4 ? '50%' : '0%' }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">لا توجد تقييمات بعد</h3>
            <p className="text-slate-500 mt-1 text-sm">بمجرد شراء العملاء لمنتجاتك وتقييمها ستظهر هنا.</p>
          </div>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4">
                  <img src={review.image} alt={review.productName} className="w-12 h-12 rounded-lg object-cover border border-slate-100" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{review.customerName}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">قيّم منتج: {review.productName}</p>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-slate-600 p-1">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-slate-200 fill-slate-50'}`} />
                  ))}
                </div>
                <span className="text-xs text-slate-400">{review.date}</span>
              </div>
              
              <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                "{review.comment}"
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}