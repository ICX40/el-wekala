"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import { megaMenuData } from '@/lib/categories';
import { Loader2, SlidersHorizontal, PackageX, Layers, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params?.id as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters state
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // Get category data directly from megaMenuData to match the top navigation exactly
  const categoryData = megaMenuData?.find(c => c.id === categoryId);
  const categoryName = categoryData?.name || "القسم";
  
  // Flatten all items from all subcategory groups into a single array
  const currentSubcategories = categoryData?.subCategories?.flatMap(group => group.items) || [];

  // 1. Fetch active products for this specific category
  useEffect(() => {
    if (!categoryId) return;

    const fetchCategoryProducts = async () => {
      setIsLoading(true);
      try {
        const q = query(
          collection(db, "products"),
          where("status", "==", "Active"),
          where("categoryId", "==", categoryId)
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedProducts: Product[] = [];
        
        querySnapshot.forEach((doc) => {
          fetchedProducts.push({ id: doc.id, ...doc.data() } as Product);
        });

        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching category products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [categoryId]);

  // 2. Apply Filters (Subcategory & Sorting)
  useEffect(() => {
    let result = [...products];

    // Filter by subcategory
    if (selectedSubcategory !== "all") {
      result = result.filter(product => (product as any).subCategory === selectedSubcategory);
    }

    // Sort products
    result.sort((a, b) => {
      const priceA = a.discount ? a.price - (a.price * (a.discount / 100)) : a.price;
      const priceB = b.discount ? b.price - (b.price * (b.discount / 100)) : b.price;

      switch (sortBy) {
        case "price_low":
          return priceA - priceB;
        case "price_high":
          return priceB - priceA;
        case "newest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    setFilteredProducts(result);
  }, [products, selectedSubcategory, sortBy]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium text-lg">جاري تحميل المنتجات...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-12" dir="rtl">
      
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 py-8 mb-8">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-4 font-medium">
            <Link href="/" className="hover:text-blue-600 transition-colors">الرئيسية</Link>
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span className="text-slate-900 font-bold">{categoryName}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">{categoryName}</h1>
          <p className="text-slate-500">
            تصفح أحدث المنتجات والعروض المميزة في قسم {categoryName}.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar / Filters */}
          <aside className="w-full lg:w-64 shrink-0 space-y-6">
            
            {/* Sorting */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold border-b border-slate-100 pb-3">
                <SlidersHorizontal className="w-5 h-5 text-blue-600" />
                <h2>ترتيب حسب</h2>
              </div>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm"
              >
                <option value="newest">الأحدث وصولاً</option>
                <option value="price_low">السعر: من الأقل للأعلى</option>
                <option value="price_high">السعر: من الأعلى للأقل</option>
              </select>
            </div>

            {/* Subcategories Filter */}
            {currentSubcategories.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold border-b border-slate-100 pb-3">
                  <Layers className="w-5 h-5 text-blue-600" />
                  <h2>الأقسام الفرعية</h2>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="subcategory"
                      value="all"
                      checked={selectedSubcategory === "all"}
                      onChange={(e) => setSelectedSubcategory(e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-600"
                    />
                    <span className={`text-sm transition-colors ${selectedSubcategory === "all" ? "text-blue-600 font-bold" : "text-slate-500 group-hover:text-slate-900"}`}>
                      عرض الكل
                    </span>
                  </label>
                  
                  {currentSubcategories.map((sub, idx) => {
                    const count = products.filter(p => (p as any).subCategory === sub).length;
                    
                    return (
                      <label key={idx} className="flex items-center justify-between cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <input 
                            type="radio" 
                            name="subcategory"
                            value={sub as string}
                            checked={selectedSubcategory === sub}
                            onChange={(e) => setSelectedSubcategory(e.target.value)}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-600"
                          />
                          <span className={`text-sm transition-colors ${selectedSubcategory === sub ? "text-blue-600 font-bold" : "text-slate-500 group-hover:text-slate-900"}`}>
                            {sub as string}
                          </span>
                        </div>
                        {count > 0 && (
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                            {count}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
            
          </aside>

          {/* Main Content - Products Grid */}
          <main className="flex-1">
            
            <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-slate-700 font-medium text-sm">
                تم العثور على <span className="font-bold text-blue-600 mx-1">{filteredProducts.length}</span> منتج
              </span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
                <PackageX className="w-16 h-16 text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">لا توجد منتجات</h3>
                <p className="text-slate-500">
                  لم نتمكن من العثور على أي منتج يطابق خيارات الفلترة الحالية في هذا القسم.
                </p>
                <button 
                  onClick={() => { setSelectedSubcategory("all"); setSortBy("newest"); }}
                  className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold transition-colors"
                >
                  إعادة ضبط الفلاتر
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
            
          </main>

        </div>
      </div>
    </div>
  );
}