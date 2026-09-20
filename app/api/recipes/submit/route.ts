import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();

    // Create a Supabase client to get the authenticated user
    const supabaseUserClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
      }
    );

    const { data: { session }, error: sessionError } = await supabaseUserClient.auth.getSession();

    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Create an admin client to bypass RLS for both storage and DB
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Parse multipart form data
    const formData = await request.formData();

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const prepTime = formData.get('prepTime') as string;
    const difficulty = formData.get('difficulty') as string;
    const cuisine = formData.get('cuisine') as string;
    const tags = JSON.parse((formData.get('tags') as string) || '[]');
    const ingredients = JSON.parse((formData.get('ingredients') as string) || '[]');
    const steps = JSON.parse((formData.get('steps') as string) || '[]');

    // Upload images server-side using admin client (bypasses storage RLS)
    const imageUrls: string[] = [];
    const imageFiles = formData.getAll('images') as File[];

    for (const file of imageFiles) {
      if (file && file.size > 0) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const filePath = `recipes/images/${fileName}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error: uploadError } = await supabaseAdmin.storage
          .from('food-media')
          .upload(filePath, buffer, { contentType: file.type });

        if (uploadError) {
          console.error('Image upload error:', uploadError);
        } else {
          const { data: { publicUrl } } = supabaseAdmin.storage
            .from('food-media')
            .getPublicUrl(filePath);
          imageUrls.push(publicUrl);
        }
      }
    }

    // Upload video server-side using admin client
    let uploadedVideoUrl: string | null = null;
    const videoFile = formData.get('video') as File | null;

    if (videoFile && videoFile.size > 0) {
      const fileExt = videoFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `recipes/videos/${fileName}`;

      const arrayBuffer = await videoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabaseAdmin.storage
        .from('food-media')
        .upload(filePath, buffer, { contentType: videoFile.type });

      if (uploadError) {
        console.error('Video upload error:', uploadError);
      } else {
        const { data: { publicUrl } } = supabaseAdmin.storage
          .from('food-media')
          .getPublicUrl(filePath);
        uploadedVideoUrl = publicUrl;
      }
    }

    // 1. Insert Recipe
    const { data: recipe, error: recipeError } = await supabaseAdmin
      .from('recipes')
      .insert({
        user_id: userId,
        title,
        description,
        prep_time: prepTime,
        difficulty,
        cuisine,
        tags,
        image_urls: imageUrls,
        video_url: uploadedVideoUrl,
        is_approved: false
      })
      .select()
      .single();

    if (recipeError) {
      console.error('Recipe Error:', recipeError);
      return NextResponse.json({ error: 'Failed to create recipe record: ' + recipeError.message }, { status: 500 });
    }

    // 2. Insert Ingredients
    if (ingredients && ingredients.length > 0) {
      const validIngredients = ingredients.map((i: any) => ({
        ...i,
        recipe_id: recipe.id
      }));
      const { error: ingError } = await supabaseAdmin.from('recipe_ingredients').insert(validIngredients);
      if (ingError) {
        console.error('Ingredients Error:', ingError);
      }
    }

    // 3. Insert Steps
    if (steps && steps.length > 0) {
      const validSteps = steps.map((s: any, index: number) => ({
        recipe_id: recipe.id,
        step_number: index + 1,
        instruction: s.instruction
      }));
      const { error: stepsError } = await supabaseAdmin.from('recipe_steps').insert(validSteps);
      if (stepsError) {
        console.error('Steps Error:', stepsError);
      }
    }

    return NextResponse.json({ success: true, recipeId: recipe.id });

  } catch (error: any) {
    console.error('Server error during recipe submission:', error);
    return NextResponse.json({ error: 'Internal Server Error: ' + error.message }, { status: 500 });
  }
}
