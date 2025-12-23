// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  age: number;
  height: number;
  currentWeight: number;
  targetWeight: number;
  goal: string;
  activityLevel: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

// User Types
export interface User {
  id: number;
  email: string;
  name: string;
  age: number;
  height: number;
  currentWeight: number;
  targetWeight: number;
  goal: string;
  activityLevel: string;
  profileImageUrl?: string;
  isActive: boolean;
  emailVerified: boolean;
  streakDays: number;
  totalPoints: number;
  totalWeightLost: number;
  createdAt: string;
  lastLogin?: string;
  allergies: string[];
  dietaryRestrictions: string[];
}

// Food Types
export interface Food {
  id: number;
  name: string;
  brand?: string;
  barcode?: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number;
  servingSize?: string;
  imageUrl?: string;
  isHealthy: boolean;
  glycemicIndex?: number;
  categories: string[];
  allergens: string[];
  vitamins: Record<string, number>;
  minerals: Record<string, number>;
}

export interface FoodSearchResponse {
  content: Food[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface FoodLogRequest {
  foodId: number;
  quantity: number;
  unit: string;
  mealType: string;
  date: string;
}

export interface FoodLog {
  id: number;
  food: Food;
  quantity: number;
  unit: string;
  mealType: string;
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DailyNutrition {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
  meals: Record<string, FoodLog[]>;
}

// Exercise Types
export interface Exercise {
  id: number;
  name: string;
  category: string;
  muscleGroups: string[];
  equipment?: string;
  instructions: string;
  imageUrl?: string;
  videoUrl?: string;
  difficulty: string;
  caloriesPerMinute: number;
}

export interface ExerciseLogRequest {
  exerciseId: number;
  duration: number;
  sets?: number;
  reps?: number;
  weight?: number;
  date: string;
  notes?: string;
}

export interface ExerciseLog {
  id: number;
  exercise: Exercise;
  duration: number;
  sets?: number;
  reps?: number;
  weight?: number;
  date: string;
  caloriesBurned: number;
  notes?: string;
}

// Social Types
export interface Post {
  id: number;
  user: User;
  content: string;
  imageUrl?: string;
  type: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  createdAt: string;
  tags: string[];
}

export interface CreatePostRequest {
  content: string;
  imageUrl?: string;
  type: string;
  tags: string[];
}

// Friends Types
export interface FriendRequest {
  id: number;
  sender: User;
  receiver: User;
  status: string;
  createdAt: string;
}

export interface FriendRequestRequest {
  receiverEmail: string;
}