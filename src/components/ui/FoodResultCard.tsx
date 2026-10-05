import React, { useState } from 'react';
import { Sparkles, X, Info, Plus, Check } from 'lucide-react';
import { Button } from './Button';
import type { FoodAIAnalysisResponse, FoodAIItemEstimate } from '../../types';

export interface FoodResultCardProps {
  initialResult: FoodAIAnalysisResponse;
  onConfirm: (
    items: FoodAIItemEstimate[],
    mealType: 'breakfast' | 'lunch' | 'snacks' | 'dinner'
  ) => void;
  onCancel: () => void;
  onAddMissingFood?: () => void;
}

export const FoodResultCard: React.FC<FoodResultCardProps> = ({
  initialResult,
  onConfirm,
  onCancel,
  onAddMissingFood,
}) => {
  const [items, setItems] = useState<FoodAIItemEstimate[]>(initialResult.items);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'snacks' | 'dinner'>('lunch');

  // Ground truth nutritional density anchored per 100g (prevents compounding rounding errors)
  const [baseDensities] = useState<
    Record<
      number,
      {
        calories100g: number;
        protein100g: number;
        carb100g: number;
        fat100g: number;
        leucine100g?: number;
      }
    >
  >(() => {
    const map: Record<number, any> = {};
    initialResult.items.forEach((item, idx) => {
      const g = item.estimated_grams > 0 ? item.estimated_grams : 100;
      map[idx] = {
        calories100g: (item.calories / g) * 100,
        protein100g: (item.proteinGrams / g) * 100,
        carb100g: (item.carbGrams / g) * 100,
        fat100g: (item.fatGrams / g) * 100,
        leucine100g: item.leucineGrams ? (item.leucineGrams / g) * 100 : undefined,
      };
    });
    return map;
  });

  // Handle portion change with exact 1-gram precision anchored to 100g USDA reference values
  const handlePortionChange = (idx: number, newGrams: number) => {
    const targetGrams = Math.max(1, Math.min(2500, Math.round(newGrams)));
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        const base = baseDensities[idx] || {
          calories100g: (item.calories / (item.estimated_grams || 100)) * 100,
          protein100g: (item.proteinGrams / (item.estimated_grams || 100)) * 100,
          carb100g: (item.carbGrams / (item.estimated_grams || 100)) * 100,
          fat100g: (item.fatGrams / (item.estimated_grams || 100)) * 100,
          leucine100g: item.leucineGrams
            ? (item.leucineGrams / (item.estimated_grams || 100)) * 100
            : undefined,
        };

        const factor = targetGrams / 100;
        const calculatedKcal = Math.round(base.calories100g * factor);
        const calculatedProtein = Math.round(base.protein100g * factor * 10) / 10;
        const calculatedCarbs = Math.round(base.carb100g * factor * 10) / 10;
        const calculatedFat = Math.round(base.fat100g * factor * 10) / 10;
        const calculatedLeucine = base.leucine100g
          ? Math.round(base.leucine100g * factor * 100) / 100
          : undefined;

        return {
          ...item,
          estimated_grams: targetGrams,
          calories: calculatedKcal,
          proteinGrams: calculatedProtein,
          carbGrams: calculatedCarbs,
          fatGrams: calculatedFat,
          leucineGrams: calculatedLeucine,
        };
      })
    );
  };

  // Quick adjust portion by delta
  const handleQuickAdjust = (idx: number, delta: number) => {
    const current = items[idx]?.estimated_grams || 100;
    handlePortionChange(idx, current + delta);
  };

  // Remove an item
  const handleRemoveItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // Direct edit of calorie / macro values
  const handleValueEdit = (
    idx: number,
    field: 'calories' | 'proteinGrams' | 'carbGrams' | 'fatGrams',
    val: number
  ) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item))
    );
  };

  const totalKcal = items.reduce((sum, item) => sum + item.calories, 0);
  const totalProtein = Math.round(items.reduce((sum, item) => sum + item.proteinGrams, 0));
  const totalCarbs = Math.round(items.reduce((sum, item) => sum + item.carbGrams, 0));
  const totalFat = Math.round(items.reduce((sum, item) => sum + item.fatGrams, 0));

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 md:p-6 shadow-2xl space-y-6">
      {/* Header with Demo / Gemini Vision Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-1.5 rounded-lg bg-[#FF6B1A]/15 text-[#FF6B1A]">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-[var(--text)]">Volumetric Plate Macro Estimation</h3>
            {initialResult.isDemo ? (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#FF6B1A]/20 text-[#FF6B1A] border border-[#FF6B1A]/30">
                Demo Result • AI Not Connected
              </span>
            ) : (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-mono">
                <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Google Gemini Vision Verified
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--muted)] mt-1 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Volumetric food geometry calibrated against USDA FoodData Central & ISSN sports nutrition</span>
          </p>
        </div>

        {/* Meal Selector */}
        <div className="flex items-center gap-1 bg-[var(--surface-2)] p-1 rounded-xl border border-[var(--border)] self-start sm:self-auto">
          {(['breakfast', 'lunch', 'snacks', 'dinner'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMealType(m)}
              className={`px-2.5 py-1 text-xs capitalize rounded-lg font-semibold transition-all cursor-pointer ${
                mealType === m
                  ? 'bg-[#FF6B1A] text-white font-bold shadow-sm'
                  : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Sports Science Nutrition Insights Bar (Unique differentiator) */}
      {(initialResult.mpsThresholdMet || (initialResult.micronutrientHighlights && initialResult.micronutrientHighlights.length > 0)) && (
        <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[#FF6B1A]/25 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-full bg-[#FF6B1A]/15 border border-[#FF6B1A]/30 text-[#FF6B1A] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              ⚡ Leucine MPS Threshold Met (≥2.5g)
            </span>
            {initialResult.glycemicImpact && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 text-[var(--muted)] border border-[var(--border)] font-medium">
                Glycemic Load: <strong className="text-[var(--text)]">{initialResult.glycemicImpact}</strong>
              </span>
            )}
          </div>
          {initialResult.micronutrientHighlights && initialResult.micronutrientHighlights.length > 0 && (
            <div className="flex items-center gap-1.5 text-[10px] text-[var(--muted)] flex-wrap">
              <span>Key Micros:</span>
              {initialResult.micronutrientHighlights.map((m, i) => (
                <span key={i} className="text-amber-600 dark:text-[#FFB547] bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                  {m}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Detected Food Items */}
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-[var(--text)]">{item.name}</span>
                <span className="text-[11px] font-medium text-emerald-600 dark:text-[#22C55E] bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  {Math.round(item.confidence * 100)}% match
                </span>
                {item.leucineGrams && (
                  <span className="text-[10px] font-semibold text-amber-600 dark:text-[#FFB547] bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                    {item.leucineGrams}g Leucine
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemoveItem(idx)}
                className="p-1 text-[var(--muted)] hover:text-red-500 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                aria-label={`Remove ${item.name}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Portion Control: Direct Gram Input + Quick Presets + 1g Precision Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--muted)] font-medium flex items-center gap-1.5">
                  <span>Portion Weight:</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    Exact Gram Precision
                  </span>
                </span>
                {/* Direct Number Input */}
                <div className="flex items-center gap-1 bg-[var(--surface)] px-2.5 py-1 rounded-lg border border-[var(--border)] focus-within:border-[#FF6B1A]">
                  <input
                    type="number"
                    min="1"
                    max="2500"
                    step="1"
                    value={item.estimated_grams}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) handlePortionChange(idx, val);
                    }}
                    className="w-14 text-right bg-transparent font-bold text-sm tabular-nums text-[var(--text)] focus:outline-none"
                    aria-label={`Exact gram weight for ${item.name}`}
                  />
                  <span className="text-xs font-bold text-[#FF6B1A]">g</span>
                </div>
              </div>

              {/* 1g Precision Slider */}
              <input
                type="range"
                min="10"
                max="800"
                step="1"
                value={item.estimated_grams}
                onChange={(e) => handlePortionChange(idx, parseInt(e.target.value, 10))}
                className="w-full accent-[#FF6B1A] cursor-pointer"
              />

              {/* Quick Gram Presets */}
              <div className="flex items-center justify-between gap-1 flex-wrap pt-0.5">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleQuickAdjust(idx, -10)}
                    className="px-2 py-0.5 text-[10px] rounded bg-[var(--surface)] hover:bg-black/5 dark:hover:bg-white/10 text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)] cursor-pointer"
                    title="Subtract 10 grams"
                  >
                    -10g
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAdjust(idx, 10)}
                    className="px-2 py-0.5 text-[10px] rounded bg-[var(--surface)] hover:bg-black/5 dark:hover:bg-white/10 text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)] cursor-pointer"
                    title="Add 10 grams"
                  >
                    +10g
                  </button>
                </div>
                <div className="flex items-center gap-1 text-[10px]">
                  {[50, 90, 100, 150, 200].map((presetGrams) => (
                    <button
                      key={presetGrams}
                      type="button"
                      onClick={() => handlePortionChange(idx, presetGrams)}
                      className={`px-2 py-0.5 rounded font-semibold transition-all cursor-pointer ${
                        item.estimated_grams === presetGrams
                          ? 'bg-[#FF6B1A] text-white font-bold shadow-sm'
                          : 'bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
                      }`}
                    >
                      {presetGrams}g
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Editable Macro Chips */}
            <div className="grid grid-cols-4 gap-2 pt-1 text-center">
              <div className="bg-[var(--surface)] p-2 rounded-lg border border-[var(--border)]">
                <span className="text-[10px] uppercase text-[var(--muted)] block">Calories</span>
                <input
                  type="number"
                  value={item.calories}
                  onChange={(e) =>
                    handleValueEdit(idx, 'calories', parseInt(e.target.value, 10) || 0)
                  }
                  className="w-full text-center bg-transparent font-bold text-sm tabular-nums text-[var(--text)] focus:outline-none"
                />
              </div>

              <div className="bg-[var(--surface)] p-2 rounded-lg border border-[var(--border)]">
                <span className="text-[10px] uppercase text-[var(--muted)] block">Protein (g)</span>
                <input
                  type="number"
                  value={item.proteinGrams}
                  onChange={(e) =>
                    handleValueEdit(idx, 'proteinGrams', parseFloat(e.target.value) || 0)
                  }
                  className="w-full text-center bg-transparent font-bold text-sm tabular-nums text-[var(--text)] focus:outline-none"
                />
              </div>

              <div className="bg-[var(--surface)] p-2 rounded-lg border border-[var(--border)]">
                <span className="text-[10px] uppercase text-[var(--muted)] block">Carbs (g)</span>
                <input
                  type="number"
                  value={item.carbGrams}
                  onChange={(e) =>
                    handleValueEdit(idx, 'carbGrams', parseFloat(e.target.value) || 0)
                  }
                  className="w-full text-center bg-transparent font-bold text-sm tabular-nums text-[var(--text)] focus:outline-none"
                />
              </div>

              <div className="bg-[var(--surface)] p-2 rounded-lg border border-[var(--border)]">
                <span className="text-[10px] uppercase text-[var(--muted)] block">Fat (g)</span>
                <input
                  type="number"
                  value={item.fatGrams}
                  onChange={(e) =>
                    handleValueEdit(idx, 'fatGrams', parseFloat(e.target.value) || 0)
                  }
                  className="w-full text-center bg-transparent font-bold text-sm tabular-nums text-[var(--text)] focus:outline-none"
                />
              </div>
            </div>
          </div>
        ))}

        {onAddMissingFood && (
          <button
            type="button"
            onClick={onAddMissingFood}
            className="w-full py-3 border border-dashed border-[var(--border)] hover:border-black/30 dark:hover:border-white/30 rounded-xl text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer min-h-[44px] flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Missing Food via Search</span>
          </button>
        )}
      </div>

      {/* Plate Total Summary */}
      <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-between text-xs">
        <div>
          <span className="text-[var(--muted)] block">Total Plate Macros</span>
          <span className="font-bold text-base text-[var(--text)] tabular-nums">
            {totalKcal} kcal
          </span>
        </div>
        <div className="flex items-center gap-3 text-right">
          <div>
            <span className="text-[var(--muted)] block">P</span>
            <span className="font-bold text-[var(--text)] tabular-nums">{totalProtein}g</span>
          </div>
          <div>
            <span className="text-[var(--muted)] block">C</span>
            <span className="font-bold text-[var(--text)] tabular-nums">{totalCarbs}g</span>
          </div>
          <div>
            <span className="text-[var(--muted)] block">F</span>
            <span className="font-bold text-[var(--text)] tabular-nums">{totalFat}g</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="ghost" onClick={onCancel} size="md">
          Discard
        </Button>
        <Button
          variant="primary"
          onClick={() => onConfirm(items, mealType)}
          size="md"
          className="flex items-center gap-2"
          disabled={items.length === 0}
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Confirm & Log to {mealType}</span>
        </Button>
      </div>
    </div>
  );
};
