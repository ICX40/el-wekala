"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  Package, 
  ShoppingBag, 
  BarChart3, 
  Settings, 
  ShieldAlert 
} from 'lucide-react';

const adminLinks = [
  { name: 'لوحة التحكم', href: '/admin', icon: LayoutDashboard },
  { name: 'إدارة المستخدمين', href: '/admin/users', icon: Users },
  { name: 'إدارة التجار', href: '/admin/sellers', icon: Store },
  { name: 'إدارة المنتجات', href: '/admin/products', icon: Package },
  { name: 'إدارة الطلبات', href: '/admin/orders', icon: ShoppingBag },
  { name: 'الإحصائيات والأرباح', href: '/admin/analytics', icon: BarChart3 },
  { name: 'الإعدادات', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
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
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-primary" />
            لوحة الأدمن
          </h2>
          <p className="text-sm text-muted-foreground mt-1">إدارة منصة الوكالة</p>
        </div>
        <nav className="mt-2 px-4 space-y-1">
          {adminLinks.map((link) => {
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

      {/* Mobile Navigation */}
      <div className="md:hidden bg-surface border-b border-border w-full overflow-x-auto">
        <nav className="flex px-4 py-3 space-x-2 space-x-reverse min-w-max">
          {adminLinks.map((link) => {
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