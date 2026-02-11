/**
 * Data Integration Service
 * Handles data synchronization between food logging, exercise logging, and dashboard/nutrition displays
 */

import { apiService } from './apiService';

export interface IntegratedFoodEntry {
  id: number;
  food: {
    id: number;
    name: string;
    caloriesPer100g: number;
    proteinPer100g: number;
    carbsPer100g: number;
    fatPer100g: number;
    fiberPer100g: number;
  };
  quantity: number;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  date: string;
}

export interface IntegratedExerciseEntry {
  id: number;
  exercise: {
    id: number;
    name: string;
    category: string;
    caloriesPerMinute: number;
    icon?: string;
  };
  duration: number;
  sets?: number;
  reps?: number;
  weight?: number;
  caloriesBurned: number;
  date: string;
}

export interface MealLimits {
  DESAYUNO: { min: number; max: number; target: number };
  ALMUERZO: { min: number; max: number; target: number };
  CENA: { min: number; max: number; target: number };
  SNACK: { min: number; max: number; target: number };
}

export interface DailyIntegratedData {
  date: string;
  foodEntries: IntegratedFoodEntry[];
  exerciseEntries: IntegratedExerciseEntry[];
  totalCaloriesConsumed: number;
  totalCaloriesBurned: number;
  netCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  mealBreakdown: {
    [mealType: string]: {
      entries: IntegratedFoodEntry[];
      calories: number;
      status: 'low' | 'good' | 'ok' | 'high';
      message: string;
    };
  };
  waterIntake: number;
}

class DataIntegrationService {
  private readonly MEAL_LIMITS: MealLimits = {
    DESAYUNO: { min: 300, max: 600, target: 450 },
    ALMUERZO: { min: 400, max: 800, target: 600 },
    CENA: { min: 300, max: 700, target: 500 },
    SNACK: { min: 50, max: 300, target: 150 }
  };

  private readonly STORAGE_KEYS = {
    FOOD_ENTRIES: 'fitlife_integrated_food_entries',
    EXERCISE_ENTRIES: 'fitlife_integrated_exercise_entries',
    WATER_INTAKE: 'fitlife_integrated_water_intake',
    // Legacy keys for migration
    LEGACY_FOOD_ENTRIES: 'fitlife_food_entries',
    LEGACY_EXERCISE_ENTRIES: 'fitlife_exercise_entries'
  };

  /**
   * Get integrated daily data combining API and local storage
   */
  async getDailyIntegratedData(date: string, userId?: number): Promise<DailyIntegratedData> {
    try {
      console.log('=== GET DAILY INTEGRATED DATA DEBUG ===');
      console.log('Date:', date);
      console.log('User ID:', userId);
      
      // Always start with local storage data (most reliable)
      let foodEntries: IntegratedFoodEntry[] = this.getLocalFoodEntries(date);
      let exerciseEntries: IntegratedExerciseEntry[] = this.getLocalExerciseEntries(date);
      let waterIntake = this.getLocalWaterIntake(date);

      console.log('Local data loaded:');
      console.log('- Food entries:', foodEntries.length);
      console.log('- Exercise entries:', exerciseEntries.length);
      console.log('- Water intake:', waterIntake);

      // Try to supplement with API data if user is authenticated
      if (userId) {
        try {
          console.log('Attempting to load API data...');
          
          // Get food data from API
          const nutritionResponse = await apiService.getDailyNutrition(date);
          if (nutritionResponse.data.meals && Object.keys(nutritionResponse.data.meals).length > 0) {
            console.log('API food data found, merging...');
            const apiFoodEntries: IntegratedFoodEntry[] = [];
            
            Object.entries(nutritionResponse.data.meals).forEach(([mealType, mealEntries]) => {
              if (Array.isArray(mealEntries)) {
                mealEntries.forEach((entry: any) => {
                  apiFoodEntries.push({
                    id: entry.id,
                    food: entry.food,
                    quantity: entry.quantity,
                    mealType: mealType,
                    calories: entry.calories,
                    protein: entry.protein || (entry.food.proteinPer100g * entry.quantity) / 100,
                    carbs: entry.carbs || (entry.food.carbsPer100g * entry.quantity) / 100,
                    fat: entry.fat || (entry.food.fatPer100g * entry.quantity) / 100,
                    fiber: entry.fiber || (entry.food.fiberPer100g * entry.quantity) / 100,
                    date: entry.date || date
                  });
                });
              }
            });
            
            // Merge API and local data (prefer API if available, otherwise use local)
            if (apiFoodEntries.length > 0) {
              foodEntries = apiFoodEntries;
              console.log('Using API food data:', apiFoodEntries.length, 'entries');
            }
          }

          // Get water intake from API
          const waterResponse = await apiService.getTodayWaterIntake();
          if (waterResponse.data > 0) {
            waterIntake = waterResponse.data;
            console.log('Using API water data:', waterResponse.data);
          }
        } catch (apiError) {
          console.warn('API data not available, using local storage only:', apiError);
        }
      }

      console.log('Final data before processing:');
      console.log('- Food entries:', foodEntries.length);
      console.log('- Exercise entries:', exerciseEntries.length);
      console.log('- Water intake:', waterIntake);
      console.log('======================================');

      return this.processIntegratedData(date, foodEntries, exerciseEntries, waterIntake);
    } catch (error) {
      console.error('Error getting integrated daily data:', error);
      // Return safe empty data structure
      return this.processIntegratedData(date, [], [], 0);
    }
  }

  /**
   * Add food entry with integration
   */
  async addFoodEntry(entry: Omit<IntegratedFoodEntry, 'id' | 'calories' | 'protein' | 'carbs' | 'fat' | 'fiber'>, userId?: number): Promise<void> {
    console.log('=== ADD FOOD ENTRY DEBUG ===');
    console.log('Entry data:', entry);
    console.log('User ID:', userId);
    
    try {
      // Calculate nutritional values
      const calories = (entry.food.caloriesPer100g * entry.quantity) / 100;
      const protein = (entry.food.proteinPer100g * entry.quantity) / 100;
      const carbs = (entry.food.carbsPer100g * entry.quantity) / 100;
      const fat = (entry.food.fatPer100g * entry.quantity) / 100;
      const fiber = (entry.food.fiberPer100g * entry.quantity) / 100;

      const fullEntry: IntegratedFoodEntry = {
        ...entry,
        id: Date.now(),
        calories,
        protein,
        carbs,
        fat,
        fiber
      };

      console.log('Full entry calculated:', fullEntry);

      // Try to save to API first
      if (userId) {
        try {
          console.log('Attempting to save to API...');
          await apiService.logFood({
            foodId: entry.food.id,
            quantity: entry.quantity,
            unit: 'g',
            mealType: entry.mealType,
            date: entry.date
          });
          console.log('Food entry saved to API successfully');
          return;
        } catch (apiError: any) {
          console.warn('Failed to save to API, using local storage:', apiError);
          console.warn('API Error details:', apiError.response?.data || apiError.message);
        }
      }

      // Fallback to local storage
      console.log('Saving to local storage...');
      this.saveLocalFoodEntry(fullEntry);
      console.log('Food entry saved to local storage successfully');
      console.log('============================');
    } catch (error) {
      console.error('Error in addFoodEntry:', error);
      throw error; // Re-throw so the UI can handle it
    }
  }

  /**
   * Add exercise entry with integration
   */
  async addExerciseEntry(entry: Omit<IntegratedExerciseEntry, 'id' | 'caloriesBurned'>, userId?: number): Promise<void> {
    console.log('=== ADD EXERCISE ENTRY DEBUG ===');
    console.log('Entry data:', entry);
    console.log('User ID:', userId);
    
    try {
      const caloriesBurned = entry.exercise.caloriesPerMinute * entry.duration;
      
      const fullEntry: IntegratedExerciseEntry = {
        ...entry,
        id: Date.now(),
        caloriesBurned
      };

      console.log('Full exercise entry calculated:', fullEntry);

      // TODO: Implement API integration for exercises
      // For now, save to local storage
      console.log('Saving exercise to local storage...');
      this.saveLocalExerciseEntry(fullEntry);
      console.log('Exercise entry saved to local storage successfully');
      console.log('===============================');
    } catch (error) {
      console.error('Error in addExerciseEntry:', error);
      throw error; // Re-throw so the UI can handle it
    }
  }

  /**
   * Update water intake with integration
   */
  async updateWaterIntake(glasses: number, date: string, userId?: number): Promise<void> {
    // Try to save to API first
    if (userId) {
      try {
        await apiService.logWaterIntake(glasses);
        console.log('Water intake saved to API successfully');
        return;
      } catch (apiError) {
        console.warn('Failed to save water to API, using local storage:', apiError);
      }
    }

    // Fallback to local storage
    this.saveLocalWaterIntake(glasses, date);
  }

  /**
   * Get meal status based on calories and limits
   */
  getMealStatus(mealType: string, calories: number): { status: 'low' | 'good' | 'ok' | 'high'; message: string; color: string } {
    const limits = this.MEAL_LIMITS[mealType as keyof MealLimits];
    if (!limits) return { status: 'ok', message: 'Sin límites', color: 'info' };
    
    if (calories < limits.min) return { status: 'low', message: 'Muy pocas calorías', color: 'warning' };
    if (calories > limits.max) return { status: 'high', message: 'Demasiadas calorías', color: 'error' };
    if (calories >= limits.min && calories <= limits.target + 50) return { status: 'good', message: 'Perfecto', color: 'success' };
    return { status: 'ok', message: 'Bien', color: 'info' };
  }

  /**
   * Delete food entry
   */
  async deleteFoodEntry(entryId: number, userId?: number): Promise<void> {
    // TODO: Implement API deletion
    // For now, delete from local storage
    this.deleteLocalFoodEntry(entryId);
  }

  /**
   * Delete exercise entry
   */
  async deleteExerciseEntry(entryId: number, userId?: number): Promise<void> {
    // TODO: Implement API deletion
    // For now, delete from local storage
    this.deleteLocalExerciseEntry(entryId);
  }

  // Private methods for local storage operations
  private getLocalFoodEntries(date: string): IntegratedFoodEntry[] {
    try {
      // First try to get from integrated storage
      let entries: IntegratedFoodEntry[] = [];
      const stored = localStorage.getItem(this.STORAGE_KEYS.FOOD_ENTRIES);
      if (stored) {
        const allEntries: IntegratedFoodEntry[] = JSON.parse(stored);
        entries = allEntries.filter(entry => entry.date === date);
      }

      // If no entries found, try to migrate from legacy storage
      if (entries.length === 0) {
        entries = this.migrateLegacyFoodEntries(date);
      }

      return entries;
    } catch (error) {
      console.error('Error reading local food entries:', error);
      return [];
    }
  }

  /**
   * Migrate legacy food entries from old "Agregar Comida" page
   */
  private migrateLegacyFoodEntries(date: string): IntegratedFoodEntry[] {
    try {
      const legacyStored = localStorage.getItem(this.STORAGE_KEYS.LEGACY_FOOD_ENTRIES);
      if (!legacyStored) return [];

      console.log('=== LEGACY MIGRATION DEBUG ===');
      console.log('Legacy storage found, attempting migration...');
      const legacyEntries = JSON.parse(legacyStored);
      console.log('Legacy entries count:', legacyEntries.length);
      
      const targetDate = new Date(date).toDateString();
      console.log('Target date for migration:', targetDate);
      
      // Convert legacy format to integrated format
      const migratedEntries: IntegratedFoodEntry[] = [];
      
      legacyEntries.forEach((entry: any, index: number) => {
        try {
          const entryDate = new Date(entry.createdAt).toDateString();
          console.log(`Entry ${index}: ${entry.food?.name}, Date: ${entryDate}, Target: ${targetDate}`);
          
          if (entryDate === targetDate) {
            const migratedEntry: IntegratedFoodEntry = {
              id: entry.id || Date.now() + index,
              food: {
                id: entry.food?.id || Date.now() + index,
                name: entry.food?.name || 'Alimento desconocido',
                caloriesPer100g: entry.food?.caloriesPer100g || 0,
                proteinPer100g: entry.food?.proteinPer100g || 0,
                carbsPer100g: entry.food?.carbsPer100g || 0,
                fatPer100g: entry.food?.fatPer100g || 0,
                fiberPer100g: entry.food?.fiberPer100g || 0
              },
              quantity: entry.quantity || 100,
              mealType: entry.mealType || 'SNACK',
              calories: entry.totalCalories || 0,
              protein: entry.totalProtein || 0,
              carbs: entry.totalCarbs || 0,
              fat: entry.totalFat || 0,
              fiber: (entry.food?.fiberPer100g || 0) * (entry.quantity || 100) / 100,
              date: entry.createdAt ? entry.createdAt.split('T')[0] : date
            };
            
            migratedEntries.push(migratedEntry);
            console.log(`Migrated entry: ${migratedEntry.food.name} - ${migratedEntry.calories} cal`);
          }
        } catch (entryError) {
          console.error(`Error migrating entry ${index}:`, entryError);
        }
      });

      // Save migrated entries to new format
      if (migratedEntries.length > 0) {
        const existingEntries = this.getAllLocalFoodEntries();
        
        // Avoid duplicates by checking IDs
        const existingIds = new Set(existingEntries.map(e => e.id));
        const newEntries = migratedEntries.filter(e => !existingIds.has(e.id));
        
        if (newEntries.length > 0) {
          const allEntries = [...existingEntries, ...newEntries];
          localStorage.setItem(this.STORAGE_KEYS.FOOD_ENTRIES, JSON.stringify(allEntries));
          console.log(`Migrated ${newEntries.length} new food entries from legacy storage`);
        } else {
          console.log('All legacy entries already migrated');
        }
      }

      console.log(`Migration complete: ${migratedEntries.length} entries for today`);
      console.log('==============================');
      return migratedEntries;
    } catch (error) {
      console.error('Error migrating legacy food entries:', error);
      return [];
    }
  }

  /**
   * Get all local food entries (helper for migration)
   */
  private getAllLocalFoodEntries(): IntegratedFoodEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.FOOD_ENTRIES);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading all local food entries:', error);
      return [];
    }
  }

  private getLocalExerciseEntries(date: string): IntegratedExerciseEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.EXERCISE_ENTRIES);
      if (!stored) return [];
      
      const allEntries: IntegratedExerciseEntry[] = JSON.parse(stored);
      const targetDate = new Date(date).toDateString();
      return allEntries.filter(entry => new Date(entry.date).toDateString() === targetDate);
    } catch (error) {
      console.error('Error reading local exercise entries:', error);
      return [];
    }
  }

  private getLocalWaterIntake(date: string): number {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.WATER_INTAKE);
      if (!stored) return 0;
      
      const waterData: { [date: string]: number } = JSON.parse(stored);
      return waterData[date] || 0;
    } catch (error) {
      console.error('Error reading local water intake:', error);
      return 0;
    }
  }

  private saveLocalFoodEntry(entry: IntegratedFoodEntry): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.FOOD_ENTRIES);
      const entries: IntegratedFoodEntry[] = stored ? JSON.parse(stored) : [];
      entries.push(entry);
      localStorage.setItem(this.STORAGE_KEYS.FOOD_ENTRIES, JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving local food entry:', error);
    }
  }

  private saveLocalExerciseEntry(entry: IntegratedExerciseEntry): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.EXERCISE_ENTRIES);
      const entries: IntegratedExerciseEntry[] = stored ? JSON.parse(stored) : [];
      entries.push(entry);
      localStorage.setItem(this.STORAGE_KEYS.EXERCISE_ENTRIES, JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving local exercise entry:', error);
    }
  }

  private saveLocalWaterIntake(glasses: number, date: string): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.WATER_INTAKE);
      const waterData: { [date: string]: number } = stored ? JSON.parse(stored) : {};
      waterData[date] = glasses;
      localStorage.setItem(this.STORAGE_KEYS.WATER_INTAKE, JSON.stringify(waterData));
    } catch (error) {
      console.error('Error saving local water intake:', error);
    }
  }

  private deleteLocalFoodEntry(entryId: number): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.FOOD_ENTRIES);
      if (!stored) return;
      
      const entries: IntegratedFoodEntry[] = JSON.parse(stored);
      const filteredEntries = entries.filter(entry => entry.id !== entryId);
      localStorage.setItem(this.STORAGE_KEYS.FOOD_ENTRIES, JSON.stringify(filteredEntries));
    } catch (error) {
      console.error('Error deleting local food entry:', error);
    }
  }

  private deleteLocalExerciseEntry(entryId: number): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.EXERCISE_ENTRIES);
      if (!stored) return;
      
      const entries: IntegratedExerciseEntry[] = JSON.parse(stored);
      const filteredEntries = entries.filter(entry => entry.id !== entryId);
      localStorage.setItem(this.STORAGE_KEYS.EXERCISE_ENTRIES, JSON.stringify(filteredEntries));
    } catch (error) {
      console.error('Error deleting local exercise entry:', error);
    }
  }

  /**
   * Debug method to check data sources
   */
  async debugDataSources(date: string, userId?: number): Promise<any> {
    const debugInfo = {
      date,
      userId,
      sources: {
        api: { available: false, entries: 0 },
        integrated: { available: false, entries: 0 },
        legacy: { available: false, entries: 0 }
      },
      finalData: null
    };

    try {
      // Check API data
      if (userId) {
        try {
          const nutritionResponse = await apiService.getDailyNutrition(date);
          if (nutritionResponse.data.meals) {
            let apiEntries = 0;
            Object.values(nutritionResponse.data.meals).forEach((mealEntries: any) => {
              apiEntries += mealEntries.length;
            });
            debugInfo.sources.api = { available: true, entries: apiEntries };
          }
        } catch (error: any) {
          console.log('API data not available:', error.message);
        }
      }

      // Check integrated storage
      const integratedStored = localStorage.getItem(this.STORAGE_KEYS.FOOD_ENTRIES);
      if (integratedStored) {
        const integratedEntries = JSON.parse(integratedStored);
        const todayIntegrated = integratedEntries.filter((entry: any) => entry.date === date);
        debugInfo.sources.integrated = { available: true, entries: todayIntegrated.length };
      }

      // Check legacy storage
      const legacyStored = localStorage.getItem(this.STORAGE_KEYS.LEGACY_FOOD_ENTRIES);
      if (legacyStored) {
        const legacyEntries = JSON.parse(legacyStored);
        const targetDate = new Date(date).toDateString();
        const todayLegacy = legacyEntries.filter((entry: any) => 
          new Date(entry.createdAt).toDateString() === targetDate
        );
        debugInfo.sources.legacy = { available: true, entries: todayLegacy.length };
      }

      // Get final integrated data
      debugInfo.finalData = await this.getDailyIntegratedData(date, userId);

      console.log('=== DATA INTEGRATION DEBUG ===');
      console.log('Debug Info:', debugInfo);
      console.log('==============================');

      return debugInfo;
    } catch (error) {
      console.error('Error in debug data sources:', error);
      return debugInfo;
    }
  }

  private processIntegratedData(
    date: string,
    foodEntries: IntegratedFoodEntry[], 
    exerciseEntries: IntegratedExerciseEntry[], 
    waterIntake: number
  ): DailyIntegratedData {
    console.log('=== PROCESS INTEGRATED DATA DEBUG ===');
    console.log('Date:', date);
    console.log('Raw food entries:', foodEntries);
    console.log('Raw exercise entries:', exerciseEntries);
    console.log('Raw water intake:', waterIntake);

    // Ensure arrays are valid and not null/undefined
    const safeFoodEntries = Array.isArray(foodEntries) ? foodEntries.filter(entry => entry && entry.food) : [];
    const safeExerciseEntries = Array.isArray(exerciseEntries) ? exerciseEntries.filter(entry => entry && entry.exercise) : [];
    const safeWaterIntake = typeof waterIntake === 'number' && !isNaN(waterIntake) ? waterIntake : 0;

    console.log('Safe food entries count:', safeFoodEntries.length);
    console.log('Safe exercise entries count:', safeExerciseEntries.length);
    console.log('Safe water intake:', safeWaterIntake);

    // Calculate totals with safe arrays and null checks
    const totalCaloriesConsumed = safeFoodEntries.reduce((sum, entry) => {
      const calories = typeof entry.calories === 'number' && !isNaN(entry.calories) ? entry.calories : 0;
      return sum + calories;
    }, 0);
    
    const totalCaloriesBurned = safeExerciseEntries.reduce((sum, entry) => {
      const calories = typeof entry.caloriesBurned === 'number' && !isNaN(entry.caloriesBurned) ? entry.caloriesBurned : 0;
      return sum + calories;
    }, 0);
    
    const netCalories = totalCaloriesConsumed - totalCaloriesBurned;

    // Calculate macros with safe arrays and null checks
    const macros = {
      protein: safeFoodEntries.reduce((sum, entry) => {
        const protein = typeof entry.protein === 'number' && !isNaN(entry.protein) ? entry.protein : 0;
        return sum + protein;
      }, 0),
      carbs: safeFoodEntries.reduce((sum, entry) => {
        const carbs = typeof entry.carbs === 'number' && !isNaN(entry.carbs) ? entry.carbs : 0;
        return sum + carbs;
      }, 0),
      fat: safeFoodEntries.reduce((sum, entry) => {
        const fat = typeof entry.fat === 'number' && !isNaN(entry.fat) ? entry.fat : 0;
        return sum + fat;
      }, 0),
      fiber: safeFoodEntries.reduce((sum, entry) => {
        const fiber = typeof entry.fiber === 'number' && !isNaN(entry.fiber) ? entry.fiber : 0;
        return sum + fiber;
      }, 0),
    };

    // Group by meal type with safe filtering
    const mealBreakdown: { [mealType: string]: any } = {};
    const mealTypes = ['DESAYUNO', 'ALMUERZO', 'CENA', 'SNACK'];
    
    mealTypes.forEach(mealType => {
      const mealEntries = safeFoodEntries.filter(entry => 
        entry && entry.mealType && entry.mealType === mealType
      );
      
      const mealCalories = mealEntries.reduce((sum, entry) => {
        const calories = typeof entry.calories === 'number' && !isNaN(entry.calories) ? entry.calories : 0;
        return sum + calories;
      }, 0);
      
      const status = this.getMealStatus(mealType, mealCalories);
      
      mealBreakdown[mealType] = {
        entries: mealEntries,
        calories: mealCalories,
        status: status.status,
        message: status.message
      };
    });

    const result = {
      date,
      foodEntries: safeFoodEntries,
      exerciseEntries: safeExerciseEntries,
      totalCaloriesConsumed,
      totalCaloriesBurned,
      netCalories,
      macros,
      mealBreakdown,
      waterIntake: safeWaterIntake
    };

    console.log('Processed data result:');
    console.log('- Total calories consumed:', totalCaloriesConsumed);
    console.log('- Total calories burned:', totalCaloriesBurned);
    console.log('- Net calories:', netCalories);
    console.log('- Macros:', macros);
    console.log('- Meal breakdown:', Object.keys(mealBreakdown).map(key => `${key}: ${mealBreakdown[key].calories} cal`));
    console.log('=====================================');

    return result;
  }
}

export const dataIntegrationService = new DataIntegrationService();