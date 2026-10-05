import React, { useEffect, useState, useRef } from 'react';
import {
  Search,
  Plus,
  Camera,
  Trash2,
  Edit2,
  Sparkles,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Ring } from '../components/ui/Ring';
import { Chip } from '../components/ui/Chip';
import { Modal } from '../components/ui/Modal';
import { FoodResultCard } from '../components/ui/FoodResultCard';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { useWhyDrawer } from '../context/WhyDrawerContext';
import { useToast } from '../context/ToastContext';
import { services } from '../services/registry';
import { processPlateImage } from '../lib/imageUtils';
import { logNutritionWithBackend } from '../services/springBootApi';
import type {
  DailyNutritionLog,
  LoggedFoodEntry,
  FoodItem,
  UserProfile,
  FoodAIAnalysisResponse,
  FoodAIItemEstimate,
} from '../types';

export const NutritionPage: React.FC = () => {
  const { openDrawer } = useWhyDrawer();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dailyLog, setDailyLog] = useState<DailyNutritionLog | null>(null);
  const [recentFoods, setRecentFoods] = useState<FoodItem[]>([]);

  // Search & Log Food Modal
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [activeMealType, setActiveMealType] = useState<
    'breakfast' | 'lunch' | 'snacks' | 'dinner'
  >('lunch');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Custom food form
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customServing, setCustomServing] = useState('1 serving (100g)');
  const [customCalories, setCustomCalories] = useState<number>(150);
  const [customProtein, setCustomProtein] = useState<number>(10);
  const [customCarbs, setCustomCarbs] = useState<number>(20);
  const [customFat, setCustomFat] = useState<number>(3);

  // Edit logged entry modal
  const [editingEntry, setEditingEntry] = useState<LoggedFoodEntry | null>(null);
  const [editServings, setEditServings] = useState<number>(1);
  const [editGrams, setEditGrams] = useState<number>(100);

  // Food AI Photo State
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiResult, setAiResult] = useState<FoodAIAnalysisResponse | null>(null);
  const [photoWeightHint, setPhotoWeightHint] = useState<string>('');
  const [currentUploadedDataUrl, setCurrentUploadedDataUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const p = await services.profile.getProfile();
      setProfile(p);

      const log = await services.food.getDailyLog(todayStr);
      setDailyLog(log);

      const recent = await services.food.getRecentFoods(6);
      setRecentFoods(recent);

      const initialSearch = await services.food.searchFoods('');
      setSearchResults(initialSearch.slice(0, 15));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load nutrition log');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Search filter
  useEffect(() => {
    const runSearch = async () => {
      const cat = selectedCategory === 'all' ? undefined : selectedCategory;
      const res = await services.food.searchFoods(searchQuery, cat);
      setSearchResults(res.slice(0, 20));
    };
    runSearch();
  }, [searchQuery, selectedCategory]);

  const handleLogItem = async (food: FoodItem) => {
    const updated = await services.food.logFood(
      {
        mealType: activeMealType,
        foodId: food.id,
        name: food.name,
        servings: 1,
        totalGrams: food.servingGrams,
        calories: food.calories,
        proteinGrams: food.proteinGrams,
        carbGrams: food.carbGrams,
        fatGrams: food.fatGrams,
      },
      todayStr
    );
    setDailyLog(updated);
    setShowSearchModal(false);
    showToast(`Logged ${food.name} to ${activeMealType}.`, 'success');
  };

  const handleDeleteEntry = async (entryId: string) => {
    const updated = await services.food.deleteFood(entryId, todayStr);
    setDailyLog(updated);
    showToast('Entry removed.', 'info');
  };

  const handleSaveEditEntry = async () => {
    if (!editingEntry) return;
    const baseG = editingEntry.totalGrams || 100;
    const targetG = editGrams > 0 ? editGrams : Math.round(baseG * (editServings / (editingEntry.servings || 1)));
    const ratio = targetG / baseG;
    const updated = await services.food.updateFood(
      editingEntry.id,
      {
        servings: Math.round((targetG / (baseG / (editingEntry.servings || 1))) * 100) / 100,
        totalGrams: targetG,
        calories: Math.round(editingEntry.calories * ratio),
        proteinGrams: Math.round(editingEntry.proteinGrams * ratio * 10) / 10,
        carbGrams: Math.round(editingEntry.carbGrams * ratio * 10) / 10,
        fatGrams: Math.round(editingEntry.fatGrams * ratio * 10) / 10,
      },
      todayStr
    );
    setDailyLog(updated);
    logNutritionWithBackend(updated);
    setEditingEntry(null);
    showToast(`Updated to exactly ${targetG}g (${Math.round(editingEntry.calories * ratio)} kcal) and synced.`, 'success');
  };

  const handleSaveCustomFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newFood = await services.food.addCustomFood({
      name: customName,
      category: 'meal',
      servingUnit: customServing,
      servingGrams: 100,
      calories: customCalories,
      proteinGrams: customProtein,
      carbGrams: customCarbs,
      fatGrams: customFat,
    });

    await handleLogItem(newFood);
    setShowCustomModal(false);
    setCustomName('');
  };

  // Photo AI Workflow
  const handlePhotoUpload = async (file: File) => {
    setAiProcessing(true);
    setShowAIModal(true);
    setAiResult(null);

    try {
      // 1. Client-side resize to max 1024px & strip EXIF
      const processed = await processPlateImage(file);
      setCurrentUploadedDataUrl(processed.dataUrl);

      // 2. Call AI Vision service with optional weight hint
      const res = await services.ai.analyzeFood(processed.dataUrl, photoWeightHint);
      setAiResult(res);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Photo processing failed', 'error');
      setShowAIModal(false);
    } finally {
      setAiProcessing(false);
    }
  };

  const handleReAnalyzeWithWeight = async (customWeight: string) => {
    if (!currentUploadedDataUrl) return;
    setAiProcessing(true);
    setPhotoWeightHint(customWeight);
    try {
      const res = await services.ai.analyzeFood(currentUploadedDataUrl, customWeight);
      setAiResult(res);
      showToast(`Recalibrated plate analysis strictly for ${customWeight}.`, 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Photo re-analysis failed', 'error');
    } finally {
      setAiProcessing(false);
    }
  };

  const handleConfirmAIFood = async (
    items: FoodAIItemEstimate[],
    targetMeal: 'breakfast' | 'lunch' | 'snacks' | 'dinner'
  ) => {
    for (const item of items) {
      await services.food.logFood(
        {
          mealType: targetMeal,
          foodId: item.matched_food_id,
          name: item.name,
          servings: 1,
          totalGrams: item.estimated_grams,
          calories: item.calories,
          proteinGrams: item.proteinGrams,
          carbGrams: item.carbGrams,
          fatGrams: item.fatGrams,
        },
        todayStr
      );
    }
    const freshLog = await services.food.getDailyLog(todayStr);
    setDailyLog(freshLog);
    logNutritionWithBackend(freshLog);
    setShowAIModal(false);
    setAiResult(null);
    showToast(`Logged ${items.length} items from photo to ${targetMeal} and synced to Spring Boot.`, 'success');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="py-12 max-w-md mx-auto">
        <ErrorState
          title="Nutrition unavailable"
          message={error || 'Unable to load diary.'}
          onRetry={loadData}
        />
      </div>
    );
  }

  const assessment = services.assessment.calculateAssessment(profile);
  const targetCalories = assessment.goalCalories.value;
  const currentCalories = dailyLog?.totalCalories || 0;

  const targetProtein = assessment.macros.value.proteinGrams;
  const currentProtein = dailyLog?.totalProteinGrams || 0;

  const targetCarbs = assessment.macros.value.carbGrams;
  const currentCarbs = dailyLog?.totalCarbGrams || 0;

  const targetFat = assessment.macros.value.fatGrams;
  const currentFat = dailyLog?.totalFatGrams || 0;

  const meals = ['breakfast', 'lunch', 'snacks', 'dinner'] as const;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#FF6B1A] block mb-1">
            BIOENERGETIC DIARY
          </span>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-light text-[var(--text)] tracking-tight">
              Daily Nutrition & Fueling
            </h1>
            <Chip
              label="Why this?"
              variant="why"
              onClick={() =>
                openDrawer({
                  title: 'Daily Nutrition Targets',
                  valueDisplay: `${targetCalories} kcal`,
                  explanation: assessment.goalCalories.explanation,
                })
              }
            />
          </div>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Peer-reviewed macronutrient partitioning calibrated for {profile.goal.replace('_', ' ')}.
          </p>
        </div>

        {/* Action Buttons: Add by Photo & Custom Entry */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Hidden file input for Photo AI */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handlePhotoUpload(file);
              e.target.value = '';
            }}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-xs text-[#FF6B1A] border-[#FF6B1A]/30 hover:bg-[#FF6B1A]/10 cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Add by Photo</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setActiveMealType('lunch');
              setShowSearchModal(true);
            }}
            className="flex items-center gap-1.5 text-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Food</span>
          </Button>
        </div>
      </div>

      {/* Macro Overview Banner Card */}
      <Card variant="default" className="p-6 border-[var(--border)] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-4 flex items-center justify-center">
            <Ring
              value={currentCalories}
              target={targetCalories}
              size={135}
              strokeWidth={9}
              useCalorieGradient
              label="Remaining"
              sublabel={`${Math.max(0, targetCalories - currentCalories)} kcal`}
            />
          </div>

          <div className="md:col-span-8 space-y-3.5">
            {/* Protein */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-[#FF6B1A]">Protein Target</span>
                <span className="text-[var(--text)] tabular-nums font-semibold">
                  {currentProtein} / {targetProtein} g
                </span>
              </div>
              <div className="h-2 w-full bg-[var(--surface-2)] rounded-full overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, (currentProtein / targetProtein) * 100)}%` }}
                  className="h-full bg-[#FF6B1A] rounded-full transition-all duration-500"
                />
              </div>
            </div>

            {/* Carbs */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-[#FFB547]">Carbohydrates Target</span>
                <span className="text-[var(--text)] tabular-nums font-semibold">
                  {currentCarbs} / {targetCarbs} g
                </span>
              </div>
              <div className="h-2 w-full bg-[var(--surface-2)] rounded-full overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, (currentCarbs / targetCarbs) * 100)}%` }}
                  className="h-full bg-[#FFB547] rounded-full transition-all duration-500"
                />
              </div>
            </div>

            {/* Fat */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-[#D97706] dark:text-[#FFE3C4]">Dietary Fats Target</span>
                <span className="text-[var(--text)] tabular-nums font-semibold">
                  {currentFat} / {targetFat} g
                </span>
              </div>
              <div className="h-2 w-full bg-[var(--surface-2)] rounded-full overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, (currentFat / targetFat) * 100)}%` }}
                  className="h-full bg-[#FFE3C4] rounded-full transition-all duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Foods Quick-Tap Carousel */}
      {recentFoods.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] block">
            Frequent & Recent Items
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {recentFoods.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => handleLogItem(f)}
                className="px-3.5 py-2 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface)] border border-[var(--border)] text-xs whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer shrink-0 min-h-[44px]"
              >
                <Plus className="w-3.5 h-3.5 text-[#FF6B1A]" />
                <span className="font-medium text-[var(--text)]">{f.name}</span>
                <span className="text-[var(--muted)] tabular-nums">({f.calories} kcal)</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Meals Diary Sections */}
      <div className="space-y-4">
        {meals.map((meal) => {
          const mealEntries =
            dailyLog?.entries.filter((e) => e.mealType === meal) || [];
          const mealCalories = mealEntries.reduce((sum, e) => sum + e.calories, 0);

          return (
            <Card key={meal} variant="default" className="p-5 border-[var(--border)] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[var(--text)] capitalize">{meal}</h3>
                  <span className="text-xs text-[var(--muted)] tabular-nums font-mono">
                    {mealCalories} kcal
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveMealType(meal);
                    setShowSearchModal(true);
                  }}
                  className="p-1.5 rounded-lg text-xs font-semibold text-[#FF6B1A] hover:bg-[#FF6B1A]/10 transition-colors flex items-center gap-1 cursor-pointer min-h-[36px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Food</span>
                </button>
              </div>

              {/* Entries List */}
              {mealEntries.length === 0 ? (
                <p className="text-xs text-[var(--muted)] py-2 italic">
                  No foods logged for {meal} yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {mealEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-[var(--text)] block">
                          {entry.name}
                        </span>
                        <span className="text-[11px] text-[var(--muted)] tabular-nums">
                          {entry.totalGrams}g • {entry.proteinGrams}g P • {entry.carbGrams}g C • {entry.fatGrams}g F
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[var(--text)] tabular-nums">
                          {entry.calories} kcal
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingEntry(entry);
                            setEditServings(entry.servings || 1);
                            setEditGrams(entry.totalGrams || 100);
                          }}
                          className="p-1 text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
                          aria-label={`Edit ${entry.name}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="p-1 text-[var(--muted)] hover:text-red-500 transition-colors cursor-pointer"
                          aria-label={`Delete ${entry.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Search & Food Database Modal */}
      {showSearchModal && (
        <Modal
          isOpen={showSearchModal}
          onClose={() => setShowSearchModal(false)}
          title={`Log Food to ${activeMealType.toUpperCase()}`}
          description="Search over 120 verified Indian and international staples with transparent macro values."
        >
          <div className="space-y-4">
            {/* Meal Type Switcher */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-[var(--surface-2)] rounded-xl border border-[var(--border)]">
              {(['breakfast', 'lunch', 'snacks', 'dinner'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setActiveMealType(m)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer text-center min-h-[34px] ${
                    activeMealType === m
                      ? 'bg-[#FF6B1A] text-white font-bold shadow-sm'
                      : 'text-[var(--muted)] hover:text-[var(--text)]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-3.5" />
              <input
                type="text"
                autoFocus
                placeholder="Search roti, dal, chicken, paneer, oats, idli..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[var(--text)] focus:border-[#FF6B1A] focus:outline-none min-h-[44px]"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              {[
                { id: 'all', label: 'All' },
                { id: 'staple', label: 'Staples & Grains' },
                { id: 'protein', label: 'Proteins' },
                { id: 'dairy', label: 'Dairy & Curd' },
                { id: 'vegetable', label: 'Vegetables' },
                { id: 'fruit', label: 'Fruits' },
                { id: 'snack', label: 'Snacks' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer min-h-[32px] ${
                    selectedCategory === c.id
                      ? 'bg-[#FF6B1A] text-[#0F0B09] font-bold'
                      : 'bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)]'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Results List */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {searchResults.length === 0 ? (
                <div className="text-center py-6 text-xs text-[var(--muted)] space-y-2">
                  <p>No foods matched your query.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCustomName(searchQuery);
                      setShowSearchModal(false);
                      setShowCustomModal(true);
                    }}
                  >
                    + Create Custom Food Entry
                  </Button>
                </div>
              ) : (
                searchResults.map((food) => (
                  <div
                    key={food.id}
                    onClick={() => handleLogItem(food)}
                    className="p-3 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface)] border border-[var(--border)] flex items-center justify-between gap-3 text-xs transition-colors cursor-pointer group"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[var(--text)] group-hover:text-[#FF6B1A] transition-colors">
                          {food.name}
                        </span>
                        {food.isIndianStaple && (
                          <span className="text-[9px] font-bold text-amber-500 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded">
                            Indian
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[var(--muted)]">
                        {food.servingUnit} • {food.proteinGrams}g P • {food.carbGrams}g C • {food.fatGrams}g F
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-[var(--text)] tabular-nums block">
                        {food.calories} kcal
                      </span>
                      <span className="text-[10px] text-[var(--muted)] group-hover:text-[#FF6B1A]">
                        + Tap to log
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs">
              <span className="text-[var(--muted)]">Don't see your item?</span>
              <button
                type="button"
                onClick={() => {
                  setShowSearchModal(false);
                  setShowCustomModal(true);
                }}
                className="text-[#FF6B1A] hover:underline font-semibold cursor-pointer"
              >
                + Add Custom Food
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Custom Food Creation Modal */}
      {showCustomModal && (
        <Modal
          isOpen={showCustomModal}
          onClose={() => setShowCustomModal(false)}
          title="Create Custom Food Item"
          description="Define custom calories and macros. Persisted locally to your personal food database."
        >
          <form onSubmit={handleSaveCustomFood} className="space-y-4 text-xs">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] block mb-1">
                Item Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Grandma's Spiced Lentil Soup"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-2.5 text-sm text-[var(--text)] focus:border-[#FF6B1A] focus:outline-none min-h-[44px]"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] block mb-1">
                Serving Description
              </label>
              <input
                type="text"
                placeholder="e.g. 1 bowl (200g)"
                value={customServing}
                onChange={(e) => setCustomServing(e.target.value)}
                className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-2.5 text-sm text-[var(--text)] focus:border-[#FF6B1A] focus:outline-none min-h-[44px]"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-[var(--muted)] block mb-1">
                  Calories
                </label>
                <input
                  type="number"
                  min="0"
                  value={customCalories}
                  onChange={(e) => setCustomCalories(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg p-2 text-sm font-bold text-[var(--text)] tabular-nums text-center focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-[var(--muted)] block mb-1">
                  Protein (g)
                </label>
                <input
                  type="number"
                  min="0"
                  value={customProtein}
                  onChange={(e) => setCustomProtein(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg p-2 text-sm font-bold text-[var(--text)] tabular-nums text-center focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-[var(--muted)] block mb-1">
                  Carbs (g)
                </label>
                <input
                  type="number"
                  min="0"
                  value={customCarbs}
                  onChange={(e) => setCustomCarbs(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg p-2 text-sm font-bold text-[var(--text)] tabular-nums text-center focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-[var(--muted)] block mb-1">
                  Fat (g)
                </label>
                <input
                  type="number"
                  min="0"
                  value={customFat}
                  onChange={(e) => setCustomFat(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg p-2 text-sm font-bold text-[var(--text)] tabular-nums text-center focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border)]">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setShowCustomModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save & Log Item
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Logged Entry Modal */}
      {editingEntry && (
        <Modal
          isOpen={Boolean(editingEntry)}
          onClose={() => setEditingEntry(null)}
          title={`Edit ${editingEntry.name}`}
          description="Scale portions or fine-tune logged servings."
          footer={
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingEntry(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveEditEntry}
              >
                Update Entry
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            {/* Exact Gram Weight Input */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] block mb-1 flex items-center justify-between">
                <span>Exact Portion Weight (Grams)</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  1g Scale Precision
                </span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="2500"
                  step="1"
                  value={editGrams}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 0;
                    setEditGrams(val);
                    const base = editingEntry.totalGrams / (editingEntry.servings || 1);
                    if (base > 0) {
                      setEditServings(Math.round((val / base) * 100) / 100);
                    }
                  }}
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-lg font-bold text-[var(--text)] tabular-nums focus:border-[#FF6B1A] focus:outline-none min-h-[48px]"
                />
                <span className="text-sm font-bold text-[#FF6B1A] pr-1">g</span>
              </div>

              {/* Quick Weight Chips (including 90g!) */}
              <div className="flex items-center gap-1.5 flex-wrap pt-2 text-[10px]">
                {[50, 90, 100, 150, 200, 250].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setEditGrams(preset);
                      const base = editingEntry.totalGrams / (editingEntry.servings || 1);
                      if (base > 0) {
                        setEditServings(Math.round((preset / base) * 100) / 100);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      editGrams === preset
                        ? 'bg-[#FF6B1A] text-white font-bold shadow-sm'
                        : 'bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
                    }`}
                  >
                    {preset}g
                  </button>
                ))}
              </div>
            </div>

            {/* Servings Multiplier */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] block mb-1">
                Servings Multiplier
              </label>
              <input
                type="number"
                min="0.1"
                max="10"
                step="0.05"
                value={editServings}
                onChange={(e) => {
                  const s = parseFloat(e.target.value) || 1;
                  setEditServings(s);
                  const base = editingEntry.totalGrams / (editingEntry.servings || 1);
                  setEditGrams(Math.round(base * s));
                }}
                className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-sm font-bold text-[var(--text)] tabular-nums focus:border-[#FF6B1A] focus:outline-none min-h-[44px]"
              />
            </div>

            <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-between text-xs">
              <span className="text-[var(--muted)]">Adjusted Energy:</span>
              <span className="font-bold text-sm text-[#FF6B1A] tabular-nums">
                {Math.round((editingEntry.calories / (editingEntry.totalGrams || 100)) * editGrams)} kcal
              </span>
            </div>
          </div>
        </Modal>
      )}

      {/* Food AI Modal */}
      {showAIModal && (
        <Modal
          isOpen={showAIModal}
          onClose={() => {
            setShowAIModal(false);
            setAiResult(null);
          }}
          title="Food Vision AI Analysis"
          description="On-device plate analysis. Downscaled to 1024px and stripped of EXIF metadata before inference."
          maxWidth="lg"
        >
          {aiProcessing ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-[#FF6B1A]/20 border-t-[#FF6B1A] animate-spin" />
                <Sparkles className="w-6 h-6 text-[#FF6B1A] absolute inset-0 m-auto" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[var(--text)]">Segmenting Plate Ingredients...</h4>
                <p className="text-xs text-[var(--muted)] mt-1">
                  Calibrating macro densities and volumetric portion boundaries.
                </p>
              </div>
            </div>
          ) : aiResult ? (
            <div className="space-y-4">
              {currentUploadedDataUrl && (
                <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--muted)] font-medium">Scale Reading / Stated Weight:</span>
                    <input
                      type="text"
                      placeholder="e.g. 90g"
                      value={photoWeightHint}
                      onChange={(e) => setPhotoWeightHint(e.target.value)}
                      className="w-24 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-2.5 py-1 text-xs text-[var(--text)] font-mono focus:border-[#FF6B1A] focus:outline-none"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReAnalyzeWithWeight(photoWeightHint || '90g')}
                    className="text-[11px] py-1 px-3 h-auto self-start sm:self-auto cursor-pointer"
                  >
                    Recalibrate with Exact Weight
                  </Button>
                </div>
              )}
              <FoodResultCard
                initialResult={aiResult}
                onConfirm={handleConfirmAIFood}
                onCancel={() => {
                  setShowAIModal(false);
                  setAiResult(null);
                  setCurrentUploadedDataUrl(null);
                }}
                onAddMissingFood={() => {
                  setShowAIModal(false);
                  setShowSearchModal(true);
                }}
              />
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[var(--muted)]">
              No active plate result to display.
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};
