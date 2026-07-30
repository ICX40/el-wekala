"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/components/AuthProvider';
import { Loader2, ArrowRight, Package, Tag, DollarSign, Image as ImageIcon, CheckCircle2, AlignRight, AlertTriangle } from 'lucide-react';

const CATEGORIES = [
  { id: "1", name: "الإلكترونيات والموبايلات" },
  { id: "2", name: "أزياء نسائية" },
  { id: "3", name: "أزياء رجالية" },
  { id: "4", name: "أزياء الأطفال" },
  { id: "5", name: "الجمال والعطور" },
  { id: "6", name: "المنزل والأجهزة" },
  { id: "7", name: "المواليد" },
  { id: "8", name: "ألعاب وتسالي" },
  { id: "9", name: "سوبر ماركت" },
  { id: "10", name: "السيارات" },
  { id: "11", name: "الصحة والتغذية" },
  { id: "12", name: "الرياضة والخارج" },
  { id: "13", name: "قرطاسية ومكتب" },
];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discount: "",
    stock: "",
    sku: "",
    categoryId: "1",
    imageUrl: ""
  });

  useEffect(() => {
    const fetchProduct = async () => {
      if (!params?.id || !user) return;
      
      try {
        const docRef = doc(db, "products", params.id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // حماية أمنية: التأكد من أن التاجر الحالي هو صاحب المنتج
          if (data.sellerId !== user.uid) {
            setError("عذراً، ليس لديك صلاحية لتعديل هذا المنتج.");
            setIsLoading(false);
            return;
          }

          setFormData({
            name: data.name || "",
            description: data.description || "",
            price: data.price ? data.price.toString() : "",
            discount: data.discount ? data.discount.toString() : "",
            stock: data.stock !== undefined ? data.stock.toString() : "",
            sku: data.sku || "",
            categoryId: data.categoryId || "1",
            imageUrl: data.images && data.images.length > 0 ? data.images[0] : ""
          });
        } else {
          setError("المنتج غير موجود.");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("حدث خطأ أثناء جلب بيانات المنتج.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [params?.id, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !params?.id) return;

    setIsSubmitting(true);
    setSuccessMsg("");
    setError("");

    try {
      const docRef = doc(db, "products", params.id);
      await updateDoc(docRef, {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        discount: formData.discount ? Number(formData.discount) : 0,
        stock: Number(formData.stock),
        sku: formData.sku,
        categoryId: formData.categoryId,
        images: formData.imageUrl ? [formData.imageUrl] : [],
        updatedAt: new Date().toISOString()
      });
      
      setSuccessMsg("تم تحديث بيانات المنتج بنجاح! جاري تحويلك...");
      
      setTimeout(() => {
        router.push('/seller/products');
      }, 2000);

    } catch (err) {
      console.error("Error updating product:", err);
      setError("حدث خطأ أثناء تحديث المنتج.");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error && !formData.name) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center bg-white p-8 rounded-2xl border border-slate-200">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">{error}</h2>
        <Link href="/seller/products" className="text-blue-600 hover:underline font-medium">
          العودة لقائمة المنتجات
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir="rtl">
      
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <Link href="/seller/products" className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">تعديل المنتج</h1>
          <p className="text-slate-500 text-sm mt-1">تحديث السعر، المخزون، أو بيانات المنتج الأساسية.</p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl flex items-center gap-3 border border-emerald-200">
          <CheckCircle2 className="w-6 h-6 shrink-0" />
          <p className="font-bold">{successMsg}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-200">
          <AlertTriangle className="w-6 h-6 shrink-0" />
          <p className="font-bold">{error}</p>
        </div>
      )}

      {/* Product Form */}
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
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-600" />
                  القسم (التصنيف)
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
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-red-500" />
                  نسبة الخصم %
                </label>
                <input
                  type="number"
                  name="discount"
                  min="0"
                  max="99"
                  value={formData.discount}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-900"
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
              />
            </div>
            
            {/* Image Preview */}
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

          {/* Actions */}
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
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'حفظ التعديلات'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}