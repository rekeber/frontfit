/**
 * Nutrition Calculator Service - Frontend
 * Calculates nutrition plan based on user profile
 */

export interface UserProfile {
  age: number;
  height: number;
  currentWeight: number;
  targetWeight: number;
  goal: string;
  activityLevel: string;
  gender?: string;
}

export interface NutritionPlan {
  bmr: number;
  tdee: number;
  targetCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  waterIntake: number;
  mealsPerDay: number;
  calorieDistribution: string;
}

class NutritionCalculatorService {
  /**
   * Calculate BMR using Mifflin-St Jeor Equation
   */
  calculateBMR(weight: number, height: number, age: number, gender: string = 'male'): number {
    if (gender === 'female') {
      return (10 * weight) + (6.25 * height) - (5 * age) - 161;
    } else {
      return (10 * weight) + (6.25 * height) - (5 * age) + 5;
    }
  }

  /**
   * Calculate TDEE (Total Daily Energy Expenditure)
   */
  calculateTDEE(bmr: number, activityLevel: string): number {
    const activityMultipliers: { [key: string]: number } = {
      'SEDENTARIO': 1.2,
      'LIGERO': 1.375,
      'MODERADO': 1.55,
      'ACTIVO': 1.725,
      'MUY_ACTIVO': 1.9,
    };

    const multiplier = activityMultipliers[activityLevel] || 1.55;
    return bmr * multiplier;
  }

  /**
   * Calculate target calories based on goal
   */
  calculateTargetCalories(tdee: number, goal: string, currentWeight: number, targetWeight: number): number {
    switch (goal) {
      case 'PERDER_PESO':
        // Deficit of 300-500 calories for safe weight loss
        const deficit = Math.min(500, tdee * 0.2); // Max 20% deficit
        return Math.round(tdee - deficit);
      
      case 'GANAR_MUSCULO':
        // Surplus of 200-300 calories for muscle gain
        return Math.round(tdee + 300);
      
      case 'MANTENER':
      default:
        return Math.round(tdee);
    }
  }

  /**
   * Calculate macronutrient distribution
   */
  calculateMacros(targetCalories: number, goal: string): { protein: number; carbs: number; fat: number } {
    let proteinPercent: number;
    let fatPercent: number;
    let carbsPercent: number;

    switch (goal) {
      case 'PERDER_PESO':
        // High protein to preserve muscle
        proteinPercent = 0.35;
        fatPercent = 0.25;
        carbsPercent = 0.40;
        break;
      
      case 'GANAR_MUSCULO':
        // High protein and carbs for muscle building
        proteinPercent = 0.30;
        fatPercent = 0.25;
        carbsPercent = 0.45;
        break;
      
      case 'MANTENER':
      default:
        // Balanced macros
        proteinPercent = 0.25;
        fatPercent = 0.30;
        carbsPercent = 0.45;
        break;
    }

    // Calculate grams (protein: 4 cal/g, carbs: 4 cal/g, fat: 9 cal/g)
    const protein = Math.round((targetCalories * proteinPercent) / 4);
    const carbs = Math.round((targetCalories * carbsPercent) / 4);
    const fat = Math.round((targetCalories * fatPercent) / 9);

    return { protein, carbs, fat };
  }

  /**
   * Calculate fiber recommendation
   */
  calculateFiber(targetCalories: number): number {
    // General recommendation: 14g per 1000 calories
    return Math.round((targetCalories / 1000) * 14);
  }

  /**
   * Calculate water intake
   */
  calculateWaterIntake(weight: number, activityLevel: string): number {
    // Base: 30-35ml per kg of body weight
    let baseWater = weight * 0.033; // liters
    
    // Adjust for activity level
    if (activityLevel === 'ACTIVO' || activityLevel === 'MUY_ACTIVO') {
      baseWater += 0.5; // Add 500ml for active people
    }
    
    // Convert to glasses (250ml each)
    return Math.round(baseWater * 4);
  }

  /**
   * Get meal distribution recommendation
   */
  getMealDistribution(goal: string): { mealsPerDay: number; distribution: string } {
    switch (goal) {
      case 'PERDER_PESO':
        return {
          mealsPerDay: 4,
          distribution: '25% desayuno, 30% almuerzo, 25% cena, 20% snacks'
        };
      
      case 'GANAR_MUSCULO':
        return {
          mealsPerDay: 5,
          distribution: '20% desayuno, 25% almuerzo, 25% cena, 15% snack AM, 15% snack PM'
        };
      
      case 'MANTENER':
      default:
        return {
          mealsPerDay: 3,
          distribution: '30% desayuno, 40% almuerzo, 30% cena'
        };
    }
  }

  /**
   * Calculate complete nutrition plan
   */
  calculateNutritionPlan(profile: UserProfile): NutritionPlan {
    // Calculate BMR
    const bmr = this.calculateBMR(
      profile.currentWeight,
      profile.height,
      profile.age,
      profile.gender || 'male'
    );

    // Calculate TDEE
    const tdee = this.calculateTDEE(bmr, profile.activityLevel);

    // Calculate target calories
    const targetCalories = this.calculateTargetCalories(
      tdee,
      profile.goal,
      profile.currentWeight,
      profile.targetWeight
    );

    // Calculate macros
    const macros = this.calculateMacros(targetCalories, profile.goal);

    // Calculate fiber
    const fiber = this.calculateFiber(targetCalories);

    // Calculate water intake
    const waterIntake = this.calculateWaterIntake(profile.currentWeight, profile.activityLevel);

    // Get meal distribution
    const mealInfo = this.getMealDistribution(profile.goal);

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories,
      protein: macros.protein,
      carbs: macros.carbs,
      fat: macros.fat,
      fiber,
      waterIntake,
      mealsPerDay: mealInfo.mealsPerDay,
      calorieDistribution: mealInfo.distribution,
    };
  }
}

export const nutritionCalculatorService = new NutritionCalculatorService();
