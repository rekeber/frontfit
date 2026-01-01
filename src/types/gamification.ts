// Gamification Types
export interface FitCoin {
  id: number;
  userId: number;
  transactionType: TransactionType;
  amount: string; // BigDecimal as string
  balanceAfter: string;
  source: CoinSource;
  description: string;
  referenceType?: string;
  referenceId?: number;
  createdAt: string;
}

export enum TransactionType {
  EARNED = 'EARNED',
  SPENT = 'SPENT',
  BONUS = 'BONUS',
  REFUND = 'REFUND'
}

export enum CoinSource {
  WORKOUT_COMPLETED = 'WORKOUT_COMPLETED',
  NUTRITION_LOGGED = 'NUTRITION_LOGGED',
  WEIGHT_UPDATED = 'WEIGHT_UPDATED',
  ACHIEVEMENT_UNLOCKED = 'ACHIEVEMENT_UNLOCKED',
  DAILY_LOGIN = 'DAILY_LOGIN',
  STREAK_BONUS = 'STREAK_BONUS',
  SOCIAL_INTERACTION = 'SOCIAL_INTERACTION',
  CONTENT_CREATED = 'CONTENT_CREATED',
  CONTENT_LIKED = 'CONTENT_LIKED',
  LOOT_BOX = 'LOOT_BOX',
  DAILY_SPIN = 'DAILY_SPIN',
  REFERRAL_BONUS = 'REFERRAL_BONUS',
  PREMIUM_BONUS = 'PREMIUM_BONUS',
  CREATOR_EARNINGS = 'CREATOR_EARNINGS',
  PURCHASE_REFUND = 'PURCHASE_REFUND',
  CHALLENGE_COMPLETED = 'CHALLENGE_COMPLETED',
  MILESTONE_REACHED = 'MILESTONE_REACHED',
  COMMUNITY_CONTRIBUTION = 'COMMUNITY_CONTRIBUTION'
}

export interface LootBox {
  id: number;
  userId: number;
  boxType: BoxType;
  rarity: Rarity;
  isOpened: boolean;
  fitcoinsReward?: string;
  fitgemsReward?: number;
  avatarItemsReward?: string;
  specialReward?: string;
  createdAt: string;
  openedAt?: string;
}

export enum BoxType {
  DAILY = 'DAILY',
  WORKOUT = 'WORKOUT',
  STREAK = 'STREAK',
  ACHIEVEMENT = 'ACHIEVEMENT',
  PREMIUM = 'PREMIUM',
  SPECIAL_EVENT = 'SPECIAL_EVENT',
  NUTRITION_PERFECT = 'NUTRITION_PERFECT',
  WEIGHT_MILESTONE = 'WEIGHT_MILESTONE',
  SOCIAL_ENGAGEMENT = 'SOCIAL_ENGAGEMENT',
  CREATOR_BONUS = 'CREATOR_BONUS'
}

export enum Rarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY'
}

export interface UserAvatar {
  id: number;
  userId: number;
  avatarName: string;
  bodyType: BodyType;
  skinTone: SkinTone;
  hairStyle: HairStyle;
  hairColor: HairColor;
  eyeColor: EyeColor;
  fitnessLevel: FitnessLevel;
  muscleDefinition: number;
  transformationProgress: number;
  totalWeightLost: number;
  totalWorkoutsCompleted: number;
  totalCaloriesBurned: number;
  currentOutfit?: string;
  unlockedItems?: string;
  createdAt: string;
  updatedAt: string;
}

export enum BodyType {
  ECTOMORPH = 'ECTOMORPH',
  MESOMORPH = 'MESOMORPH',
  ENDOMORPH = 'ENDOMORPH',
  ATHLETIC = 'ATHLETIC',
  CURVY = 'CURVY',
  SLIM = 'SLIM',
  MUSCULAR = 'MUSCULAR'
}

export enum SkinTone {
  VERY_LIGHT = 'VERY_LIGHT',
  LIGHT = 'LIGHT',
  MEDIUM_LIGHT = 'MEDIUM_LIGHT',
  MEDIUM = 'MEDIUM',
  MEDIUM_DARK = 'MEDIUM_DARK',
  DARK = 'DARK',
  VERY_DARK = 'VERY_DARK'
}

export enum HairStyle {
  SHORT = 'SHORT',
  MEDIUM = 'MEDIUM',
  LONG = 'LONG',
  CURLY = 'CURLY',
  STRAIGHT = 'STRAIGHT',
  WAVY = 'WAVY',
  BALD = 'BALD',
  PONYTAIL = 'PONYTAIL',
  BUN = 'BUN'
}

export enum HairColor {
  BLACK = 'BLACK',
  BROWN = 'BROWN',
  BLONDE = 'BLONDE',
  RED = 'RED',
  GRAY = 'GRAY',
  WHITE = 'WHITE',
  BLUE = 'BLUE',
  PINK = 'PINK',
  GREEN = 'GREEN',
  PURPLE = 'PURPLE'
}

export enum EyeColor {
  BROWN = 'BROWN',
  BLUE = 'BLUE',
  GREEN = 'GREEN',
  HAZEL = 'HAZEL',
  GRAY = 'GRAY',
  AMBER = 'AMBER',
  VIOLET = 'VIOLET'
}

export enum FitnessLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
  PROFESSIONAL = 'PROFESSIONAL'
}

export interface Achievement {
  id: number;
  name: string;
  title: string;
  description: string;
  category: string;
  points: number;
  iconUrl?: string;
  badgeUrl?: string;
  isSecret: boolean;
  requirements?: string;
}

export interface UserAchievement {
  id: number;
  userId: number;
  achievement: Achievement;
  unlockedAt: string;
  progress: number;
}

// Gamification DTOs
export interface FitCoinBalance {
  currentBalance: string;
  totalEarned: string;
  totalSpent: string;
  recentTransactions: FitCoin[];
}

export interface LootBoxRewards {
  fitcoins: string;
  fitgems: number;
  avatarItems: string[];
  specialRewards: string[];
}

export interface DailySpinResult {
  rewardType: string;
  fitcoins: string;
  fitgems: number;
  specialReward?: string;
}

export interface LeaderboardEntry {
  userId: number;
  name: string;
  avatarUrl?: string;
  score: number;
  rank: number;
  change: number;
}

export interface Leaderboard {
  type: LeaderboardType;
  period: string;
  entries: LeaderboardEntry[];
  userRank?: number;
  userScore?: number;
}

export enum LeaderboardType {
  FITCOINS = 'FITCOINS',
  TRANSFORMATION = 'TRANSFORMATION',
  WORKOUTS = 'WORKOUTS',
  WEIGHT_LOSS = 'WEIGHT_LOSS',
  STREAK = 'STREAK'
}

export interface AvatarCustomization {
  avatarName?: string;
  bodyType?: BodyType;
  skinTone?: SkinTone;
  hairStyle?: HairStyle;
  hairColor?: HairColor;
  eyeColor?: EyeColor;
}

export interface GamificationStats {
  fitcoinsBalance: string;
  totalAchievements: number;
  unlockedAchievements: number;
  currentStreak: number;
  longestStreak: number;
  totalLootBoxes: number;
  unopenedLootBoxes: number;
  avatarLevel: number;
  transformationProgress: number;
}