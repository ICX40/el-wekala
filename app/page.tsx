import React from "react";
import Link from "next/link";
import { ArrowLeft, Monitor, Car, ShoppingCart } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import HeroSlider from "@/components/HeroSlider";
import { Product } from "@/types";

// Collections with high-quality real product images
const collections = [
  { name: "الهواتف الذكية", query: "Smartphones", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80" },
  { name: "الساعات الذكية", query: "Wearables", image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&q=80" },
  { name: "سماعات الأذن", query: "Headsets & Speakers", image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80" },
  { name: "ألعاب الفيديو", query: "Gaming Consoles", image: "https://images.unsplash.com/photo-1605901309584-818e25960b8f?w=400&q=80" },
  { name: "أجهزة المطبخ", query: "Kitchen Accessories", image: "https://images.unsplash.com/photo-1556910103-1c02745a872f?w=400&q=80" },
  { name: "الصحة والجمال", query: "Bath & Body", image: "https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&q=80" },
  { name: "أجهزة الكمبيوتر", query: "Gaming Laptops", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80" },
  { name: "محافظ وحقائب", query: "Wallets", image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80" },
  { name: "شاشات وتلفزيونات", query: "LED", image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&q=80" },
  { name: "جرابات وكفرات", query: "Covers", image: "https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?w=400&q=80" },
  { name: "مكبرات الصوت", query: "Soundbars", image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&q=80" },
  { name: "باور بانك", query: "Power Banks", image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&q=80" },
  { name: "منتجات رقمية", query: "Digital Cards", image: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400&q=80" },
  { name: "إكسسوارات سيارات", query: "Car Accessories", image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=400&q=80" },
  { name: "كاميرات مراقبة", query: "Surveillance Cameras", image: "https://images.unsplash.com/photo-1557800636-894a64c1696f?w=400&q=80" },
  { name: "شواحن وكابلات", query: "Chargers", image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&q=80" },
  { name: "سكوترات", query: "Scooters", image: "https://images.unsplash.com/photo-1593950315186-76a92975b60c?w=400&q=80" },
  { name: "أجهزة صغيرة", query: "Small Appliance", image: "https://images.unsplash.com/photo-1585659722983-3a6750f2fd82?w=400&q=80" },
];

const dummyProducts: Product[] = [
  {
    id: "p1",
    sellerId: "s1",
    name: "لابتوب ماك بوك برو M3 شاشة 14 بوصة، رامات 16 جيجا",
    description: "أحدث إصدارات أبل...",
    price: 85000,
    discount: 10,
    stock: 5,
    sku: "MAC-M3-14",
    images: ["https://placehold.co/600x400/2563EB/FFFFFF?text=MacBook+Pro"],
    categoryId: "1",
    status: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    averageRating: 4.8,
    totalReviews: 124
  },
  {
    id: "p2",
    sellerId: "s2",
    name: "سماعات أبل إيربودز برو الجيل الثاني",
    description: "عزل ضوضاء ممتاز...",
    price: 12000,
    stock: 15,
    sku: "AIR-PRO-2",
    images: ["https://placehold.co/600x400/F97316/FFFFFF?text=AirPods+Pro"],
    categoryId: "1",
    status: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    averageRating: 4.5,
    totalReviews: 89
  },
  {
    id: "p3",
    sellerId: "s3",
    name: "سامسونج جالاكسي S24 ألترا 256 جيجا",
    description: "أقوى هاتف أندرويد...",
    price: 45000,
    discount: 5,
    stock: 8,
    sku: "SAM-S24-ULTRA",
    images: ["https://placehold.co/600x400/22C55E/FFFFFF?text=Galaxy+S24"],
    categoryId: "2",
    status: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    averageRating: 4.9,
    totalReviews: 210
  },
  {
    id: "p4",
    sellerId: "s1",
    name: "ساعة ذكية هواوي جي تي 4",
    description: "بطارية تدوم طويلا...",
    price: 8500,
    stock: 20,
    sku: "HUA-GT4",
    images: ["https://placehold.co/600x400/EF4444/FFFFFF?text=Huawei+Watch"],
    categoryId: "1",
    status: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    averageRating: 4.3,
    totalReviews: 45
  }
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-(--background)" dir="rtl">
      
      {/* Dynamic Hero Image Slider */}
      <HeroSlider />

      {/* Our Collections Section (Circular Sub-categories) */}
      <section className="py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8 md:mb-10">
            <h2 className="text-xl md:text-3xl font-bold text-(--foreground)">تشكيلتنا</h2>
            <Link href="/products" className="text-(--foreground) hover:text-(--primary) flex items-center gap-1 font-semibold text-sm transition-colors group">
              <span className="hidden sm:inline">عرض الكل</span>
              <span className="sm:hidden">الكل</span>
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-x-3 gap-y-8 md:gap-x-4 md:gap-y-10">
            {collections.map((item, index) => (
              <Link 
                key={index} 
                href={`/search?q=${item.query}`}
                className="flex flex-col items-center group text-center"
              >
                {/* Circle Container - Adjusted sizing for better mobile fit */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-(--surface) shadow-sm flex items-center justify-center p-1.5 overflow-hidden border border-(--border) group-hover:shadow-md transition-all duration-300 group-hover:border-(--primary)/30">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                {/* Title */}
                <span className="text-[11px] md:text-sm font-bold text-(--foreground) mt-3 md:mt-4 group-hover:text-(--primary) transition-colors px-1 line-clamp-2 sm:line-clamp-1 w-full leading-tight">
                  {item.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers / New Products Section */}
      <section className="py-8 md:py-16 bg-slate-100/50 border-y border-(--border)">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="text-xl md:text-3xl font-bold text-(--foreground)">وصل حديثاً</h2>
            <Link href="/products?sort=newest" className="text-(--primary) hover:opacity-80 flex items-center gap-1 font-medium transition-colors text-sm md:text-base">
              تسوق الآن
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {dummyProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Features/Trust Section */}
      <section className="py-10 md:py-12 bg-(--surface)">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 text-center">
            <div className="p-4 bg-white/50 md:bg-transparent rounded-2xl md:rounded-none shadow-sm md:shadow-none border border-slate-100 md:border-transparent">
              <div className="w-12 h-12 bg-[#2563EB]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#2563EB]">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <h3 className="text-base md:text-lg font-bold text-(--foreground) mb-2">تسوق آمن ومريح</h3>
              <p className="text-slate-500 text-xs md:text-sm leading-relaxed">نوفر لك تجربة تسوق آمنة مع حماية كاملة لبياناتك الشخصية والمالية.</p>
            </div>
            
            <div className="p-4 bg-white/50 md:bg-transparent rounded-2xl md:rounded-none shadow-sm md:shadow-none border border-slate-100 md:border-transparent">
              <div className="w-12 h-12 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#10B981]">
                <Car className="w-6 h-6" />
              </div>
              <h3 className="text-base md:text-lg font-bold text-(--foreground) mb-2">توصيل سريع</h3>
              <p className="text-slate-500 text-xs md:text-sm leading-relaxed">شراكات مع أفضل شركات الشحن لضمان وصول طلبك في أسرع وقت ممكن.</p>
            </div>
            
            <div className="p-4 bg-white/50 md:bg-transparent rounded-2xl md:rounded-none shadow-sm md:shadow-none border border-slate-100 md:border-transparent sm:col-span-2 md:col-span-1">
              <div className="w-12 h-12 bg-[#F97316]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#F97316]">
                <Monitor className="w-6 h-6" />
              </div>
              <h3 className="text-base md:text-lg font-bold text-(--foreground) mb-2">دعم فني متواصل</h3>
              <p className="text-slate-500 text-xs md:text-sm leading-relaxed">فريق خدمة العملاء متواجد دائماً للرد على استفساراتك وحل أي مشكلة.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}