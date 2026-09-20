'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  ChefHat, Plus, Trash2, UploadCloud, X, Loader2, Pencil, 
  ChevronRight, ChevronLeft, Check, Image as ImageIcon,
  Clock, Flame, Utensils, Sparkles, BookOpen, GripVertical, CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';

// --- Types ---
type Ingredient = { id: string; name: string; quantity: string; unit: string; };
type Step = { id: string; instruction: string; };

const SPICE_LEVELS = ['None', 'Mild', 'Medium', 'Spicy', 'Extra Spicy'];
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'];
const OCCASIONS = ['Festival', 'Party', 'Family Dinner', 'Quick Meal', 'Healthy', 'Kids Friendly', 'Veg', 'Non Veg', 'Vegan'];

// --- Helper Components ---
const ProgressBar = ({ step, total }: { step: number; total: number }) => {
  return (
    <div className="flex items-center justify-center w-full max-w-2xl mx-auto mb-12">
      {Array.from({ length: total }).map((_, i) => {
        const isCompleted = step > i + 1;
        const isCurrent = step === i + 1;
        return (
          <React.Fragment key={i}>
            <div className="relative flex items-center justify-center">
              <motion.div 
                initial={false}
                animate={{
                  backgroundColor: isCompleted || isCurrent ? '#FF6B00' : 'transparent',
                  borderColor: isCompleted || isCurrent ? '#FF6B00' : '#D4C8BC',
                  scale: isCurrent ? 1.1 : 1
                }}
                className="w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 bg-white dark:bg-[#171311] transition-colors duration-500"
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <span className={`text-xs font-bold ${isCurrent ? 'text-white' : 'text-[#A09488]'}`}>
                    {i + 1}
                  </span>
                )}
              </motion.div>
            </div>
            {i < total - 1 && (
              <div className="flex-1 h-1 bg-[#EAE2D9] dark:bg-[#2A231F] mx-2 rounded-full overflow-hidden">
                <motion.div 
                  initial={false}
                  animate={{ width: isCompleted ? '100%' : '0%' }}
                  className="h-full bg-[#FF6B00]"
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ==========================================
// MAIN PAGE COMPONENT
// ==========================================
export default function AddRecipeWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const editId = searchParams.get('edit');

  // Wizard State
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form Data
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [cuisine, setCuisine] = useState('');
  
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ id: crypto.randomUUID(), name: '', quantity: '', unit: '' }]);
  const [steps, setSteps] = useState<Step[]>([{ id: crypto.randomUUID(), instruction: '' }]);
  
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  
  const [tags, setTags] = useState<string[]>([]);
  const [spiceLevel, setSpiceLevel] = useState('');
  const [mealType, setMealType] = useState('');

  // Load Data for Editing
  useEffect(() => {
    if (!editId) return;
    try {
      const stored = JSON.parse(localStorage.getItem('community_recipes') || '[]');
      const recipe = stored.find((r: any) => r.id === editId);
      if (recipe) {
        setTitle(recipe.title || '');
        setDescription(recipe.description || '');
        setPrepTime(recipe.prep_time || '');
        setDifficulty(recipe.difficulty || 'Medium');
        setCuisine(recipe.cuisine || '');
        
        if (recipe.ingredients?.length) {
          setIngredients(recipe.ingredients.map((i: any) => ({ ...i, id: crypto.randomUUID() })));
        }
        if (recipe.steps?.length) {
          setSteps(recipe.steps.map((s: any) => ({ ...s, id: crypto.randomUUID() })));
        }
        
        setExistingImageUrls(recipe.image_urls || []);
        setTags(recipe.tags || []);
        setSpiceLevel(recipe.spice_level || '');
        setMealType(recipe.meal_type || '');
      } else {
        toast.error('Recipe not found');
        router.push('/community');
      }
    } catch (e) {
      console.error(e);
    }
  }, [editId]);

  // Submit Handler
  const handleSubmit = async () => {
    if (!user) return toast.error('You must be logged in.');
    if (!title) return toast.error('Recipe name is required!');
    
    setLoading(true);

    try {
      const fileToDataUrl = (file: File): Promise<string> => new Promise(res => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result as string);
        reader.readAsDataURL(file);
      });

      const imageUrls = [...existingImageUrls];
      for (const file of imageFiles) imageUrls.push(await fileToDataUrl(file));

      const validIngredients = ingredients.filter(i => i.name).map(({id, ...rest}) => rest);
      const validSteps = steps.filter(s => s.instruction).map(({id, ...rest}) => rest);

      const finalTags = [...tags];
      if (spiceLevel) finalTags.push(spiceLevel);
      if (mealType) finalTags.push(mealType);

      const stored = JSON.parse(localStorage.getItem('community_recipes') || '[]');
      
      if (editId) {
        const updated = stored.map((r: any) => r.id === editId ? {
          ...r, title, description, prep_time: prepTime, difficulty, cuisine,
          tags: finalTags, image_urls: imageUrls, ingredients: validIngredients, steps: validSteps,
          spice_level: spiceLevel, meal_type: mealType, updated_at: new Date().toISOString()
        } : r);
        localStorage.setItem('community_recipes', JSON.stringify(updated));
      } else {
        const newRecipe = {
          id: crypto.randomUUID(), user_id: user.id, title, description,
          prep_time: prepTime, difficulty, cuisine, tags: finalTags, image_urls: imageUrls,
          ingredients: validIngredients, steps: validSteps,
          spice_level: spiceLevel, meal_type: mealType,
          is_approved: true, likes_count: 0, comments_count: 0, created_at: new Date().toISOString(),
          profiles: { full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Chef', avatar_url: user.user_metadata?.avatar_url || null }
        };
        stored.unshift(newRecipe);
        localStorage.setItem('community_recipes', JSON.stringify(stored));
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push('/community');
      }, 3500);

    } catch (error: any) {
      toast.error('Failed to submit recipe');
    } finally {
      setLoading(false);
    }
  };

  // Auth Check
  if (!user) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-[#FFF8F1] dark:bg-[#171311]">
        <div className="text-center p-8 bg-white/60 dark:bg-black/20 rounded-3xl shadow-xl backdrop-blur-md border border-white/40 dark:border-white/5">
          <ChefHat className="w-16 h-16 mx-auto text-[#FF6B00] mb-4" />
          <h2 className="text-2xl font-serif font-bold mb-4 text-[#4A3B32] dark:text-[#E8DFD5]">Please sign in</h2>
          <p className="text-[#8C7A6B] mb-6">You need to be logged in to share a masterpiece.</p>
          <Link href="/auth/login" className="px-6 py-3 bg-[#FF6B00] text-white rounded-xl font-bold shadow-orange hover:-translate-y-1 transition-all">Sign In</Link>
        </div>
      </div>
    );
  }

  // Success State
  if (isSuccess) {
    return (
      <div className="min-h-screen pt-24 pb-20 bg-[#FFF8F1] dark:bg-[#171311] flex flex-col items-center justify-center overflow-hidden">
        {/* Confetti */}
        <div className="absolute inset-0 pointer-events-none flex justify-center overflow-hidden opacity-60">
           {Array.from({length: 50}).map((_, i) => (
             <motion.div
               key={i}
               initial={{ y: -100, x: (Math.random() - 0.5) * 800, rotate: 0 }}
               animate={{ y: '100vh', rotate: 360 }}
               transition={{ duration: Math.random() * 2 + 2, repeat: Infinity, ease: 'linear' }}
               className="w-3 h-3 absolute"
               style={{ backgroundColor: ['#FF6B00', '#FF8C40', '#FFD166', '#06D6A0', '#EF476F'][Math.floor(Math.random() * 5)] }}
             />
           ))}
        </div>
        
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center z-10 bg-white/80 dark:bg-[#1E1916]/80 p-12 rounded-[32px] backdrop-blur-xl border border-white/50 dark:border-white/5 shadow-2xl"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] rounded-full flex items-center justify-center mx-auto mb-6 shadow-orange">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="font-serif text-4xl font-bold text-[#4A3B32] dark:text-[#E8DFD5] mb-4">
            Congratulations! 🎉
          </h1>
          <p className="text-[#8C7A6B] text-lg max-w-md mx-auto">
            Your recipe is now inspiring thousands of food lovers.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-[#FFF8F1] dark:bg-[#171311] text-[#4A3B32] dark:text-[#E8DFD5] transition-colors duration-500">
      <div className="container max-w-3xl relative z-10">
        
        <div className="flex items-center gap-4 mb-10">
          <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center bg-white/60 dark:bg-black/20 rounded-xl shadow-sm hover:bg-white dark:hover:bg-black/40 backdrop-blur-sm transition-all border border-white/40 dark:border-white/5">
            <X className="w-5 h-5" />
          </button>
          <h1 className="font-serif text-2xl md:text-3xl font-bold">
            {editId ? 'Refine your masterpiece' : 'Share a new masterpiece'}
          </h1>
        </div>

        <ProgressBar step={step} total={totalSteps} />

        <div className="bg-white/60 dark:bg-black/20 backdrop-blur-xl border border-white/40 dark:border-white/5 rounded-[32px] p-6 md:p-10 shadow-[0_8px_32px_rgba(74,59,50,0.05)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <Step1 
                key="step1" 
                data={{title, description, prepTime, difficulty, cuisine}} 
                update={(d: any) => {
                  if (d.title !== undefined) setTitle(d.title);
                  if (d.description !== undefined) setDescription(d.description);
                  if (d.prepTime !== undefined) setPrepTime(d.prepTime);
                  if (d.difficulty !== undefined) setDifficulty(d.difficulty);
                  if (d.cuisine !== undefined) setCuisine(d.cuisine);
                }} 
              />
            )}
            {step === 2 && (
              <Step2
                key="step2"
                imageFiles={imageFiles}
                setImageFiles={setImageFiles}
                existingImageUrls={existingImageUrls}
                setExistingImageUrls={setExistingImageUrls}
              />
            )}
            {step === 3 && (
              <Step3
                key="step3"
                ingredients={ingredients}
                setIngredients={setIngredients}
              />
            )}
            {step === 4 && (
              <Step4
                key="step4"
                steps={steps}
                setSteps={setSteps}
              />
            )}
            {step === 5 && (
              <Step5
                key="step5"
                tags={tags} setTags={setTags}
                spiceLevel={spiceLevel} setSpiceLevel={setSpiceLevel}
                mealType={mealType} setMealType={setMealType}
                recipeData={{title, prepTime, difficulty, imageFiles, existingImageUrls}}
              />
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="mt-12 flex items-center justify-between pt-6 border-t border-[#EAE2D9] dark:border-[#2A231F]">
            <button 
              onClick={() => setStep(s => Math.max(1, s - 1))}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-[#8C7A6B] hover:text-[#4A3B32] dark:hover:text-[#E8DFD5]'}`}
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </button>
            
            {step < totalSteps ? (
              <button 
                onClick={() => {
                  if (step === 1 && !title) return toast.error('Recipe name is required');
                  setStep(s => Math.min(totalSteps, s + 1));
                }}
                className="flex items-center gap-2 px-8 py-3.5 bg-[#4A3B32] dark:bg-[#E8DFD5] text-white dark:text-[#171311] rounded-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                Continue <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-10 py-3.5 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white rounded-xl font-bold shadow-orange hover:-translate-y-1 transition-all disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                Publish Recipe
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// ==========================================
// STEP 1: Basic Details
// ==========================================
const Step1 = ({ data, update }: any) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="text-center mb-10">
        <h2 className="font-serif text-3xl font-bold mb-3">Tell us about your masterpiece 🍲</h2>
        <p className="text-[#8C7A6B]">Every great dish has a name and a story.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-[#1E1916] p-4 md:p-5 rounded-2xl border border-[#EAE2D9] dark:border-[#2A231F] focus-within:border-[#FF6B00] transition-colors group shadow-sm">
          <label className="flex items-center gap-2 text-sm font-bold mb-2">
            <BookOpen className="w-4 h-4 text-[#FF6B00]" /> Recipe Name
          </label>
          <input 
            type="text" value={data.title} onChange={e => update({title: e.target.value})}
            placeholder="e.g. Grandma's Secret Chocolate Cake"
            className="w-full bg-transparent text-xl font-serif focus:outline-none text-text-primary dark:text-white placeholder:text-[#BCAEA3] dark:placeholder:text-[#9CA3AF]"
          />
          <p className="text-xs text-[#A09488] mt-2">Give it a catchy, descriptive title.</p>
        </div>

        <div className="bg-white dark:bg-[#1E1916] p-4 md:p-5 rounded-2xl border border-[#EAE2D9] dark:border-[#2A231F] focus-within:border-[#FF6B00] transition-colors group shadow-sm">
          <label className="flex items-center gap-2 text-sm font-bold mb-2">
            <Sparkles className="w-4 h-4 text-[#FF6B00]" /> The Story
          </label>
          <textarea 
            value={data.description} onChange={e => update({description: e.target.value})}
            placeholder="What makes this dish special? Where did you learn it?"
            className="w-full bg-transparent focus:outline-none text-text-primary dark:text-white placeholder:text-[#BCAEA3] dark:placeholder:text-[#9CA3AF] min-h-[100px] resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white dark:bg-[#1E1916] p-4 rounded-2xl border border-[#EAE2D9] dark:border-[#2A231F] focus-within:border-[#FF6B00] transition-colors shadow-sm">
            <label className="flex items-center gap-2 text-sm font-bold mb-2"><Clock className="w-4 h-4 text-[#FF6B00]" /> Time</label>
            <input type="text" value={data.prepTime} onChange={e => update({prepTime: e.target.value})} placeholder="e.g. 45 mins" className="w-full bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none" />
          </div>
          <div className="bg-white dark:bg-[#1E1916] p-4 rounded-2xl border border-[#EAE2D9] dark:border-[#2A231F] focus-within:border-[#FF6B00] transition-colors shadow-sm">
            <label className="flex items-center gap-2 text-sm font-bold mb-2"><Flame className="w-4 h-4 text-[#FF6B00]" /> Difficulty</label>
            <select value={data.difficulty} onChange={e => update({difficulty: e.target.value})} className="w-full bg-transparent text-text-primary focus:outline-none appearance-none">
              <option className="dark:bg-[#1E1916]">Easy</option>
              <option className="dark:bg-[#1E1916]">Medium</option>
              <option className="dark:bg-[#1E1916]">Hard</option>
            </select>
          </div>
          <div className="bg-white dark:bg-[#1E1916] p-4 rounded-2xl border border-[#EAE2D9] dark:border-[#2A231F] focus-within:border-[#FF6B00] transition-colors shadow-sm">
            <label className="flex items-center gap-2 text-sm font-bold mb-2"><Utensils className="w-4 h-4 text-[#FF6B00]" /> Cuisine</label>
            <input type="text" value={data.cuisine} onChange={e => update({cuisine: e.target.value})} placeholder="e.g. Italian" className="w-full bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ==========================================
// STEP 2: Photos
// ==========================================
const Step2 = ({ imageFiles, setImageFiles, existingImageUrls, setExistingImageUrls }: any) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 8 - (imageFiles.length + existingImageUrls.length),
    onDrop: (accepted) => {
      setImageFiles((prev: any) => [...prev, ...accepted]);
    }
  });

  const removeFile = (idx: number) => setImageFiles((prev: any) => prev.filter((_: any, i: number) => i !== idx));
  const removeExisting = (idx: number) => setExistingImageUrls((prev: any) => prev.filter((_: any, i: number) => i !== idx));

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
      <div className="text-center mb-10">
        <h2 className="font-serif text-3xl font-bold mb-3">Make it mouthwatering 📸</h2>
        <p className="text-[#8C7A6B]">People eat with their eyes first. Upload beautiful photos.</p>
      </div>

      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-300
          ${isDragActive ? 'border-[#FF6B00] bg-[#FF6B00]/5' : 'border-[#D4C8BC] dark:border-[#2A231F] hover:bg-white/40 dark:hover:bg-[#1E1916]/40 hover:border-[#FF6B00]/40'}`}
      >
        <input {...getInputProps()} />
        <div className="w-20 h-20 mx-auto mb-6 bg-white dark:bg-[#1E1916] rounded-full flex items-center justify-center shadow-sm border border-[#EAE2D9] dark:border-[#2A231F]">
          <UploadCloud className={`w-10 h-10 ${isDragActive ? 'text-[#FF6B00]' : 'text-[#A09488]'}`} />
        </div>
        <h3 className="text-xl font-bold mb-2">Drop your delicious photos here</h3>
        <p className="text-[#8C7A6B] text-sm">PNG, JPG up to 10MB. Maximum 8 photos.</p>
      </div>

      {(imageFiles.length > 0 || existingImageUrls.length > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {existingImageUrls.map((url: string, i: number) => (
            <div key={`ext-${i}`} className="relative aspect-square rounded-2xl overflow-hidden group border-2 border-transparent">
              <img src={url} alt="Recipe" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <button type="button" onClick={() => removeExisting(i)} className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-red-500 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all"><X className="w-4 h-4"/></button>
              {i === 0 && <div className="absolute bottom-2 left-2 bg-[#FF6B00] text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase">Cover</div>}
            </div>
          ))}
          {imageFiles.map((f: File, i: number) => (
            <div key={`file-${i}`} className="relative aspect-square rounded-2xl overflow-hidden group border-2 border-transparent">
              <img src={URL.createObjectURL(f)} alt="Recipe" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <button type="button" onClick={() => removeFile(i)} className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-red-500 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all"><X className="w-4 h-4"/></button>
              {existingImageUrls.length === 0 && i === 0 && <div className="absolute bottom-2 left-2 bg-[#FF6B00] text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase">Cover</div>}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// ==========================================
// STEP 3: Ingredients
// ==========================================
const Step3 = ({ ingredients, setIngredients }: any) => {
  const handleAdd = () => setIngredients([...ingredients, { id: crypto.randomUUID(), name: '', quantity: '', unit: '' }]);
  const handleRemove = (id: string) => setIngredients(ingredients.filter((i: any) => i.id !== id));
  const handleChange = (id: string, field: string, val: string) => {
    setIngredients(ingredients.map((i: any) => i.id === id ? { ...i, [field]: val } : i));
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
      <div className="text-center mb-10">
        <h2 className="font-serif text-3xl font-bold mb-3">What do we need? 🥕</h2>
        <p className="text-[#8C7A6B]">List your ingredients precisely.</p>
      </div>

      <div className="space-y-3">
        <Reorder.Group axis="y" values={ingredients} onReorder={setIngredients} className="space-y-3">
          {ingredients.map((ing: any) => (
            <Reorder.Item key={ing.id} value={ing} className="bg-white dark:bg-[#1E1916] flex items-center gap-3 p-3 rounded-2xl shadow-sm border border-[#EAE2D9] dark:border-[#2A231F] group">
              <div className="cursor-grab text-[#D4C8BC] hover:text-[#FF6B00] p-1"><GripVertical className="w-5 h-5" /></div>
              <input type="text" placeholder="Quantity (2)" value={ing.quantity} onChange={e => handleChange(ing.id, 'quantity', e.target.value)} className="w-20 bg-transparent focus:outline-none text-text-primary dark:text-white placeholder:text-[#BCAEA3] dark:placeholder:text-[#9CA3AF] font-semibold text-center border-r border-[#EAE2D9] dark:border-[#2A231F]" />
              <input type="text" placeholder="Unit (cups)" value={ing.unit} onChange={e => handleChange(ing.id, 'unit', e.target.value)} className="w-24 bg-transparent focus:outline-none text-text-primary dark:text-white placeholder:text-[#BCAEA3] dark:placeholder:text-[#9CA3AF] font-semibold text-center border-r border-[#EAE2D9] dark:border-[#2A231F]" />
              <input type="text" placeholder="Ingredient (Carrots)" value={ing.name} onChange={e => handleChange(ing.id, 'name', e.target.value)} className="flex-1 bg-transparent text-text-primary dark:text-white placeholder:text-[#BCAEA3] dark:placeholder:text-[#9CA3AF] focus:outline-none font-medium px-2" />
              {ingredients.length > 1 && (
                <button onClick={() => handleRemove(ing.id)} className="text-[#D4C8BC] hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
              )}
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>

      <button onClick={handleAdd} className="mt-4 flex items-center justify-center w-full py-4 rounded-2xl border-2 border-dashed border-[#D4C8BC] dark:border-[#2A231F] text-[#8C7A6B] font-bold hover:border-[#FF6B00] hover:text-[#FF6B00] hover:bg-white/50 dark:hover:bg-[#1E1916]/50 transition-all">
        <Plus className="w-5 h-5 mr-2" /> Add Ingredient
      </button>
    </motion.div>
  );
};

// ==========================================
// STEP 4: Cooking Steps
// ==========================================
const Step4 = ({ steps, setSteps }: any) => {
  const handleAdd = () => setSteps([...steps, { id: crypto.randomUUID(), instruction: '' }]);
  const handleRemove = (id: string) => setSteps(steps.filter((s: any) => s.id !== id));
  const handleChange = (id: string, val: string) => setSteps(steps.map((s: any) => s.id === id ? { ...s, instruction: val } : s));

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
      <div className="text-center mb-10">
        <h2 className="font-serif text-3xl font-bold mb-3">Time to cook 🍳</h2>
        <p className="text-[#8C7A6B]">Guide others through your magical process.</p>
      </div>

      <div className="relative space-y-6 before:absolute before:inset-y-0 before:left-[23px] before:w-[2px] before:bg-gradient-to-b before:from-[#FF6B00]/20 before:to-transparent">
        <Reorder.Group axis="y" values={steps} onReorder={setSteps} className="space-y-6">
          {steps.map((step: any, index: number) => (
            <Reorder.Item key={step.id} value={step} className="relative flex gap-4 group">
              <div className="relative z-10 w-12 h-12 flex-shrink-0 bg-white dark:bg-[#171311] border-2 border-[#FF6B00] text-[#FF6B00] rounded-full flex items-center justify-center font-bold shadow-md cursor-grab">
                {index + 1}
              </div>
              <div className="flex-1 bg-white dark:bg-[#1E1916] p-4 md:p-5 rounded-2xl shadow-sm border border-[#EAE2D9] dark:border-[#2A231F] focus-within:border-[#FF6B00] transition-colors relative">
                <textarea 
                  value={step.instruction} 
                  onChange={e => handleChange(step.id, e.target.value)}
                  placeholder="What happens in this step?"
                  className="w-full bg-transparent text-text-primary dark:text-white focus:outline-none min-h-[80px] resize-none placeholder:text-[#BCAEA3] dark:placeholder:text-[#9CA3AF]"
                />
                {steps.length > 1 && (
                  <button onClick={() => handleRemove(step.id)} className="absolute top-4 right-4 text-[#D4C8BC] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                )}
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>

      <button onClick={handleAdd} className="mt-8 flex items-center justify-center w-full py-4 rounded-2xl border-2 border-dashed border-[#D4C8BC] dark:border-[#2A231F] text-[#8C7A6B] font-bold hover:border-[#FF6B00] hover:text-[#FF6B00] hover:bg-white/50 dark:hover:bg-[#1E1916]/50 transition-all">
        <Plus className="w-5 h-5 mr-2" /> Add Next Step
      </button>
    </motion.div>
  );
};

// ==========================================
// STEP 5: Details & Preview
// ==========================================
const Step5 = ({ tags, setTags, spiceLevel, setSpiceLevel, mealType, setMealType, recipeData }: any) => {
  const [tagInput, setTagInput] = useState('');
  
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  const removeTag = (t: string) => setTags(tags.filter((x: string) => x !== t));

  const coverImage = recipeData.existingImageUrls[0] || (recipeData.imageFiles[0] ? URL.createObjectURL(recipeData.imageFiles[0]) : null);

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <div className="text-center mb-10">
        <h2 className="font-serif text-3xl font-bold mb-3">Final touches 🎨</h2>
        <p className="text-[#8C7A6B]">Categorize your recipe so others can find it.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-8">
          <div>
            <label className="block font-bold mb-3">Spice Level 🌶️</label>
            <div className="flex flex-wrap gap-2">
              {SPICE_LEVELS.map(lvl => (
                <button key={lvl} onClick={() => setSpiceLevel(lvl)} className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${spiceLevel === lvl ? 'bg-[#FF6B00] text-white border-[#FF6B00] shadow-orange' : 'bg-white dark:bg-[#1E1916] text-[#8C7A6B] border-[#EAE2D9] dark:border-[#2A231F] hover:border-[#FF6B00]/40'}`}>
                  {lvl}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block font-bold mb-3">Meal Type</label>
            <div className="flex flex-wrap gap-2">
              {MEAL_TYPES.map(type => (
                <button key={type} onClick={() => setMealType(type)} className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${mealType === type ? 'bg-[#FF6B00] text-white border-[#FF6B00] shadow-orange' : 'bg-white dark:bg-[#1E1916] text-[#8C7A6B] border-[#EAE2D9] dark:border-[#2A231F] hover:border-[#FF6B00]/40'}`}>
                  {type}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block font-bold mb-3">Occasion / Diet</label>
            <div className="flex flex-wrap gap-2">
              {OCCASIONS.map(occ => {
                const isActive = tags.includes(occ);
                return (
                  <button key={occ} onClick={() => isActive ? removeTag(occ) : setTags([...tags, occ])} className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${isActive ? 'bg-[#FF6B00] text-white border-[#FF6B00] shadow-orange' : 'bg-white dark:bg-[#1E1916] text-[#8C7A6B] border-[#EAE2D9] dark:border-[#2A231F] hover:border-[#FF6B00]/40'}`}>
                    {occ}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
             <label className="block font-bold mb-3">Custom Tags (Press Enter)</label>
             <input type="text" value={tagInput} onChange={e=>setTagInput(e.target.value)} onKeyDown={handleAddTag} placeholder="e.g. Grandma, Secret" className="w-full bg-white dark:bg-[#1E1916] p-4 rounded-xl border border-[#EAE2D9] dark:border-[#2A231F] text-text-primary dark:text-white placeholder:text-text-muted dark:placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF6B00]" />
             <div className="flex flex-wrap gap-2 mt-3">
               {tags.filter((t: string) => !OCCASIONS.includes(t)).map((t: string) => (
                 <span key={t} className="px-3 py-1 bg-gray-200 dark:bg-gray-800 rounded-full text-xs flex items-center gap-1">{t} <button onClick={()=>removeTag(t)}><X className="w-3 h-3"/></button></span>
               ))}
             </div>
          </div>
        </div>

        {/* Live Preview Card */}
        <div>
          <label className="block font-bold mb-4">Preview</label>
          <div className="bg-white dark:bg-[#1E1916] rounded-[24px] overflow-hidden shadow-lg border border-[#EAE2D9] dark:border-[#2A231F]">
            <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 relative">
              {coverImage ? <img src={coverImage} alt="Cover" className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center text-[#BCAEA3]"><ImageIcon className="w-12 h-12 opacity-50" /></div>}
            </div>
            <div className="p-5">
              <h3 className="font-serif text-xl font-bold mb-2 truncate">{recipeData.title || 'Your Recipe Title'}</h3>
              <div className="flex items-center gap-4 text-xs font-semibold text-[#8C7A6B]">
                {recipeData.prepTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {recipeData.prepTime}</span>}
                <span className="flex items-center gap-1"><Flame className="w-3 h-3" /> {recipeData.difficulty}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
