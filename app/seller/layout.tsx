"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Wallet, 
  ArrowRightLeft, 
  BarChart, 
  MessageSquare, 
  Star 
} from 'lucide-react';

const sidebarLinks = [
  { name: 'لوحة التحكم', href: '/seller', icon: LayoutDashboard },
  { name: 'المنتجات', href: '/seller/products', icon: Package },
  { name: 'الطلبات', href: '/seller/orders', icon: ShoppingBag },
  { name: 'الأرباح', href: '/seller/earnings', icon: Wallet },
  { name: 'سحب الرصيد', href: '/seller/withdraw', icon: ArrowRightLeft },
  { name: 'الإحصائيات', href: '/seller/analytics', icon: BarChart },
  { name: 'الرسائل', href: '/seller/messages', icon: MessageSquare },
  { name: 'التقييمات', href: '/seller/reviews', icon: Star },
];

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="w-full md:w-64 bg-surface border-l border-border md:min-h-[calc(100vh-4rem)] shrink-0 hidden md:block">
        <div className="p-6">
          <h2 className="text-xl font-bold text-foreground">بوابة التاجر</h2>
          <p className="text-sm text-muted-foreground mt-1">إدارة متجرك</p>
        </div>
        <nav className="mt-2 px-4 space-y-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-foreground hover:bg-muted hover:text-primary'
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Navigation (Horizontal Scroll) */}
      <div className="md:hidden bg-surface border-b border-border w-full overflow-x-auto">
        <nav className="flex px-4 py-3 space-x-2 space-x-reverse min-w-max">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}