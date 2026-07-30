"use client";

import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import { megaMenuData } from '@/lib/categories';
import { Loader2, Filter, SlidersHorizontal, PackageX, Layers } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // 1. Fetch all active products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const q = query(
          collection(db, "products"),
          where("status", "==", "Active")
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedProducts: Product[] = [];
        
        querySnapshot.forEach((doc) => {
          fetchedProducts.push({ id: doc.id, ...doc.data() } as Product);
        });

        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Reset subcategory when main category changes
  useEffect(() => {
    setSelectedSubcategory("all");
  }, [selectedCategory]);

  // 2. Apply Filters and Sorting
  useEffect(() => {
    let result = [...products];

    // Filter by main category
    if (selectedCategory !== "all") {
      result = result.filter(product => product.categoryId === selectedCategory);
    }

    // Filter by subcategory
    if (selectedSubcategory !== "all") {
      // Assuming the property on the product will be saved as 'subCategory'
      result = result.filter(product => (product as any).subCategory === selectedSubcategory);
    }

    // Sort products
    result.sort((a, b) => {
      // Calculate final prices in case there are discounts
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
  }, [products, selectedCategory, selectedSubcategory, sortBy]);

  // Extract available subcategories dynamically based on the selected main category
  const availableSubcategories = Array.from(
    new Set(
      products
        .filter((p) => p.categoryId === selectedCategory && (p as any).subCategory)
        .map((p) => (p as any).subCategory)
    )
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-medium text-lg">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-12">
      
      {/* Page Header */}
      <div className="bg-surface border-b border-border py-8 mb-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">جميع المنتجات</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            تصفح آلاف المنتجات المميزة من مختلف الأقسام وتسوق بأفضل الأسعار.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar / Filters (Desktop) & Top Filters (Mobile) */}
          <aside className="w-full lg:w-64 shrink-0 space-y-6">
            
            {/* Sorting - Visible on Mobile too */}
            <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-foreground font-bold border-b border-border pb-3">
                <SlidersHorizontal className="w-5 h-5 text-primary" />
                <h2>ترتيب حسب</h2>
              </div>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-background border border-border text-foreground rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="newest">الأحدث وصولاً</option>
                <option value="price_low">السعر: من الأقل للأعلى</option>
                <option value="price_high">السعر: من الأعلى للأقل</option>
              </select>
            </div>

            {/* Main Categories Filter */}
            <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-foreground font-bold border-b border-border pb-3">
                <Filter className="w-5 h-5 text-primary" />
                <h2>الأقسام الرئيسية</h2>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="category"
                    value="all"
                    checked={selectedCategory === "all"}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span className={`text-sm transition-colors ${selectedCategory === "all" ? "text-primary font-bold" : "text-muted-foreground group-hover:text-foreground"}`}>
                    عرض كل الأقسام
                  </span>
                </label>
                
                {megaMenuData.map((category) => (
                  <label key={category.id} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="category"
                      value={category.id}
                      checked={selectedCategory === category.id}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <span className={`text-sm transition-colors ${selectedCategory === category.id ? "text-primary font-bold" : "text-muted-foreground group-hover:text-foreground"}`}>
                      {category.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Subcategories Filter (Only visible if a main category is selected and has subcategories) */}
            {selectedCategory !== "all" && availableSubcategories.length > 0 && (
              <div className="bg-surface border border-border rounded-xl p-5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2 mb-4 text-foreground font-bold border-b border-border pb-3">
                  <Layers className="w-5 h-5 text-primary" />
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
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <span className={`text-sm transition-colors ${selectedSubcategory === "all" ? "text-primary font-bold" : "text-muted-foreground group-hover:text-foreground"}`}>
                      الكل
                    </span>
                  </label>
                  
                  {availableSubcategories.map((sub, idx) => (
                    <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="subcategory"
                        value={sub as string}
                        checked={selectedSubcategory === sub}
                        onChange={(e) => setSelectedSubcategory(e.target.value)}
                        className="w-4 h-4 text-primary focus:ring-primary"
                      />
                      <span className={`text-sm transition-colors ${selectedSubcategory === sub ? "text-primary font-bold" : "text-muted-foreground group-hover:text-foreground"}`}>
                        {sub as string}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            
          </aside>

          {/* Main Content - Products Grid */}
          <main className="flex-1">
            
            <div className="mb-6 flex justify-between items-center bg-surface p-4 rounded-xl border border-border shadow-sm">
              <span className="text-foreground font-medium">
                عرض <span className="font-bold text-primary">{filteredProducts.length}</span> منتج
              </span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-surface border border-border rounded-xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
                <PackageX className="w-16 h-16 text-muted-foreground opacity-50 mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">لا توجد منتجات</h3>
                <p className="text-muted-foreground">
                  لم نتمكن من العثور على أي منتج يطابق خيارات الفلترة الحالية. جرب تغيير القسم المختار.
                </p>
                <button 
                  onClick={() => { setSelectedCategory("all"); setSelectedSubcategory("all"); setSortBy("newest"); }}
                  className="mt-6 bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
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