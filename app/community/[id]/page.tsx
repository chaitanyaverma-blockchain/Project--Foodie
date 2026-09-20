'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Clock, Heart, Share2, Bookmark, ArrowLeft, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { CookItModal } from '@/components/community/CookItModal';
import { OrderItModal } from '@/components/community/OrderItModal';
import { createClient } from '@/lib/supabase/client';

export default function RecipeDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [recipe, setRecipe] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cookItOpen, setCookItOpen] = useState(false);
  const [orderItOpen, setOrderItOpen] = useState(false);
  const [matchingFoodItem, setMatchingFoodItem] = useState<any | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = user && recipe && user.id === recipe.user_id;

  useEffect(() => {
    if (!id) return;
    // Load recipe from localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('community_recipes') || '[]');
      const found = stored.find((r: any) => r.id === id);
      if (found) {
        setRecipe(found);
        setLikesCount(found.likes_count || 0);

        // Load comments for this recipe
        const allComments = JSON.parse(localStorage.getItem(`recipe_comments_${id}`) || '[]');
        setComments(allComments);

        // Load liked/saved state for current user
        if (user) {
          const likedIds = JSON.parse(localStorage.getItem(`liked_recipes_${user.id}`) || '[]');
          setIsLiked(likedIds.includes(id));
          const savedIds = JSON.parse(localStorage.getItem(`saved_recipes_${user.id}`) || '[]');
          setIsSaved(savedIds.includes(id));
        }

        // Check for a matching food item in Supabase (non-critical)
        supabase
          .from('food_items')
          .select('*')
          .ilike('name', `%${found.title}%`)
          .limit(1)
          .single()
          .then(({ data }) => { if (data) setMatchingFoodItem(data); });
      }
    } catch (e) {
      console.error('Failed to load recipe', e);
    }
    setLoading(false);
  }, [id, user]);

  const handleLike = () => {
    if (!user) { toast.error('Please sign in to like this recipe'); return; }
    const likedKey = `liked_recipes_${user.id}`;
    const likedIds = JSON.parse(localStorage.getItem(likedKey) || '[]');
    let newLikedIds: string[];
    let newCount: number;

    if (isLiked) {
      newLikedIds = likedIds.filter((i: string) => i !== id);
      newCount = likesCount - 1;
    } else {
      newLikedIds = [...likedIds, id];
      newCount = likesCount + 1;
    }
    localStorage.setItem(likedKey, JSON.stringify(newLikedIds));

    // Update likes_count in the stored recipe
    const stored = JSON.parse(localStorage.getItem('community_recipes') || '[]');
    const updated = stored.map((r: any) => r.id === id ? { ...r, likes_count: newCount } : r);
    localStorage.setItem('community_recipes', JSON.stringify(updated));

    setIsLiked(!isLiked);
    setLikesCount(newCount);
  };

  const handleSave = () => {
    if (!user) { toast.error('Please sign in to save this recipe'); return; }
    const savedKey = `saved_recipes_${user.id}`;
    const savedIds = JSON.parse(localStorage.getItem(savedKey) || '[]');
    if (isSaved) {
      localStorage.setItem(savedKey, JSON.stringify(savedIds.filter((i: string) => i !== id)));
      setIsSaved(false);
      toast.success('Recipe removed from saved');
    } else {
      localStorage.setItem(savedKey, JSON.stringify([...savedIds, id]));
      setIsSaved(true);
      toast.success('Recipe saved!');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: recipe?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const handleEdit = () => {
    router.push(`/community/new?edit=${id}`);
  };

  const handleDelete = () => {
    setDeleting(true);
    try {
      // Remove from community_recipes
      const stored = JSON.parse(localStorage.getItem('community_recipes') || '[]');
      const filtered = stored.filter((r: any) => r.id !== id);
      localStorage.setItem('community_recipes', JSON.stringify(filtered));
      // Clean up associated data
      localStorage.removeItem(`recipe_comments_${id}`);
      toast.success('Recipe deleted successfully');
      router.push('/community');
    } catch (e) {
      toast.error('Failed to delete recipe');
      setDeleting(false);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Please sign in to comment'); return; }
    if (!newComment.trim()) return;

    const comment = {
      id: crypto.randomUUID(),
      recipe_id: id,
      user_id: user.id,
      content: newComment.trim(),
      created_at: new Date().toISOString(),
      profiles: {
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      },
    };

    const commentsKey = `recipe_comments_${id}`;
    const existing = JSON.parse(localStorage.getItem(commentsKey) || '[]');
    const updated = [comment, ...existing];
    localStorage.setItem(commentsKey, JSON.stringify(updated));
    setComments(updated);
    setNewComment('');
    toast.success('Comment posted!');
  };

  if (loading) {
    return <div className="min-h-screen pt-32 pb-20 flex justify-center"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!recipe) {
    return (
      <div className="min-h-screen pt-32 pb-20 text-center">
        <p className="text-gray-500 mb-4">Recipe not found.</p>
        <Link href="/community" className="text-[#FF6B00] font-semibold hover:underline">← Back to Community</Link>
      </div>
    );
  }

  const ingredients = recipe.ingredients || [];
  const steps = recipe.steps || [];

  return (
    <div className="min-h-screen pt-24 pb-20 bg-[#FAFAFA] dark:bg-[#121212]">
      <div className="container max-w-5xl">

        {/* Top bar: back link + owner actions */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/community" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#FF6B00] transition-colors font-medium">
            <ArrowLeft className="w-5 h-5" />
            Back to Community
          </Link>

          {/* Edit / Delete — owner only */}
          {isOwner && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleEdit}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:border-[#FF6B00] hover:text-[#FF6B00] transition-all"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:border-red-500 hover:text-red-500 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Media Gallery Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="space-y-4">
            {recipe.image_urls && recipe.image_urls.length > 0 ? (
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-sm relative group">
                <img src={recipe.image_urls[0]} alt={recipe.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
            ) : (
              <div className="aspect-[4/3] rounded-3xl bg-orange-50 dark:bg-orange-900/20 flex flex-col items-center justify-center">
                <ChefHat className="w-20 h-20 text-orange-200 dark:text-orange-800 mb-4" />
                <span className="text-orange-400 font-medium">No images available</span>
              </div>
            )}

            {recipe.image_urls && recipe.image_urls.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {recipe.image_urls.slice(1).map((url: string, i: number) => (
                  <div key={i} className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              {recipe.difficulty && (
                <span className="px-3 py-1 bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-full text-xs font-bold text-gray-900 dark:text-white shadow-sm uppercase tracking-wider">
                  {recipe.difficulty}
                </span>
              )}
              {recipe.cuisine && (
                <span className="px-3 py-1 bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-full text-xs font-bold text-gray-900 dark:text-white shadow-sm uppercase tracking-wider">
                  {recipe.cuisine}
                </span>
              )}
            </div>

            <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
              {recipe.title}
            </h1>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                {recipe.profiles?.full_name?.[0] || 'U'}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{recipe.profiles?.full_name || 'Unknown Chef'}</p>
                <p className="text-xs text-gray-500">Shared on {new Date(recipe.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {recipe.description && (
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 leading-relaxed">
                {recipe.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="flex items-center gap-2 bg-white dark:bg-[#1E1E1E] px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Prep Time</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{recipe.prep_time || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setCookItOpen(true)}
                className="flex-1 min-w-[140px] px-6 py-4 bg-[#FF6B00] text-white rounded-2xl font-bold hover:bg-[#E56000] transition-colors shadow-orange hover:-translate-y-0.5 text-center"
              >
                Cook It
              </button>
              <button
                onClick={() => setOrderItOpen(true)}
                className="flex-1 min-w-[140px] px-6 py-4 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-2xl font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm hover:-translate-y-0.5 text-center"
              >
                Order It
              </button>

              <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <button onClick={handleLike} className={`w-12 h-12 flex items-center justify-center rounded-2xl border transition-colors ${isLiked ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white dark:bg-[#1E1E1E] border-gray-100 dark:border-gray-800 text-gray-500 hover:text-red-500 hover:border-red-200'}`}>
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                </button>
                <button onClick={handleSave} className={`w-12 h-12 flex items-center justify-center rounded-2xl border transition-colors ${isSaved ? 'bg-[#FF6B00]/10 border-[#FF6B00]/20 text-[#FF6B00]' : 'bg-white dark:bg-[#1E1E1E] border-gray-100 dark:border-gray-800 text-gray-500 hover:text-[#FF6B00] hover:border-[#FF6B00]/20'}`}>
                  <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                </button>
                <button onClick={handleShare} className="w-12 h-12 flex items-center justify-center rounded-2xl border bg-white dark:bg-[#1E1E1E] border-gray-100 dark:border-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Ingredients */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#1E1E1E] p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-[#2A2A2A] sticky top-24">
              <h3 className="font-serif text-2xl font-bold mb-6 text-gray-900 dark:text-white">Ingredients</h3>
              {ingredients.length > 0 ? (
                <ul className="space-y-4">
                  {ingredients.map((ing: any, i: number) => (
                    <li key={i} className="flex items-center gap-3 pb-4 border-b border-gray-50 dark:border-gray-800 last:border-0 last:pb-0">
                      <div className="w-2 h-2 rounded-full bg-[#FF6B00]"></div>
                      <span className="flex-1 font-medium text-gray-900 dark:text-white">{ing.name}</span>
                      <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">
                        {ing.quantity} {ing.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">No ingredients listed.</p>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-[#1E1E1E] p-6 md:p-10 rounded-3xl border border-gray-100 dark:border-[#2A2A2A]">
              <h3 className="font-serif text-2xl font-bold mb-8 text-gray-900 dark:text-white">Instructions</h3>
              {steps.length > 0 ? (
                <div className="space-y-10">
                  {steps.map((step: any, i: number) => (
                    <div key={i} className="relative pl-10">
                      <div className="absolute left-0 top-0 w-8 h-8 bg-orange-100 dark:bg-orange-900/30 text-[#FF6B00] rounded-full flex items-center justify-center font-bold text-sm shadow-sm -ml-2">
                        {i + 1}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed pt-1 text-lg">
                        {step.instruction}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No instructions listed.</p>
              )}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="max-w-3xl">
          <h3 className="font-serif text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Comments ({comments.length})
          </h3>

          <form onSubmit={handleAddComment} className="mb-10 flex gap-4">
            <div className="w-10 h-10 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
              {user ? user.email?.[0].toUpperCase() : '?'}
            </div>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder={user ? "Add a comment..." : "Sign in to comment..."}
                disabled={!user}
                className="flex-1 px-4 py-3 bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-800 rounded-xl text-text-primary dark:text-white placeholder:text-text-muted dark:placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF6B00] disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!user || !newComment.trim()}
                className="px-6 py-3 bg-[#FF6B00] text-white rounded-xl font-bold hover:bg-[#E56000] disabled:opacity-50 transition-colors"
              >
                Post
              </button>
            </div>
          </form>

          <div className="space-y-6">
            {comments.map((comment: any, i: number) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 flex-shrink-0 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                  {comment.profiles?.full_name?.[0] || 'U'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900 dark:text-white">{comment.profiles?.full_name || 'User'}</span>
                    <span className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1E1E1E] p-4 rounded-2xl rounded-tl-none border border-gray-100 dark:border-[#2A2A2A] inline-block shadow-sm">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CookItModal
        open={cookItOpen}
        onOpenChange={setCookItOpen}
        recipeTitle={recipe.title}
      />

      <OrderItModal
        open={orderItOpen}
        onOpenChange={setOrderItOpen}
        foodItem={matchingFoodItem}
        recipeTitle={recipe.title}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-2xl border border-gray-100 dark:border-[#2A2A2A] p-8 max-w-sm w-full text-center"
            >
              <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Recipe?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                This will permanently delete <span className="font-semibold text-gray-700 dark:text-gray-200">"{recipe.title}"</span> and all its comments. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-5 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  {deleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

  );
}
