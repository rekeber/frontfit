export interface DashboardStats {
  currentWeight: number;
  bmi: number | null;
  currentStreak: number;
  fitCoinsBalance: number;
  totalAchievements: number;
  unlockedAchievements: number;
  globalRanking: number;
  totalWorkouts: number;
  totalCaloriesBurned: number;
  longestStreak: number;
}

export interface DailyNutritionSummary {
  date: string;
  calorieGoal: number | null;
  proteinGoal: number | null;
  carbGoal: number | null;
  fatGoal: number | null;
  totalCalories: number;
  totalCarbs: number;
  totalProtein: number;
  totalFat: number;
  totalFiber: number;
  waterGlasses: number;
  waterGoal: number;
  meals: MealSummary[];
}

export interface MealSummary {
  mealType: string;
  calories: number;
  itemCount: number;
}

export interface RecentActivity {
  activityType: string;
  title: string;
  description: string;
  iconType: string;
  createdAt: string;
}

export interface WaterIntakeRequest {
  glasses: number;
}