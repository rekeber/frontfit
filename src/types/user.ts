export interface User {
  id: string
  email: string
  name: string
  profileImage?: string
  age: number
  height: number
  currentWeight: number
  targetWeight: number
  activityLevel: 'sedentario' | 'ligero' | 'moderado' | 'activo' | 'muy_activo'
  goal: 'perder_peso' | 'mantener' | 'ganar_musculo'
  dietaryRestrictions: string[]
  allergies: string[]
  createdAt: string
  lastLogin?: string
  streakDays: number
  totalWeightLost: number
  friendIds: string[]
  preferences: Record<string, any>
}

export interface UserStats {
  bmi: number
  dailyCalories: number
  weeklyWorkouts: number
  weeklyCaloriesBurned: number
  currentStreak: number
}