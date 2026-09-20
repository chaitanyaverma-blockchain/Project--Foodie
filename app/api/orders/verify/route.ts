import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    // Verify Razorpay signature
    const body_str = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body_str)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const supabase = await createClient();

    // Update order payment status
    await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        fulfillment_status: 'confirmed',
        razorpay_payment_id: razorpayPaymentId,
      })
      .eq('id', orderId);

    // Add timeline entry
    await supabase.from('order_timeline').insert({
      order_id: orderId,
      status: 'confirmed',
      note: 'Payment confirmed! Your order is being prepared.',
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Verification failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
