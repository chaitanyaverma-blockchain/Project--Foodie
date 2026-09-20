import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

// Service-role client for admin operations (bypasses RLS)
const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function isAdmin() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  return profile?.role === 'admin';
}

// GET /api/admin/food-items
export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const { data, error } = await adminClient
    .from('food_items')
    .select('*, categories(*), food_options(*, food_option_values(*))')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/admin/food-items
export async function POST(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const body = await req.json();
  const { options, ...payload } = body;

  // Insert food item
  const { data: item, error } = await adminClient
    .from('food_items')
    .insert(payload)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Insert options if provided
  if (options && options.length > 0 && item) {
    for (let i = 0; i < options.length; i++) {
      const opt = options[i];
      if (!opt.name?.trim()) continue;
      const { data: insertedOpt, error: optErr } = await adminClient
        .from('food_options')
        .insert({ food_item_id: item.id, name: opt.name, type: opt.type, is_required: opt.is_required, sort_order: i })
        .select()
        .single();
      if (!optErr && insertedOpt && opt.values?.length > 0) {
        const vals = opt.values.filter((v: { value: string }) => v.value?.trim()).map((val: { value: string; price_modifier: number; is_available: boolean }, j: number) => ({
          option_id: insertedOpt.id, value: val.value, price_modifier: val.price_modifier || 0, is_available: val.is_available, sort_order: j,
        }));
        if (vals.length > 0) await adminClient.from('food_option_values').insert(vals);
      }
    }
  }

  // Return with full joins
  const { data: final } = await adminClient
    .from('food_items')
    .select('*, categories(*), food_options(*, food_option_values(*))')
    .eq('id', item.id)
    .single();
  return NextResponse.json(final, { status: 201 });
}

// PUT /api/admin/food-items
export async function PUT(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const body = await req.json();
  const { id, options, ...payload } = body;
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const { error } = await adminClient.from('food_items').update(payload).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Rebuild options
  await adminClient.from('food_options').delete().eq('food_item_id', id);
  if (options && options.length > 0) {
    for (let i = 0; i < options.length; i++) {
      const opt = options[i];
      if (!opt.name?.trim()) continue;
      const { data: insertedOpt } = await adminClient
        .from('food_options')
        .insert({ food_item_id: id, name: opt.name, type: opt.type, is_required: opt.is_required, sort_order: i })
        .select().single();
      if (insertedOpt && opt.values?.length > 0) {
        const vals = opt.values.filter((v: { value: string }) => v.value?.trim()).map((val: { value: string; price_modifier: number; is_available: boolean }, j: number) => ({
          option_id: insertedOpt.id, value: val.value, price_modifier: val.price_modifier || 0, is_available: val.is_available, sort_order: j,
        }));
        if (vals.length > 0) await adminClient.from('food_option_values').insert(vals);
      }
    }
  }

  const { data: final } = await adminClient
    .from('food_items')
    .select('*, categories(*), food_options(*, food_option_values(*))')
    .eq('id', id).single();
  return NextResponse.json(final);
}

// DELETE /api/admin/food-items
export async function DELETE(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const { error } = await adminClient.from('food_items').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
