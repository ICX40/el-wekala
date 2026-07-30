"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, User, Menu, X, ChevronDown, MapPin, Globe, ShoppingBag, Heart, Crosshair, ArrowRight, LogOut } from 'lucide-react';
import { useCart } from '@/components/CartProvider';
import { useAuth } from '@/components/AuthProvider';
import { auth } from '@/firebase/config';
import { signOut } from 'firebase/auth';
import { megaMenuData } from '@/lib/categories';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState("القاهرة");
  
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  
  const { cartCount } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const savedLocation = localStorage.getItem('user_city');
    if (savedLocation) {
      setUserLocation(savedLocation);
      setSearchInput(savedLocation);
    } else {
      getCurrentLocation();
    }
  }, []);

  const getCurrentLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ar`);
            const data = await res.json();
            
            const city = data.address?.city || data.address?.state || data.address?.town || data.address?.region || "موقعك الحالي";
            setUserLocation(city);
            setSearchInput(city);
            localStorage.setItem('user_city', city);
          } catch (error) {
            console.error("Error fetching city from coordinates:", error);
          } finally {
            setIsLocating(false);
          }
        },
        (error) => {
          console.error("Geolocation permission denied or error:", error);
          setIsLocating(false);
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  const handleConfirmLocation = () => {
    const finalLocation = searchInput.trim() || "القاهرة";
    setUserLocation(finalLocation);
    localStorage.setItem('user_city', finalLocation);
    setIsMapModalOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <>
      <nav className="flex flex-col sticky top-0 z-50 shadow-sm w-full bg-white">
        
        <div className="w-full border-b border-gray-100">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16 gap-4">
              
              <div className="flex items-center gap-4 lg:gap-8 shrink-0">
                <Link href="/" className="text-blue-600 font-extrabold text-3xl tracking-wider">
                  الوكالة
                </Link>
                
                <div 
                  onClick={() => setIsMapModalOpen(true)}
                  className="hidden md:flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors"
                >
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <div className="flex flex-col leading-tight">
                    <span className="text-[11px] text-gray-500">توصيل إلى</span>
                    <span className="text-sm font-bold text-gray-900 flex items-center line-clamp-1 max-w-37.5">
                      {userLocation}
                      <ChevronDown className="w-3 h-3 ml-1 shrink-0" />
                    </span>
                  </div>
                </div>
              </div>

              <div className="hidden md:flex flex-1 max-w-3xl relative">
                <input
                  type="text"
                  placeholder="عن ماذا تبحث؟"
                  className="w-full bg-gray-100 border border-transparent focus:border-blue-500 focus:bg-white rounded-lg py-2.5 px-4 pr-11 focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-sm text-gray-900 transition-all"
                />
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-500 cursor-pointer" />
              </div>

              <div className="hidden md:flex items-center gap-4 lg:gap-6 shrink-0 text-gray-700 font-medium text-sm">
                <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors border-l border-gray-200 pl-4">
                  <Globe className="w-5 h-5" />
                  <span>English</span>
                </button>
                
                <Link href={user ? "/account" : "/login"} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors border-l border-gray-200 pl-4">
                  <User className="w-5 h-5" />
                  <span className="max-w-[100px] truncate">{user ? (user.displayName || "حسابي") : "تسجيل الدخول"}</span>
                </Link>

                <Link href="/account/orders" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                  <ShoppingBag className="w-5 h-5" />
                  <span>الطلبات</span>
                </Link>

                <Link href="/account/wishlist" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                  <Heart className="w-5 h-5" />
                  <span>المفضلة</span>
                </Link>
                
                <Link href="/cart" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors relative">
                  <ShoppingCart className="w-5 h-5" />
                  <span>العربة</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-blue-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {user && (
                  <button onClick={handleLogout} className="flex items-center gap-1.5 text-red-500 hover:text-red-700 transition-colors border-l border-gray-200 pl-4" title="تسجيل الخروج">
                    <LogOut className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="md:hidden flex items-center justify-end w-full gap-3">
                 <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="بحث..."
                    className="w-full bg-gray-100 rounded-lg py-2 px-3 pr-9 focus:outline-none text-sm text-gray-900 border border-transparent focus:border-blue-500"
                  />
                  <Search className="absolute right-2.5 top-2 h-4 w-4 text-gray-500" />
                </div>
                <Link href="/cart" className="relative text-gray-800 hover:text-blue-600">
                  <ShoppingCart className="h-6 w-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-gray-800 focus:outline-none p-1 hover:text-blue-600"
                >
                  {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>

            </div>
          </div>
        </div>

        <div className="hidden md:block border-b border-gray-200 bg-white relative z-40">
          <div className="container mx-auto px-4">
            <ul className="flex flex-nowrap items-center justify-between w-full text-xs lg:text-[13px] font-medium py-1 h-10 text-gray-600">
              {megaMenuData.map((category) => (
                <li 
                  key={category.id}
                  className="flex shrink-0"
                  onMouseEnter={() => setActiveMegaMenu(category.id)}
                  onMouseLeave={() => setActiveMegaMenu(null)}
                >
                  <Link 
                    href={`/category/${category.id}`} 
                    className={`flex items-center h-10 hover:text-blue-600 border-b-2 transition-colors px-1 ${
                      activeMegaMenu === category.id ? 'border-blue-600 text-blue-600' : 'border-transparent'
                    }`}
                  >
                    {category.name}
                    <ChevronDown className="w-3 h-3 mr-1 opacity-70" />
                  </Link>

                  {activeMegaMenu === category.id && (
                    <div className="absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 py-8 px-6 lg:px-12 cursor-default">
                      <div className="container mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                        {category.subCategories.map((sub, idx) => (
                          <div key={idx} className="flex flex-col">
                            <h3 className="font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2 text-sm">{sub.title}</h3>
                            <ul className="space-y-2.5">
                              {sub.items.map((item, itemIdx) => (
                                <li key={itemIdx}>
                                  <Link href={`/search?q=${item}`} className="text-gray-500 hover:text-blue-600 text-sm transition-colors block">
                                    {item}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="px-4 py-4 space-y-2">
              
               <div 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsMapModalOpen(true);
                  }}
                  className="flex items-center gap-2 pb-4 mb-2 border-b border-gray-100 text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
               >
                  <MapPin className="w-5 h-5 text-gray-900" />
                  <span className="text-sm font-bold text-gray-900 flex items-center">
                    توصيل إلى: <span className="text-blue-600 mr-1 line-clamp-1">{userLocation}</span>
                  </span>
               </div>

              <Link onClick={() => setIsMobileMenuOpen(false)} href={user ? "/account" : "/login"} className="flex items-center gap-3 py-2.5 text-gray-700 font-medium hover:text-blue-600">
                <User className="w-5 h-5" />
                {user ? (user.displayName || "حسابي") : "تسجيل الدخول"}
              </Link>
              
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/account/orders" className="flex items-center gap-3 py-2.5 text-gray-700 font-medium hover:text-blue-600">
                <ShoppingBag className="w-5 h-5" />
                الطلبات
              </Link>

              <Link onClick={() => setIsMobileMenuOpen(false)} href="/account/wishlist" className="flex items-center gap-3 py-2.5 text-gray-700 font-medium hover:text-blue-600">
                <Heart className="w-5 h-5" />
                المفضلة
              </Link>

              {user && (
                <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 py-2.5 text-red-500 font-medium hover:text-red-700 w-full text-right">
                  <LogOut className="w-5 h-5" />
                  تسجيل الخروج
                </button>
              )}

              <div className="pt-4 mt-2 border-t border-gray-100">
                <h3 className="font-bold text-gray-900 mb-3 text-lg">كل الأقسام</h3>
                <div className="flex flex-col space-y-2">
                  {megaMenuData.map((category) => (
                    <details key={category.id} className="group border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
                      <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-3 hover:bg-gray-100 text-sm text-gray-800">
                        {category.name}
                        <ChevronDown className="w-4 h-4 transition group-open:rotate-180" />
                      </summary>
                      <div className="text-sm bg-white p-3 border-t border-gray-200 space-y-4 max-h-60 overflow-y-auto">
                        
                        {/* Direct link to the category for mobile users */}
                        <Link 
                          href={`/category/${category.id}`} 
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-2 text-blue-600 font-bold mb-3 border-b border-gray-100 pb-3"
                        >
                          عرض كل منتجات {category.name} <ArrowRight className="w-4 h-4 rotate-180" />
                        </Link>

                        {category.subCategories.map((sub, idx) => (
                          <div key={idx}>
                            <h4 className="font-bold text-gray-900 mb-2 text-xs">{sub.title}</h4>
                            <ul className="space-y-1.5 pr-2 border-r-2 border-gray-200">
                              {sub.items.map((item, itemIdx) => (
                                <li key={itemIdx}>
                                  <Link onClick={() => setIsMobileMenuOpen(false)} href={`/search?q=${item}`} className="text-gray-500 text-xs hover:text-blue-600 block py-1">
                                    {item}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
              
            </div>
          </div>
        )}
      </nav>

      {isMapModalOpen && (
        <div className="fixed inset-0 z-100 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <button onClick={() => setIsMapModalOpen(false)} className="text-gray-500 hover:text-black transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-bold text-gray-900">إضافة عنوان جديد</h2>
              </div>
              <button onClick={() => setIsMapModalOpen(false)} className="text-gray-500 hover:text-red-500 transition-colors p-1 bg-white rounded-full shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-4">
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ابحث عن عنوانك، مدينتك، المبنى..."
                    className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-black"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>
                
                <button 
                  onClick={getCurrentLocation}
                  disabled={isLocating}
                  className="flex items-center justify-center gap-2 bg-blue-50 text-blue-600 border border-blue-200 px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors disabled:opacity-50 shrink-0"
                >
                  <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                  استخدام الموقع الحالي
                </button>
              </div>

              <div className="w-full h-100 bg-gray-100 rounded-lg border border-gray-300 overflow-hidden relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none flex flex-col items-center">
                  <div className="bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded shadow-lg mb-1 relative">
                    سيتم توصيل طلبك هنا
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                  <MapPin className="w-8 h-8 text-black drop-shadow-md" fill="white" />
                </div>

                <iframe
                  title="Google Maps"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(searchInput || "القاهرة")}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                ></iframe>
              </div>

            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-3 w-full sm:w-auto">
                <MapPin className="w-6 h-6 text-gray-500 shrink-0 mt-1" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-0.5">الموقع المحدد</span>
                  <span className="text-sm font-medium text-gray-900 line-clamp-2 max-w-75">
                    {searchInput || "يرجى تحديد الموقع"}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={handleConfirmLocation}
                className="w-full sm:w-auto bg-[#3866df] hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-colors shadow-md text-sm whitespace-nowrap"
              >
                تأكيد الموقع (CONFIRM LOCATION)
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}