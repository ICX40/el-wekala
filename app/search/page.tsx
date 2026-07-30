"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import { Loader2, SearchX } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setIsLoading(true);
      try {
        // Fetch all active products
        const q = query(
          collection(db, "products"),
          where("status", "==", "Active")
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedProducts: Product[] = [];
        
        // Convert search query to lowercase for case-insensitive comparison
        const queryLower = searchQuery.toLowerCase().trim();

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          
          // Check if the query matches the product name, description, or the new subCategory field
          const nameMatch = data.name?.toLowerCase().includes(queryLower);
          const descMatch = data.description?.toLowerCase().includes(queryLower);
          const subCatMatch = data.subCategory?.toLowerCase() === queryLower || data.subCategory?.toLowerCase().includes(queryLower);

          if (nameMatch || descMatch || subCatMatch) {
            fetchedProducts.push({ id: doc.id, ...data } as Product);
          }
        });

        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (searchQuery) {
      fetchSearchResults();
    } else {
      setProducts([]);
      setIsLoading(false);
    }
  }, [searchQuery]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium text-lg">جاري البحث عن "{searchQuery}"...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12" dir="rtl">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">
          نتائج البحث عن: <span className="text-blue-600">"{searchQuery}"</span>
        </h1>
        <p className="text-slate-500">
          تم العثور على {products.length} منتج
        </p>
      </div>

      {products.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <SearchX className="w-24 h-24 text-slate-300 mb-6" />
          <h3 className="text-2xl font-bold text-slate-900 mb-3">لا توجد نتائج مطابقة</h3>
          <p className="text-slate-500 max-w-md mb-8">
            لم نتمكن من العثور على أي منتجات تطابق "{searchQuery}". يرجى التأكد من كتابة الكلمة بشكل صحيح أو تصفح الأقسام.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Suspense is required by Next.js when using useSearchParams */}
      <Suspense fallback={
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      }>
        <SearchContent />
      </Suspense>
    </div>
  );
}