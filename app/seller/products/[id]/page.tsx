"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import { megaMenuData } from '@/lib/categories';
import { Loader2, PackageX, SlidersHorizontal } from 'lucide-react';

export default function CategoryPage() {
  const params = useParams<{ id: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>("newest");

  const categoryInfo = megaMenuData.find(cat => cat.id === params?.id);
  const categoryName = categoryInfo ? categoryInfo.name : "تصنيف المنتجات";

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      if (!params?.id) return;
      
      setIsLoading(true);
      try {
        const q = query(
          collection(db, "products"),
          where("categoryId", "==", params.id),
          where("status", "==", "Active")
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
  }, [params?.id]);

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    const priceA = a.discount ? a.price - (a.price * (a.discount / 100)) : a.price;
    const priceB = b.discount ? b.price - (b.price * (b.discount / 100)) : b.price;

    switch (sortBy) {
      case "price_low": return priceA - priceB;
      case "price_high": return priceB - priceA;
      case "newest":
      default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-medium text-lg">جاري تحميل منتجات القسم...</p>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-12">
      
      <div className="bg-surface border-b border-border py-12 mb-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{categoryName}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            تصفح أفضل المنتجات المتاحة في قسم {categoryName} بأسعار تنافسية.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        
        <div className="flex flex-col sm:flex-row justify-between items-center bg-surface p-4 rounded-xl border border-border shadow-sm mb-8 gap-4">
          <span className="text-foreground font-medium">
            عرض <span className="font-bold text-primary">{sortedProducts.length}</span> منتج
          </span>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <SlidersHorizontal className="w-5 h-5 text-muted-foreground hidden sm:block" />
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto bg-background border border-border text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              <option value="newest">الأحدث وصولاً</option>
              <option value="price_low">السعر: من الأقل للأعلى</option>
              <option value="price_high">السعر: من الأعلى للأقل</option>
            </select>
          </div>
        </div>

        {sortedProducts.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-12 flex flex-col items-center justify-center text-center shadow-sm min-h-[40vh]">
            <PackageX className="w-16 h-16 text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">لا توجد منتجات</h3>
            <p className="text-muted-foreground">
              عذراً، لا يوجد منتجات متاحة في قسم "{categoryName}" حالياً. يرجى العودة لاحقاً.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {sortedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        
      </div>
    </div>
  );
}