import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    // 1. Verify Authentication Token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 });
    }
    
    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token provided' }, { status: 401 });
    }

    // 2. Verify Admin Role securely from the server side
    const callerDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    if (!callerDoc.exists || callerDoc.data()?.role !== 'Admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access strictly required' }, { status: 403 });
    }

    const body = await request.json();
    const { applicationId, userId, type, action } = body;

    if (!applicationId || !userId || !type || !action) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const appCollection = type === 'seller' ? 'seller_applications' : 'support_applications';
    const newRole = type === 'seller' ? 'Seller' : 'Support';

    const batch = adminDb.batch();

    const applicationRef = adminDb.collection(appCollection).doc(applicationId);
    const userRef = adminDb.collection('users').doc(userId);

    if (action === 'approve') {
      batch.update(applicationRef, {
        status: 'Approved',
        updatedAt: new Date().toISOString()
      });

      batch.update(userRef, {
        role: newRole,
        applicationStatus: null,
        updatedAt: new Date().toISOString()
      });
    } else if (action === 'reject') {
      batch.update(applicationRef, {
        status: 'Rejected',
        updatedAt: new Date().toISOString()
      });

      batch.update(userRef, {
        applicationStatus: null,
        updatedAt: new Date().toISOString()
      });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await batch.commit();

    return NextResponse.json({ success: true, message: `Application ${action}d successfully` }, { status: 200 });

  } catch (error: any) {
    console.error('Backend Error in promote API:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}