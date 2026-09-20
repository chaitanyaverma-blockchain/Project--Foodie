import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@/lib/supabase/server';
import { generateOrderNumber, applyCouponDiscount } from '@/lib/utils';
import type { CartItem, Coupon } from '@/types';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { items, deliveryAddress, couponCode, tip = 0 } = body as {
      items: CartItem[];
      deliveryAddress: Record<string, unknown>;
      couponCode?: string;
      tip: number;
    };

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Calculate subtotal
    const subtotal = items.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);

    // Validate coupon
    let discount = 0;
    let coupon: Coupon | null = null;
    if (couponCode) {
      const { data: couponData } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (couponData) {
        coupon = couponData as Coupon;
        if (!coupon.min_order || subtotal >= coupon.min_order) {
          discount = applyCouponDiscount(subtotal, coupon.type, coupon.value, coupon.max_discount ?? null);
          // Increment usage
          await supabase
            .from('coupons')
            .update({ times_used: (coupon.times_used ?? 0) + 1 })
            .eq('id', coupon.id);
        }
      }
    }

    const deliveryCharge = 40;
    const total = Math.max(0, subtotal - discount + deliveryCharge + tip);
    const orderNumber = generateOrderNumber();

    // Create Razorpay order
    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(total * 100), // in paise
      currency: 'INR',
      receipt: orderNumber,
    });

    // Create DB order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: user.id,
        delivery_address: deliveryAddress,
        subtotal,
        discount,
        delivery_charge: deliveryCharge,
        tip,
        total,
        coupon_code: couponCode ?? null,
        payment_status: 'pending',
        fulfillment_status: 'placed',
        razorpay_order_id: rzpOrder.id,
      })
      .select()
      .single();

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    // Create order items
    await supabase.from('order_items').insert(
      items.map((item: CartItem) => ({
        order_id: order.id,
        food_item_id: item.food_item_id,
        title: item.name,
        image_url: item.image_url,
        variant_info: Object.fromEntries(
          item.selected_options.map((o) => [o.option_name, o.value])
        ),
        quantity: item.quantity,
        unit_price: item.price,
        line_total: item.price * item.quantity,
      }))
    );

    // Create initial timeline entry
    await supabase.from('order_timeline').insert({
      order_id: order.id,
      status: 'placed',
      note: 'Your order has been received!',
    });

    return NextResponse.json({
      orderId: order.id,
      orderNumber,
      razorpayOrderId: rzpOrder.id,
      razorpayAmount: Math.round(total * 100),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('Order create error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
