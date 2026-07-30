import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 });
    }
    
    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, items, shippingAddress, paymentMethod, promoCode } = body;

    if (decodedToken.uid !== userId) {
      return NextResponse.json({ error: 'Forbidden: You can only create orders for your own verified account' }, { status: 403 });
    }

    if (!userId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required order data.' }, { status: 400 });
    }

    let subtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      try {
        const productDoc = await adminDb.collection('products').doc(item.productId).get();
        
        if (productDoc.exists) {
          const productData = productDoc.data();
          const dbPrice = productData?.price || 0;
          const dbDiscount = productData?.discount || 0;
          
          const finalPrice = dbDiscount > 0 ? dbPrice - (dbPrice * (dbDiscount / 100)) : dbPrice;
          
          subtotal += finalPrice * item.quantity;
          
          verifiedItems.push({
            id: item.productId,
            productId: item.productId,
            sellerId: productData?.sellerId || '',
            name: productData?.name || item.name,
            price: finalPrice,
            quantity: item.quantity,
            image: item.image || (productData?.images ? productData.images[0] : '')
          });
        }
      } catch (err) {
        console.error(`Failed to fetch product ${item.productId}:`, err);
      }
    }

    if (verifiedItems.length === 0) {
      return NextResponse.json({ error: 'No valid products found to process.' }, { status: 400 });
    }

    let discountAmount = 0;
    let appliedPromo = null;

    if (promoCode) {
      try {
        const promoSnapshot = await adminDb.collection('promo_codes')
          .where('code', '==', promoCode.toUpperCase().trim())
          .where('isActive', '==', true)
          .get();

        if (!promoSnapshot.empty) {
          const promoData = promoSnapshot.docs[0].data();
          discountAmount = (subtotal * promoData.discountPercentage) / 100;
          appliedPromo = promoData.code;
        }
      } catch (err) {
        console.error('Error validating promo code:', err);
      }
    }

    const shippingCost = subtotal > 0 ? 50 : 0;
    const finalAmount = subtotal + shippingCost - discountAmount;
    
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    const newOrder = {
      orderNumber,
      customerId: userId,
      items: verifiedItems,
      totalAmount: subtotal,
      shippingCost,
      discountAmount,
      finalAmount,
      appliedPromoCode: appliedPromo,
      status: 'Pending',
      shippingAddress,
      paymentMethod,
      paymentStatus: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const orderRef = await adminDb.collection('orders').add(newOrder);

    return NextResponse.json({ success: true, orderId: orderRef.id }, { status: 200 });

  } catch (error: any) {
    console.error('Secure Checkout Error:', error);
    return NextResponse.json({ error: 'Internal Server Error while processing order.' }, { status: 500 });
  }
}