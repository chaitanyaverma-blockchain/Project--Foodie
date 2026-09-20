require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Seeding data...');

  // 1. Categories
  const categories = [
    { name: 'North Indian', slug: 'north-indian', image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&q=80', sort_order: 1 },
    { name: 'Italian', slug: 'italian', image_url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=200&q=80', sort_order: 2 },
    { name: 'Desserts', slug: 'desserts', image_url: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=200&q=80', sort_order: 3 },
  ];

  const categoryIds = {};

  for (const cat of categories) {
    const { data, error } = await supabase
      .from('categories')
      .upsert({ ...cat }, { onConflict: 'slug' })
      .select()
      .single();

    if (error) {
      console.error('Error inserting category:', error);
    } else {
      categoryIds[cat.slug] = data.id;
      console.log(`Inserted category: ${cat.name}`);
    }
  }

  // 2. Food Items
  const foodItems = [
    {
      name: 'Paneer Butter Masala',
      slug: 'paneer-butter-masala',
      description: 'Rich and creamy curry made with paneer, spices, onions, tomatoes, cashews and butter.',
      category_id: categoryIds['north-indian'],
      price: 320,
      sale_price: 280,
      is_veg: true,
      status: 'active',
      stock_status: 'available',
      tags: ['spicy', 'popular'],
    },
    {
      name: 'Chicken Biryani',
      slug: 'chicken-biryani',
      description: 'Classic aromatic dish with fragrant rice, tender chicken, and authentic spices.',
      category_id: categoryIds['north-indian'],
      price: 450,
      sale_price: 399,
      is_veg: false,
      status: 'active',
      stock_status: 'available',
      tags: ['bestseller'],
    },
    {
      name: 'Margherita Pizza',
      slug: 'margherita-pizza',
      description: 'Classic delight with 100% real mozzarella cheese and tomato sauce.',
      category_id: categoryIds['italian'],
      price: 299,
      sale_price: null,
      is_veg: true,
      status: 'active',
      stock_status: 'available',
      tags: ['classic'],
    },
    {
      name: 'Chocolate Lava Cake',
      slug: 'chocolate-lava-cake',
      description: 'Warm chocolate cake with a gooey, molten chocolate center.',
      category_id: categoryIds['desserts'],
      price: 150,
      sale_price: 120,
      is_veg: true,
      status: 'active',
      stock_status: 'available',
      tags: ['sweet'],
    }
  ];

  for (const food of foodItems) {
    if (!food.category_id) continue;
    const { data, error } = await supabase
      .from('food_items')
      .upsert({ ...food }, { onConflict: 'slug' })
      .select()
      .single();

    if (error) {
      console.error('Error inserting food item:', error);
    } else {
      console.log(`Inserted food item: ${food.name}`);
    }
  }

  console.log('Seeding complete!');
}

seed().catch(console.error);
