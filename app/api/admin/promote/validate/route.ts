import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    
    if (!code) {
      return NextResponse.json({ error: 'Promo code is required' }, { status: 400 });
    }

    const promosRef = adminDb.collection('promo_codes');
    const snapshot = await promosRef
      .where('code', '==', code.toUpperCase().trim())
      .where('isActive', '==', true)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ error: 'Invalid or inactive promo code.' }, { status: 404 });
    }

    const promoData = snapshot.docs[0].data();
    
    return NextResponse.json({ 
      success: true, 
      discountPercentage: promoData.discountPercentage, 
      code: promoData.code 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Promo validation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}