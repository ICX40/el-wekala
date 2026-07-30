"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useCart } from '@/components/CartProvider';
import ContactSellerButton from '@/components/ContactSellerButton';
import { 
  Loader2, ShoppingCart, ArrowRight, Minus, Plus, ShieldCheck, 
  Truck, RotateCcw, Star, Store, Tag 
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!params?.id) return;
      
      try {
        setIsLoading(true);
        const docRef = doc(db, 'products', params.id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const productData: any = { id: docSnap.id, ...docSnap.data() };
          setProduct(productData);
          if (productData.images && productData.images.length > 0) {
            setSelectedImage(productData.images[0]);
          }
        } else {
          toast.error("Product not found");
          router.push('/');
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Error loading product details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [params?.id, router]);

  const handleQuantityChange = (type: 'increase' | 'decrease') => {
    if (type === 'increase') {
      if (quantity < (product?.stock || 10)) {
        setQuantity(prev => prev + 1);
      } else {
        toast.error("Maximum available stock reached.");
      }
    } else {
      if (quantity > 1) {
        setQuantity(prev => prev - 1);
      }
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    setIsAddingToCart(true);
    
    const cartProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      discount: product.discount || 0,
      images: product.images || [selectedImage],
      sellerId: product.sellerId,
    };

    const finalPrice = cartProduct.discount > 0 
      ? cartProduct.price - (cartProduct.price * (cartProduct.discount / 100)) 
      : cartProduct.price;

    addToCart({ ...cartProduct, price: finalPrice } as any, quantity);
    
    setTimeout(() => {
      setIsAddingToCart(false);
      toast.success("تمت الإضافة إلى السلة بنجاح!");
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  const finalPrice = product.discount > 0 
    ? product.price - (product.price * (product.discount / 100)) 
    : product.price;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl" dir="rtl">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8 font-medium">
        <Link href="/" className="hover:text-blue-600 transition-colors">الرئيسية</Link>
        <ArrowRight className="w-4 h-4 rotate-180" />
        <Link href={`/category/${product.category}`} className="hover:text-blue-600 transition-colors">{product.category}</Link>
        <ArrowRight className="w-4 h-4 rotate-180" />
        <span className="text-slate-900 truncate max-w-[200px] sm:max-w-md">{product.name}</span>
      </nav>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Right Column: Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center relative">
              {product.discount > 0 && (
                <div className="absolute top-4 right-4 bg-red-500 text-white font-bold px-3 py-1 rounded-full text-sm z-10 shadow-sm">
                  خصم {product.discount}%
                </div>
              )}
              {selectedImage ? (
                <img 
                  src={selectedImage} 
                  alt={product.name} 
                  className="w-full h-full object-contain mix-blend-multiply p-4"
                />
              ) : (
                <span className="text-slate-400 font-medium">لا توجد صورة</span>
              )}
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img: string, idx: number) => (
                  <button 
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`aspect-square rounded-xl border-2 overflow-hidden bg-slate-50 transition-all ${selectedImage === img ? 'border-blue-600 shadow-md' : 'border-slate-200 hover:border-blue-400'}`}
                  >
                    <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-contain mix-blend-multiply p-2" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Left Column: Product Details */}
          <div className="flex flex-col">
            <div className="mb-4">
              <span className="inline-block bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold mb-3">
                {product.category}
              </span>
              <h1 className="text-3xl font-extrabold text-slate-900 leading-tight mb-2">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 text-slate-300" />
                  <span className="text-slate-500 text-sm font-medium mr-2">(4.0) 24 تقييم</span>
                </div>
              </div>
            </div>

            <div className="py-6 border-y border-slate-100 my-2">
              <div className="flex items-end gap-3 mb-2">
                <span className="text-4xl font-black text-blue-600">{finalPrice.toLocaleString('ar-EG')} <span className="text-xl">ج.م</span></span>
                {product.discount > 0 && (
                  <span className="text-lg font-bold text-slate-400 line-through mb-1.5">{Number(product.price).toLocaleString('ar-EG')} ج.م</span>
                )}
              </div>
              <p className="text-sm font-bold text-emerald-600">الأسعار شاملة ضريبة القيمة المضافة.</p>
            </div>

            <div className="my-6">
              <h3 className="text-slate-900 font-bold mb-3">وصف المنتج:</h3>
              <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100">
                {product.description || 'لا يوجد وصف متاح لهذا المنتج.'}
              </p>
            </div>

            {/* Quantity and Actions */}
            <div className="mt-auto space-y-4">
              
              <div className="flex items-center gap-4">
                <span className="text-slate-700 font-bold text-sm">الكمية:</span>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden h-12 w-32">
                  <button 
                    onClick={() => handleQuantityChange('increase')}
                    className="w-10 h-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors font-bold"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className="flex-1 text-center font-bold text-slate-900">{quantity}</span>
                  <button 
                    onClick={() => handleQuantityChange('decrease')}
                    className="w-10 h-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors font-bold"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
                {product.stock && (
                  <span className="text-xs font-bold text-slate-500">
                    (متبقي {product.stock} قطع)
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button 
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || product.stock === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md hover:shadow-lg"
                >
                  {isAddingToCart ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ShoppingCart className="w-5 h-5" />
                  )}
                  {product.stock === 0 ? 'نفذت الكمية' : 'إضافة إلى السلة'}
                </button>
                
                {/* Contact Seller Button Integration */}
                <div className="sm:w-auto">
                  <ContactSellerButton 
                    sellerId={product.sellerId} 
                    sellerName={product.sellerName || 'التاجر'} 
                  />
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* Seller info & Trust Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-full flex items-center justify-center border border-slate-100">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 mb-0.5">يباع بواسطة</p>
            <p className="text-sm font-extrabold text-slate-900">{product.sellerName || 'تاجر معتمد'}</p>
          </div>
        </div>

        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-white text-emerald-600 rounded-full flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-emerald-900 mb-0.5">ضمان الجودة</p>
            <p className="text-xs font-bold text-emerald-700">منتجات أصلية 100%</p>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-white text-blue-600 rounded-full flex items-center justify-center shadow-sm">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-blue-900 mb-0.5">استرجاع سهل</p>
            <p className="text-xs font-bold text-blue-700">خلال 14 يوم من الاستلام</p>
          </div>
        </div>
      </div>

    </div>
  );
}