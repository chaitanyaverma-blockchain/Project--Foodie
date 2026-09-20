'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Plus, Minus, ShoppingCart } from 'lucide-react';
import type { FoodItem, FoodOptionValue, SelectedOption } from '@/types';
import { Dialog, DialogHeader, DialogBody, DialogFooter } from '@/components/ui/Dialog';
import { DietBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/context/CartContext';
import { formatPrice, getEffectivePrice, generateCartItemId } from '@/lib/utils';
import toast from 'react-hot-toast';

interface CustomizationModalProps {
  item: FoodItem;
  onClose: () => void;
}

export function CustomizationModal({ item, onClose }: CustomizationModalProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedValues, setSelectedValues] = useState<Record<string, string[]>>({});

  const effectiveBasePrice = getEffectivePrice(item.price, item.sale_price);

  // Calculate total price with modifiers
  const modifiersTotal = Object.values(selectedValues)
    .flat()
    .reduce((sum, valueId) => {
      let modifier = 0;
      item.food_options?.forEach((opt) => {
        const val = opt.food_option_values?.find((v) => v.id === valueId);
        if (val) modifier += val.price_modifier;
      });
      return sum + modifier;
    }, 0);

  const unitPrice = effectiveBasePrice + modifiersTotal;
  const totalPrice = unitPrice * quantity;

  const toggleValue = (optionId: string, valueId: string, isMultiple: boolean) => {
    setSelectedValues((prev) => {
      const current = prev[optionId] ?? [];
      if (isMultiple) {
        // Toggle
        if (current.includes(valueId)) {
          return { ...prev, [optionId]: current.filter((v) => v !== valueId) };
        }
        return { ...prev, [optionId]: [...current, valueId] };
      } else {
        // Single select (radio)
        if (current.includes(valueId)) return prev;
        return { ...prev, [optionId]: [valueId] };
      }
    });
  };

  const isValueSelected = (optionId: string, valueId: string) =>
    (selectedValues[optionId] ?? []).includes(valueId);

  // Check if required options are filled
  const canAdd = item.food_options?.every((opt) => {
    if (!opt.is_required) return true;
    return (selectedValues[opt.id]?.length ?? 0) > 0;
  }) ?? true;

  const handleAddToCart = () => {
    // Build selected options array
    const selected: SelectedOption[] = [];
    item.food_options?.forEach((opt) => {
      const valueIds = selectedValues[opt.id] ?? [];
      valueIds.forEach((vid) => {
        const val = opt.food_option_values?.find((v) => v.id === vid);
        if (val) {
          selected.push({
            option_id: opt.id,
            option_name: opt.name,
            value_id: val.id,
            value: val.value,
            price_modifier: val.price_modifier,
          });
        }
      });
    });

    addItem(
      {
        food_item_id: item.id,
        name: item.name,
        image_url: item.image_url,
        price: unitPrice,
        is_veg: item.is_veg,
        is_egg: item.is_egg,
        selected_options: selected,
      },
      quantity
    );

    toast.success(`${item.name} added to cart!`, { icon: '🛒' });
    onClose();
  };

  return (
    <Dialog open onClose={onClose} size="lg">
      {/* Hero Image */}
      <div className="relative h-56 bg-gray-100">
        {item.image_url ? (
          <Image src={item.image_url} alt={item.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-7xl">🍽️</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <DietBadge type={item.is_veg ? 'veg' : item.is_egg ? 'egg' : 'non-veg'} className="mb-2" />
          <h2 className="font-serif font-bold text-xl text-white">{item.name}</h2>
          <div className="flex items-center gap-3 text-white/80 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {item.rating.toFixed(1)}
            </div>
            {item.calories && <span>• {item.calories} kcal</span>}
          </div>
        </div>
        <button
          id="customization-close-btn"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors text-lg font-bold"
        >
          ×
        </button>
      </div>

      <DialogBody className="max-h-[50vh]">
        {/* Description */}
        {item.description && (
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">{item.description}</p>
        )}

        {/* Options */}
        {item.food_options && item.food_options.length > 0 && (
          <div className="space-y-6">
            {item.food_options.map((option) => (
              <div key={option.id}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-900">{option.name}</h4>
                  <div className="flex items-center gap-2">
                    {option.is_required && (
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                        Required
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {option.type === 'multiple' ? 'Multi-select' : 'Pick one'}
                    </span>
                  </div>
                </div>

                {/* Radio Pills (single) / Checkboxes (multiple) */}
                <div className="flex flex-wrap gap-2">
                  {option.food_option_values?.map((val) => {
                    const selected = isValueSelected(option.id, val.id);
                    const unavailable = !val.is_available;

                    return (
                      <motion.button
                        key={val.id}
                        id={`option-${val.id}`}
                        whileTap={unavailable ? {} : { scale: 0.95 }}
                        onClick={() => !unavailable && toggleValue(option.id, val.id, option.type === 'multiple')}
                        disabled={unavailable}
                        className={`relative px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                          unavailable
                            ? 'border-gray-100 text-gray-300 line-through cursor-not-allowed bg-gray-50'
                            : selected
                            ? 'border-[#FF6B00] bg-orange-50 text-[#FF6B00]'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {val.value}
                        {val.price_modifier !== 0 && (
                          <span className={`ml-1 text-xs ${selected ? 'text-orange-500' : 'text-gray-400'}`}>
                            +{formatPrice(val.price_modifier)}
                          </span>
                        )}
                        {selected && !unavailable && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#FF6B00] rounded-full text-white text-[9px] flex items-center justify-center font-black"
                          >
                            ✓
                          </motion.span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Validation hint */}
                {option.is_required && !(selectedValues[option.id]?.length) && (
                  <p className="text-xs text-amber-600 mt-2 font-medium">Please select {option.name}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogBody>

      <DialogFooter>
        <div className="flex items-center gap-4">
          {/* Quantity */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-9 h-9 border-2 border-gray-200 rounded-full flex items-center justify-center hover:border-[#FF6B00] transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-bold text-lg w-6 text-center tabular-nums">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-9 h-9 bg-[#FF6B00] text-white rounded-full flex items-center justify-center hover:bg-[#E56000] transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart */}
          <Button
            id="confirm-add-to-cart"
            onClick={handleAddToCart}
            disabled={!canAdd}
            fullWidth
            size="md"
            className="flex-1"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart · {formatPrice(totalPrice)}
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  );
}
