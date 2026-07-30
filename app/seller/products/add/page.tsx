"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/components/AuthProvider';
import { megaMenuData } from '@/lib/categories';
import { Loader2, ArrowRight, Package, Tag, DollarSign, Image as ImageIcon, CheckCircle2, AlignRight, Layers } from 'lucide-react';

// Extract dynamic categories directly from megaMenuData
const CATEGORIES = megaMenuData.map(cat => ({
  id: cat.id,
  name: cat.name
}));

export default function AddProductPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  
  // Get initial subcategories for the first category
  const initialCategoryData = megaMenuData.find(c => c.id === CATEGORIES[0].id);
  const initialSubCategories = initialCategoryData?.subCategories?.flatMap(g => g.items) || ["أخرى"];

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discount: "",
    stock: "",
    sku: "",
    categoryId: CATEGORIES[0].id,
    subCategory: initialSubCategories[0],
    imageUrl: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "categoryId") {
      // Find the new subcategories based on megaMenuData
      const selectedCategoryData = megaMenuData.find(c => c.id === value);
      const newSubCategories = selectedCategoryData?.subCategories?.flatMap(g => g.items) || ["أخرى"];
      
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        subCategory: newSubCategories[0] // default to first item of new category
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setSuccessMsg("");

    try {
      const newProduct = {
        sellerId: user.uid,
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        discount: formData.discount ? Number(formData.discount) : 0,
        stock: Number(formData.stock),
        sku: formData.sku,
        categoryId: formData.categoryId,
        subCategory: formData.subCategory, 
        images: formData.imageUrl ? [formData.imageUrl] : [], 
        status: "Active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        averageRating: 0,
        totalReviews: 0
      };

      await addDoc(collection(db, "products"), newProduct);
      
      setSuccessMsg("تم إضافة المنتج بنجاح! جاري تحويلك...");
      
      setTimeout(() => {
        router.push('/seller/products');
      }, 2000);

    } catch (error) {
      console.error("Error adding product:", error);
      alert("حدث خطأ أثناء محاولة إضافة المنتج.");
      setIsSubmitting(false);
    }
  };

  // Get current subcategories for the dropdown dynamically
  const currentCategoryData = megaMenuData.find(c => c.id === formData.categoryId);
  const currentSubcategories = currentCategoryData?.subCategories?.flatMap(g => g.items) || ["أخرى"];

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir="rtl">
      
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <Link href="/seller/products" className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">إضافة منتج جديد</h1>
          <p className="text-slate-500 text-sm mt-1">أدخل بيانات المنتج بدقة ليظهر للعملاء بأفضل شكل.</p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl flex items-center gap-3 border border-emerald-200">
          <CheckCircle2 className="w-6 h-6 shrink-0" />
          <p className="font-bold">{successMsg}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">المعلومات الأساسية</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  اسم المنتج
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-900"
                  placeholder="مثال: لابتوب ماك بوك برو M3"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <AlignRight className="w-4 h-4 text-blue-600" />
                  وصف المنتج
                </label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-900 resize-none"
                  placeholder="اكتب وصفاً دقيقاً ومفصلاً لمميزات المنتج..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-600" />
                  القسم الرئيسي
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-900"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  القسم الفرعي
                </label>
                <select
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-900"
                >
                  {currentSubcategories.map((sub, idx) => (
                    <option key={idx} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  كود المنتج (SKU)
                </label>
                <input
                  type="text"
                  name="sku"
                  required
                  value={formData.sku}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-900 dir-ltr text-right"
                  placeholder="مثال: MAC-PRO-24"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Inventory */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">التسعير والمخزون</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  السعر (جنيه مصري)
                </label>
                <input
                  type="number"
                  name="price"
                  required
                  min="1"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-900"
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-red-500" />
                  نسبة الخصم % (اختياري)
                </label>
                <input
                  type="number"
                  name="discount"
                  min="0"
                  max="99"
                  value={formData.discount}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-900"
                  placeholder="مثال: 10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  الكمية المتاحة (المخزون)
                </label>
                <input
                  type="number"
                  name="stock"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-900"
                  placeholder="عدد القطع المتاحة"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">صورة المنتج</h3>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                رابط الصورة (URL)
              </label>
              <input
                type="url"
                name="imageUrl"
                required
                value={formData.imageUrl}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-900 dir-ltr text-right"
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-slate-500">مؤقتاً: يرجى وضع رابط مباشر لصورة المنتج (مثال من موقع Unsplash أو صور جوجل).</p>
            </div>
            
            {formData.imageUrl && (
              <div className="mt-4 p-4 border border-slate-200 rounded-xl inline-block bg-slate-50">
                <span className="block text-xs font-bold text-slate-500 mb-2">معاينة الصورة:</span>
                <img 
                  src={formData.imageUrl} 
                  alt="Preview" 
                  className="w-32 h-32 object-contain bg-white rounded-lg border border-slate-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=Invalid+Image';
                  }}
                />
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-200 flex items-center justify-end gap-4">
            <Link 
              href="/seller/products"
              className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
            >
              إلغاء
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'إضافة المنتج'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}