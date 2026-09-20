// ============================================================
// FOODIE — Core TypeScript Types
// ============================================================

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: 'customer' | 'admin';
  created_at: string;
  updated_at: string;
  // Redesign fields
  cover_url?: string | null;
  username?: string | null;
  bio?: string | null;
  trophies?: number;
  league?: string | null;
  location?: string | null;
  website?: string | null;
  social_links?: Record<string, string> | null;
  occupation?: string | null;
  birthday?: string | null;
  favorite_cuisine?: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface FoodItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  price: number;
  sale_price: number | null;
  image_url: string | null;
  is_veg: boolean;
  is_egg: boolean;
  calories: number | null;
  dietary_tags: string[] | null;
  status: 'active' | 'inactive';
  stock_status: 'available' | 'sold_out';
  rating: number;
  order_count: number;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  // Joined
  categories?: Category;
  food_options?: FoodOption[];
}

export interface FoodOption {
  id: string;
  food_item_id: string;
  name: string;
  type: 'single' | 'multiple';
  is_required: boolean;
  sort_order: number;
  food_option_values?: FoodOptionValue[];
}

export interface FoodOptionValue {
  id: string;
  option_id: string;
  value: string;
  price_modifier: number;
  is_available: boolean;
  sort_order: number;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  type: 'percentage' | 'fixed';
  value: number;
  min_order: number;
  max_discount: number | null;
  max_uses: number;
  times_used: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  delivery_address: Address;
  subtotal: number;
  discount: number;
  delivery_charge: number;
  tip: number;
  total: number;
  coupon_code: string | null;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  fulfillment_status: 'placed' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  order_items?: OrderItem[];
  order_timeline?: OrderTimeline[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  food_item_id: string | null;
  title: string;
  image_url: string | null;
  variant_info: Record<string, string>;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface OrderTimeline {
  id: string;
  order_id: string;
  status: string;
  note: string | null;
  created_at: string;
}

// ============================================================
// CART TYPES
// ============================================================
export interface CartItem {
  id: string;              // unique cart item id (food_item_id + variant hash)
  food_item_id: string;
  name: string;
  image_url: string | null;
  price: number;           // final price with modifiers
  quantity: number;
  is_veg: boolean;
  is_egg: boolean;
  selected_options: SelectedOption[];
}

export interface SelectedOption {
  option_id: string;
  option_name: string;
  value_id: string;
  value: string;
  price_modifier: number;
}

export interface CartState {
  items: CartItem[];
  coupon: Coupon | null;
  tip: number;
}

// ============================================================
// ADMIN / STATS TYPES
// ============================================================
export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  pendingOrders: number;
  revenueByDay: { date: string; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
  soldOutItems: Partial<FoodItem>[];
}

// ============================================================
// RECIPE COMMUNITY TYPES
// ============================================================
export interface Recipe {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  image_urls: string[] | null;
  video_url: string | null;
  prep_time: string | null;
  difficulty: string | null;
  cuisine: string | null;
  tags: string[] | null;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
  // Joined
  profiles?: Profile;
  recipe_ingredients?: RecipeIngredient[];
  recipe_steps?: RecipeStep[];
  likes_count?: number;
  comments_count?: number;
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  name: string;
  quantity: string | null;
  unit: string | null;
}

export interface RecipeStep {
  id: string;
  recipe_id: string;
  step_number: number;
  instruction: string;
}

export interface RecipeComment {
  id: string;
  recipe_id: string;
  user_id: string;
  content: string;
  created_at: string;
  // Joined
  profiles?: Profile;
}

// ============================================================
// FILTER TYPES
// ============================================================
export interface MenuFilters {
  veg?: boolean;
  nonVeg?: boolean;
  egg?: boolean;
  drink?: boolean;
  priceMin?: number;
  priceMax?: number;
  categories?: string[];
  rating?: number;
  search?: string;
  sort?: 'popular' | 'rating' | 'price_asc' | 'price_desc' | 'newest';
}

// ============================================================
// DATABASE TYPES (for Supabase generic client)
// ============================================================
export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      categories: { Row: Category; Insert: Partial<Category>; Update: Partial<Category> };
      food_items: { Row: FoodItem; Insert: Partial<FoodItem>; Update: Partial<FoodItem> };
      food_options: { Row: FoodOption; Insert: Partial<FoodOption>; Update: Partial<FoodOption> };
      food_option_values: { Row: FoodOptionValue; Insert: Partial<FoodOptionValue>; Update: Partial<FoodOptionValue> };
      addresses: { Row: Address; Insert: Partial<Address>; Update: Partial<Address> };
      coupons: { Row: Coupon; Insert: Partial<Coupon>; Update: Partial<Coupon> };
      orders: { Row: Order; Insert: Partial<Order>; Update: Partial<Order> };
      order_items: { Row: OrderItem; Insert: Partial<OrderItem>; Update: Partial<OrderItem> };
      order_timeline: { Row: OrderTimeline; Insert: Partial<OrderTimeline>; Update: Partial<OrderTimeline> };
      recipes: { Row: Recipe; Insert: Partial<Recipe>; Update: Partial<Recipe> };
      recipe_ingredients: { Row: RecipeIngredient; Insert: Partial<RecipeIngredient>; Update: Partial<RecipeIngredient> };
      recipe_steps: { Row: RecipeStep; Insert: Partial<RecipeStep>; Update: Partial<RecipeStep> };
      recipe_comments: { Row: RecipeComment; Insert: Partial<RecipeComment>; Update: Partial<RecipeComment> };
    };
  };
};
