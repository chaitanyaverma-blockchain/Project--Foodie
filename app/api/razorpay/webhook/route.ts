import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature') ?? '';

    // Verify webhook signature
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex');

    if (expectedSig !== signature) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    const supabase = await createClient();

    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      await supabase
        .from('orders')
        .update({ payment_status: 'paid', fulfillment_status: 'confirmed' })
        .eq('razorpay_order_id', payment.order_id);
    }

    if (event.event === 'payment.failed') {
      const payment = event.payload.payment.entity;
      await supabase
        .from('orders')
        .update({ payment_status: 'failed' })
        .eq('razorpay_order_id', payment.order_id);
    }

    if (event.event === 'refund.created') {
      const refund = event.payload.refund.entity;
      await supabase
        .from('orders')
        .update({ payment_status: 'refunded' })
        .eq('razorpay_payment_id', refund.payment_id);
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
