"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { 
  User, 
  ShoppingBag, 
  Heart, 
  MapPin, 
  Settings,
  LogOut,
  Loader2
} from 'lucide-react';

const accountLinks = [
  { name: 'حسابي', href: '/account', icon: User },
  { name: 'طلباتي', href: '/account/orders', icon: ShoppingBag },
  { name: 'المفضلة', href: '/account/wishlist', icon: Heart },
  { name: 'العناوين', href: '/account/addresses', icon: MapPin },
  { name: 'إعدادات الحساب', href: '/account/settings', icon: Settings },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) return null; // Will redirect in useEffect

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar for Account Navigation */}
        <aside className="w-full md:w-72 shrink-0">
          <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
            
            {/* User Profile Summary */}
            <div className="p-6 border-b border-border text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-primary/20">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-primary">
                    {user.displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-foreground">{user.displayName}</h2>
              <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
            </div>

            {/* Navigation Links */}
            <nav className="p-4 space-y-1">
              {accountLinks.map((link) => {
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
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-error hover:bg-error/10 transition-colors text-right mt-4 border-t border-border pt-4"
              >
                <LogOut className="w-5 h-5" />
                تسجيل الخروج
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1">
          {children}
        </main>

      </div>
    </div>
  );
}