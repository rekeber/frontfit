/**
 * Exercise Recommendation Service - SIMPLIFIED
 * Provides exercise recommendations based on user goal from profile
 */

export interface UserGoalConfig {
  goal: 'LOSE_WEIGHT' | 'GAIN_MUSCLE' | 'MAINTAIN' | 'IMPROVE_FITNESS';
  currentWeight: number;
  targetWeight: number;
  height: number;
  activityLevel: 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE' | 'VERY_ACTIVE';
}

export interface SimpleExerciseRecommendation {
  name: string;
  duration: number; // minutes
  caloriesPerMinute: number;
  category: string;
  icon: string;
}

class ExerciseRecommendationService {
  /**
   * Get simple exercise recommendations based on user goal
   */
  getRecommendedExercises(goalConfig: UserGoalConfig): SimpleExerciseRecommendation[] {
    switch (goalConfig.goal) {
      case 'LOSE_WEIGHT':
        return [
          { name: 'Correr', duration: 30, caloriesPerMinute: 10, category: 'Cardio', icon: '🏃‍♂️' },
          { name: 'Burpees', duration: 15, caloriesPerMinute: 12, category: 'HIIT', icon: '🔥' },
          { name: 'Caminar Rápido', duration: 45, caloriesPerMinute: 5, category: 'Cardio', icon: '🚶‍♂️' },
        ];
      case 'GAIN_MUSCLE':
        return [
          { name: 'Sentadillas', duration: 20, caloriesPerMinute: 6, category: 'Fuerza', icon: '🏋️‍♂️' },
          { name: 'Flexiones', duration: 15, caloriesPerMinute: 8, category: 'Fuerza', icon: '💪' },
          { name: 'Plancha', duration: 10, caloriesPerMinute: 5, category: 'Core', icon: '🧘‍♂️' },
        ];
      case 'IMPROVE_FITNESS':
        return [
          { name: 'Ciclismo', duration: 40, caloriesPerMinute: 8, category: 'Cardio', icon: '🚴‍♂️' },
          { name: 'Natación', duration: 30, caloriesPerMinute: 11, category: 'Cardio', icon: '🏊‍♂️' },
          { name: 'Yoga', duration: 20, caloriesPerMinute: 3, category: 'Flexibilidad', icon: '🧘‍♀️' },
        ];
      default: // MAINTAIN
        return [
          { name: 'Caminar', duration: 30, caloriesPerMinute: 4, category: 'Cardio', icon: '🚶‍♂️' },
          { name: 'Sentadillas', duration: 15, caloriesPerMinute: 6, category: 'Fuerza', icon: '🏋️‍♂️' },
          { name: 'Estiramientos', duration: 10, caloriesPerMinute: 2, category: 'Flexibilidad', icon: '🧘' },
        ];
    }
  }

  /**
   * Calculate recommended daily exercise minutes based on goal
   */
  getRecommendedDailyMinutes(goal: UserGoalConfig['goal']): number {
    switch (goal) {
      case 'LOSE_WEIGHT': return 45;
      case 'GAIN_MUSCLE': return 40;
      case 'IMPROVE_FITNESS': return 50;
      default: return 30;
    }
  }

  /**
   * Calculate target calories to burn per day
   */
  getTargetCaloriesToBurn(goalConfig: UserGoalConfig): number {
    const weightDiff = goalConfig.currentWeight - goalConfig.targetWeight;
    
    if (goalConfig.goal === 'LOSE_WEIGHT' && weightDiff > 0) {
      return 400; // Burn 400 cal/day through exercise
    } else if (goalConfig.goal === 'GAIN_MUSCLE') {
      return 200; // Light cardio to maintain health
    } else if (goalConfig.goal === 'IMPROVE_FITNESS') {
      return 350;
    }
    return 250; // Maintain
  }
}

export const exerciseRecommendationService = new ExerciseRecommendationService();

