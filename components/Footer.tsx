"use client";

import React from 'react';
import Link from 'next/link';
import { MapPin, Mail, Phone, ShieldCheck, Truck, CreditCard } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-white pt-16 pb-8 border-t border-[#1E293B] mt-auto">
      <div className="container mx-auto px-4">
        
        {/* Top Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-[#1E293B] mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#2563EB]/20 rounded-full flex items-center justify-center text-[#2563EB]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-lg">منتجات أصلية 100%</h4>
              <p className="text-[#94A3B8] text-sm mt-1">نضمن لك جودة جميع منتجاتنا.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#10B981]/20 rounded-full flex items-center justify-center text-[#10B981]">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-lg">توصيل سريع وموثوق</h4>
              <p className="text-[#94A3B8] text-sm mt-1">شحن يغطي جميع المحافظات.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#F97316]/20 rounded-full flex items-center justify-center text-[#F97316]">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-lg">دفع آمن ومتعدد</h4>
              <p className="text-[#94A3B8] text-sm mt-1">كاش، بطاقات ائتمان، ومحافظ إلكترونية.</p>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* About */}
          <div>
            <h3 className="text-2xl font-extrabold text-white mb-6 tracking-wider">الوكالة</h3>
            <p className="text-[#94A3B8] text-sm leading-relaxed mb-6">
              منصتك الأولى للتسوق الإلكتروني. نهدف لتقديم أفضل تجربة شراء بأسعار تنافسية وخدمة عملاء ممتازة على مدار الساعة.
            </p>
            <div className="flex items-center gap-4">
              {/* Facebook */}
              <a href="#" className="w-10 h-10 bg-[#1E293B] rounded-full flex items-center justify-center text-[#94A3B8] hover:bg-[#2563EB] hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              {/* Twitter */}
              <a href="#" className="w-10 h-10 bg-[#1E293B] rounded-full flex items-center justify-center text-[#94A3B8] hover:bg-[#2563EB] hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              {/* Instagram */}
              <a href="#" className="w-10 h-10 bg-[#1E293B] rounded-full flex items-center justify-center text-[#94A3B8] hover:bg-[#2563EB] hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              {/* Youtube */}
              <a href="#" className="w-10 h-10 bg-[#1E293B] rounded-full flex items-center justify-center text-[#94A3B8] hover:bg-[#2563EB] hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white text-lg mb-6">روابط سريعة</h4>
            <ul className="space-y-3 text-sm text-[#94A3B8]">
              <li><Link href="/about" className="hover:text-[#2563EB] transition-colors">من نحن</Link></li>
              <li><Link href="/contact" className="hover:text-[#2563EB] transition-colors">اتصل بنا</Link></li>
              <li><Link href="/faq" className="hover:text-[#2563EB] transition-colors">الأسئلة الشائعة</Link></li>
              <li><Link href="/terms" className="hover:text-[#2563EB] transition-colors">الشروط والأحكام</Link></li>
              <li><Link href="/privacy" className="hover:text-[#2563EB] transition-colors">سياسة الخصوصية</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold text-white text-lg mb-6">أهم الأقسام</h4>
            <ul className="space-y-3 text-sm text-[#94A3B8]">
              <li><Link href="/category/1" className="hover:text-[#2563EB] transition-colors">الإلكترونيات والموبايلات</Link></li>
              <li><Link href="/category/2" className="hover:text-[#2563EB] transition-colors">أزياء نسائية</Link></li>
              <li><Link href="/category/3" className="hover:text-[#2563EB] transition-colors">أزياء رجالية</Link></li>
              <li><Link href="/category/6" className="hover:text-[#2563EB] transition-colors">المنزل والأجهزة</Link></li>
              <li><Link href="/category/5" className="hover:text-[#2563EB] transition-colors">الجمال والعطور</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-white text-lg mb-6">تواصل معنا</h4>
            <ul className="space-y-4 text-sm text-[#94A3B8]">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#2563EB] shrink-0" />
                <span>القاهرة، المعادي، شارع اللاسلكي، مبنى 15</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#2563EB] shrink-0" />
                <span className="dir-ltr text-right w-full">+20 100 123 4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#2563EB] shrink-0" />
                <span>support@elwekala.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyrights */}
        <div className="pt-8 border-t border-[#1E293B] text-center text-[#64748B] text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} الوكالة. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-2">
            <span className="bg-[#FFFFFF] px-2 py-1 rounded text-[#0F172A] font-bold text-xs">VISA</span>
            <span className="bg-[#FFFFFF] px-2 py-1 rounded text-[#0F172A] font-bold text-xs">MasterCard</span>
            <span className="bg-[#FFFFFF] px-2 py-1 rounded text-[#0F172A] font-bold text-xs">InstaPay</span>
          </div>
        </div>

      </div>
    </footer>
  );
}