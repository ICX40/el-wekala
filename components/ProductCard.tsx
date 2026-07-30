"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/components/CartProvider';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);

  // حساب السعر النهائي ومقدار التوفير
  const finalPrice = product.discount && product.discount > 0
    ? product.price - (product.price * (product.discount / 100))
    : product.price;

  const savings = product.price - finalPrice;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); 
    addToCart(product, 1);
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div className="group bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] overflow-hidden hover:shadow-lg hover:border-[#2563EB]/40 transition-all duration-300 flex flex-col h-full relative">
      
      {/* Badges & Wishlist Section */}
      <div className="absolute top-3 right-3 left-3 z-10 flex justify-between items-start">
        <div className="flex flex-col gap-1.5">
          {/* Discount Badge */}
          {product.discount && product.discount > 0 && (
            <span className="bg-[#EF4444] text-white text-[11px] font-bold px-2 py-1 rounded shadow-sm w-fit">
              خصم {product.discount}%
            </span>
          )}
          
          {/* New Badge */}
          <span className="bg-[#10B981] text-white text-[11px] font-bold px-2 py-1 rounded shadow-sm w-fit">
            جديد
          </span>
          
          {/* Out of Stock Badge */}
          {product.stock === 0 && (
            <span className="bg-[#EF4444] text-white text-[11px] font-bold px-2 py-1 rounded shadow-sm w-fit">
              نفدت الكمية
            </span>
          )}
        </div>
        
        {/* Wishlist Button (Heart) */}
        <button 
          onClick={toggleWishlist}
          className={`p-2 rounded-full backdrop-blur-sm transition-all shadow-sm ${
            isWishlisted 
              ? 'bg-red-50 text-[#EF4444] border border-red-100' // لون أحمر مع خلفية وردية خفيفة
              : 'bg-white/90 text-[#94A3B8] hover:text-[#EF4444] hover:bg-white border border-transparent'
          }`}
          title="أضف للمفضلة"
        >
          <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-[#EF4444]' : ''}`} />
        </button>
      </div>

      {/* Product Image */}
      <Link href={`/product/${product.id}`} className="relative block h-48 md:h-56 w-full overflow-hidden bg-white p-4">
        <img
          src={product.images && product.images.length > 0 ? product.images[0] : 'https://placehold.co/400x400?text=No+Image'}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
        />
      </Link>

      {/* Product Details */}
      <div className="p-4 flex flex-col grow border-t border-[#F1F5F9]">
        
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
          <span className="text-xs font-bold text-[#0F172A]">{product.averageRating || 0}</span>
          <span className="text-[11px] text-[#94A3B8]">({product.totalReviews || 0})</span>
        </div>

        {/* Product Title */}
        <Link href={`/product/${product.id}`}>
          <h3 className="text-[#0F172A] font-bold text-sm md:text-base line-clamp-2 hover:text-[#2563EB] transition-colors mb-2 leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Spacer */}
        <div className="grow" />

        {/* Pricing Section */}
        <div className="flex flex-col mt-2 mb-4">
          <div className="flex items-end gap-2">
            {/* Current Price (Strong Red) */}
            <span className="text-lg md:text-xl font-extrabold text-[#E3000F]">
              {finalPrice.toLocaleString('ar-EG')} <span className="text-sm font-bold">ج.م</span>
            </span>
            
            {/* Old Price (Faded Gray) */}
            {product.discount && product.discount > 0 && (
              <span className="text-xs md:text-sm text-[#94A3B8] line-through mb-1">
                {product.price.toLocaleString('ar-EG')} ج.م
              </span>
            )}
          </div>
          
          {/* Savings Amount (Comforting Green) */}
          {product.discount && product.discount > 0 && savings > 0 && (
            <div className="text-[11px] font-bold text-[#10B981] mt-1.5 bg-[#10B981]/10 w-fit px-2 py-0.5 rounded border border-[#10B981]/20">
              وفر {savings.toLocaleString('ar-EG')} ج.م
            </div>
          )}
        </div>

        {/* Add to Cart Button */}
        <button 
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
        >
          <ShoppingCart className="w-4 h-4" />
          <span className="text-sm">{product.stock > 0 ? 'أضف للسلة' : 'نفدت الكمية'}</span>
        </button>
      </div>
      
    </div>
  );
}