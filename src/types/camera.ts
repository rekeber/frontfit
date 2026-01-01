// Camera and AI Types
export interface FoodAnalysis {
  id?: number;
  userId: number;
  imageUrl: string;
  detectedFoods: DetectedFood[];
  totalCalories: number;
  totalCarbs: string; // BigDecimal as string
  totalProtein: string;
  totalFat: string;
  totalFiber: string;
  confidence: number;
  analysisDate: string;
  isVerified: boolean;
  userCorrections?: string;
}

export interface DetectedFood {
  name: string;
  confidence: number;
  boundingBox?: BoundingBox;
  nutritionPer100g: NutritionInfo;
  estimatedWeight: number;
  category: FoodCategory;
}

export enum FoodCategory {
  FRUITS = 'FRUITS',
  VEGETABLES = 'VEGETABLES',
  PROTEINS = 'PROTEINS',
  GRAINS = 'GRAINS',
  DAIRY = 'DAIRY',
  SNACKS = 'SNACKS',
  BEVERAGES = 'BEVERAGES',
  DESSERTS = 'DESSERTS',
  OTHER = 'OTHER'
}

export interface BoundingBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface NutritionInfo {
  calories: number;
  carbs: string;
  protein: string;
  fat: string;
  fiber: string;
  sugar: string;
  sodium: string;
}

export interface WorkoutAnalysis {
  id?: number;
  userId: number;
  videoUrl: string;
  exerciseType: ExerciseType;
  detectedPoses: PoseFrame[];
  formScore: number; // 0-100
  suggestions: FormSuggestion[];
  repCount: number;
  duration: number; // seconds
  caloriesBurned: number;
  analysisDate: string;
  isProcessed: boolean;
}

export enum ExerciseType {
  SQUAT = 'SQUAT',
  PUSH_UP = 'PUSH_UP',
  PULL_UP = 'PULL_UP',
  DEADLIFT = 'DEADLIFT',
  BENCH_PRESS = 'BENCH_PRESS',
  PLANK = 'PLANK',
  BURPEE = 'BURPEE',
  JUMPING_JACKS = 'JUMPING_JACKS',
  LUNGES = 'LUNGES',
  MOUNTAIN_CLIMBERS = 'MOUNTAIN_CLIMBERS',
  OTHER = 'OTHER'
}

export interface PoseFrame {
  timestamp: number; // seconds
  keypoints: Keypoint[];
  confidence: number;
  formScore: number;
}

export interface Keypoint {
  type: KeypointType;
  x: number;
  y: number;
  confidence: number;
}

export enum KeypointType {
  NOSE = 'NOSE',
  LEFT_EYE = 'LEFT_EYE',
  RIGHT_EYE = 'RIGHT_EYE',
  LEFT_EAR = 'LEFT_EAR',
  RIGHT_EAR = 'RIGHT_EAR',
  LEFT_SHOULDER = 'LEFT_SHOULDER',
  RIGHT_SHOULDER = 'RIGHT_SHOULDER',
  LEFT_ELBOW = 'LEFT_ELBOW',
  RIGHT_ELBOW = 'RIGHT_ELBOW',
  LEFT_WRIST = 'LEFT_WRIST',
  RIGHT_WRIST = 'RIGHT_WRIST',
  LEFT_HIP = 'LEFT_HIP',
  RIGHT_HIP = 'RIGHT_HIP',
  LEFT_KNEE = 'LEFT_KNEE',
  RIGHT_KNEE = 'RIGHT_KNEE',
  LEFT_ANKLE = 'LEFT_ANKLE',
  RIGHT_ANKLE = 'RIGHT_ANKLE'
}

export interface FormSuggestion {
  type: SuggestionType;
  message: string;
  severity: Severity;
  timestamp?: number; // When in video this occurs
  bodyPart?: string;
}

export enum SuggestionType {
  POSTURE_CORRECTION = 'POSTURE_CORRECTION',
  RANGE_OF_MOTION = 'RANGE_OF_MOTION',
  SPEED_ADJUSTMENT = 'SPEED_ADJUSTMENT',
  ALIGNMENT = 'ALIGNMENT',
  BREATHING = 'BREATHING',
  SAFETY_WARNING = 'SAFETY_WARNING'
}

export enum Severity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL'
}

// Camera capture models
export interface CameraState {
  isRecording: boolean;
  recordingDuration: number;
  flashMode: FlashMode;
  cameraFacing: CameraFacing;
  captureMode: CaptureMode;
}

export enum FlashMode {
  OFF = 'OFF',
  ON = 'ON',
  AUTO = 'AUTO'
}

export enum CameraFacing {
  FRONT = 'FRONT',
  BACK = 'BACK'
}

export enum CaptureMode {
  PHOTO = 'PHOTO',
  VIDEO = 'VIDEO',
  FOOD_SCAN = 'FOOD_SCAN',
  WORKOUT_ANALYSIS = 'WORKOUT_ANALYSIS'
}

export interface MediaFile {
  uri: string;
  type: MediaType;
  duration?: number; // for videos
  size: number;
  timestamp: number;
}

export enum MediaType {
  PHOTO = 'PHOTO',
  VIDEO = 'VIDEO'
}

// AI Analysis requests
export interface FoodAnalysisRequest {
  imageBase64: string;
  mealType?: string;
  timestamp: string;
}

export interface WorkoutAnalysisRequest {
  videoBase64: string;
  exerciseType: ExerciseType;
  timestamp: string;
}

// AI Analysis responses
export interface FoodAnalysisResponse {
  success: boolean;
  analysis?: FoodAnalysis;
  error?: string;
  processingTime: number;
}

export interface WorkoutAnalysisResponse {
  success: boolean;
  analysis?: WorkoutAnalysis;
  error?: string;
  processingTime: number;
}