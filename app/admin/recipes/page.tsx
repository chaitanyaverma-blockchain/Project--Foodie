'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Recipe } from '@/types';
import { Check, X, Trash2, Star, Eye } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function AdminRecipesPage() {
  const supabase = createClient();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecipes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('recipes')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false });

    if (data) {
      setRecipes(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('recipes')
      .update({ is_approved: !currentStatus })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update approval status');
    } else {
      toast.success(currentStatus ? 'Recipe unapproved' : 'Recipe approved');
      setRecipes(recipes.map(r => r.id === id ? { ...r, is_approved: !currentStatus } : r));
    }
  };

  const toggleFeature = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('recipes')
      .update({ is_featured: !currentStatus })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update feature status');
    } else {
      toast.success(currentStatus ? 'Recipe unfeatured' : 'Recipe featured');
      setRecipes(recipes.map(r => r.id === id ? { ...r, is_featured: !currentStatus } : r));
    }
  };

  const deleteRecipe = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;
    
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete recipe');
    } else {
      toast.success('Recipe deleted');
      setRecipes(recipes.filter(r => r.id !== id));
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 font-serif">Recipe Community Management</h1>
        <p className="text-gray-500 text-sm">Approve new recipes, feature the best ones, and moderate community content.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Recipe</th>
                <th className="px-6 py-4">Creator</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Featured</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">Loading recipes...</td>
                </tr>
              ) : recipes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">No recipes found.</td>
                </tr>
              ) : (
                recipes.map(recipe => (
                  <tr key={recipe.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {recipe.image_urls?.[0] ? (
                            <img src={recipe.image_urls[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-orange-100" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 line-clamp-1">{recipe.title}</p>
                          <p className="text-xs text-gray-500">{recipe.cuisine || 'No cuisine'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {recipe.profiles?.full_name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleApproval(recipe.id, recipe.is_approved)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                          recipe.is_approved 
                            ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                            : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                        }`}
                      >
                        {recipe.is_approved ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {recipe.is_approved ? 'Approved' : 'Pending'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleFeature(recipe.id, recipe.is_featured)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                          recipe.is_featured 
                            ? 'bg-purple-50 text-purple-600 hover:bg-purple-100' 
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        <Star className={`w-3 h-3 ${recipe.is_featured ? 'fill-current' : ''}`} />
                        {recipe.is_featured ? 'Featured' : 'None'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(recipe.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/community/${recipe.id}`}
                          target="_blank"
                          className="p-1.5 text-gray-400 hover:text-[#FF6B00] bg-gray-50 hover:bg-orange-50 rounded-lg transition-colors"
                          title="View Recipe"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => deleteRecipe(recipe.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Recipe"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
