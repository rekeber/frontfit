import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { tokenManager } from './tokenManager';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  FoodSearchResponse,
  DailyNutrition,
  FoodLogRequest,
  FoodLog,
  Exercise,
  ExerciseLogRequest,
  ExerciseLog,
  Post,
  CreatePostRequest,
  FriendRequest,
  FriendRequestRequest
} from '@/types/api';

// Creator Economy Types
import {
  Creator,
  CreatorContent,
  Brand,
  BrandCollaboration,
  CreatorApplicationRequest,
  CreateContentRequest,
  CreatorAnalytics,
  TrendingContent
} from '@/types/creator';

// Gamification Types
import {
  FitCoin,
  LootBox,
  UserAvatar,
  FitCoinBalance,
  LootBoxRewards,
  DailySpinResult,
  Leaderboard,
  AvatarCustomization,
  GamificationStats
} from '@/types/gamification';

// Camera/AI Types
import {
  FoodAnalysis,
  WorkoutAnalysis,
  FoodAnalysisRequest,
  WorkoutAnalysisRequest,
  FoodAnalysisResponse,
  WorkoutAnalysisResponse
} from '@/types/camera';

// Dashboard Types
import {
  DashboardStats,
  DailyNutritionSummary,
  RecentActivity,
  WaterIntakeRequest
} from '@/types/dashboard';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: '/api/v1',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = tokenManager.getAccessToken();
        console.log('API Request:', config.method?.toUpperCase(), config.url);
        console.log('Token available:', !!token);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('Authorization header set');
        } else {
          console.log('No token available for request');
        }
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => {
        console.log('API Response:', response.status, response.config.url);
        return response;
      },
      async (error) => {
        console.error('API Error:', error.response?.status, error.config?.url);
        console.error('Error details:', error.response?.data);
        
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          console.log('401 error, attempting token refresh...');
          originalRequest._retry = true;

          try {
            const refreshToken = tokenManager.getRefreshToken();
            if (refreshToken) {
              console.log('Refresh token available, refreshing...');
              const response = await this.refreshToken(refreshToken);
              tokenManager.saveTokens(
                response.data.accessToken,
                response.data.refreshToken,
                response.data.expiresIn
              );
              
              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
              console.log('Token refreshed, retrying original request...');
              return this.api(originalRequest);
            } else {
              console.log('No refresh token available');
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            tokenManager.clearTokens();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(request: LoginRequest): Promise<AxiosResponse<AuthResponse>> {
    return this.api.post('/auth/login', request);
  }

  async register(request: RegisterRequest): Promise<AxiosResponse<AuthResponse>> {
    return this.api.post('/auth/register', request);
  }

  async refreshToken(refreshToken: string): Promise<AxiosResponse<AuthResponse>> {
    return this.api.post('/auth/refresh', { refreshToken });
  }

  async logout(): Promise<AxiosResponse<void>> {
    return this.api.post('/auth/logout');
  }

  // User
  async getUserProfile(): Promise<AxiosResponse<User>> {
    return this.api.get('/users/profile');
  }

  async updateUserProfile(user: Partial<User>): Promise<AxiosResponse<User>> {
    return this.api.put('/users/profile', user);
  }

  async getUserById(userId: number): Promise<AxiosResponse<User>> {
    return this.api.get(`/users/${userId}`);
  }

  // Food
  async searchFoods(query: string, page = 0, size = 20): Promise<AxiosResponse<FoodSearchResponse>> {
    return this.api.get('/foods/search', {
      params: { query, page, size }
    });
  }

  async getFoodById(foodId: number): Promise<AxiosResponse<any>> {
    return this.api.get(`/foods/${foodId}`);
  }

  // Nutrition
  async getDailyNutrition(date: string): Promise<AxiosResponse<DailyNutrition>> {
    return this.api.get('/nutrition/daily', {
      params: { date }
    });
  }

  async logFood(request: FoodLogRequest): Promise<AxiosResponse<FoodLog>> {
    return this.api.post('/nutrition/log', request);
  }

  // Exercise
  async getExercises(): Promise<AxiosResponse<Exercise[]>> {
    return this.api.get('/exercises');
  }

  async logExercise(request: ExerciseLogRequest): Promise<AxiosResponse<ExerciseLog>> {
    return this.api.post('/exercises/log', request);
  }

  // Social
  async getFeed(page = 0): Promise<AxiosResponse<Post[]>> {
    return this.api.get('/social/feed', {
      params: { page }
    });
  }

  async createPost(request: CreatePostRequest): Promise<AxiosResponse<Post>> {
    return this.api.post('/social/posts', request);
  }

  async likePost(postId: number): Promise<AxiosResponse<void>> {
    return this.api.post(`/social/posts/${postId}/like`);
  }

  // Friends
  async getFriends(): Promise<AxiosResponse<User[]>> {
    return this.api.get('/friends');
  }

  async sendFriendRequest(request: FriendRequestRequest): Promise<AxiosResponse<void>> {
    return this.api.post('/friends/request', request);
  }

  async getFriendRequests(): Promise<AxiosResponse<FriendRequest[]>> {
    return this.api.get('/friends/requests');
  }

  async acceptFriendRequest(requestId: number): Promise<AxiosResponse<void>> {
    return this.api.put(`/friends/requests/${requestId}/accept`);
  }

  // Creator Economy APIs
  async applyToBeCreator(request: CreatorApplicationRequest): Promise<AxiosResponse<void>> {
    return this.api.post('/creators/apply', request);
  }

  async getCreatorProfile(): Promise<AxiosResponse<Creator>> {
    return this.api.get('/creators/profile');
  }

  async createContent(request: CreateContentRequest): Promise<AxiosResponse<CreatorContent>> {
    return this.api.post('/creators/content', request);
  }

  async publishContent(contentId: number): Promise<AxiosResponse<void>> {
    return this.api.post(`/creators/content/${contentId}/publish`);
  }

  async likeContent(contentId: number): Promise<AxiosResponse<void>> {
    return this.api.post(`/creators/content/${contentId}/like`);
  }

  async getCreatorAnalytics(): Promise<AxiosResponse<CreatorAnalytics>> {
    return this.api.get('/creators/analytics');
  }

  async discoverCreators(page = 0): Promise<AxiosResponse<Creator[]>> {
    return this.api.get('/creators/discover', { params: { page } });
  }

  async getTrendingContent(): Promise<AxiosResponse<TrendingContent>> {
    return this.api.get('/creators/content/trending');
  }

  async getCreatorContent(creatorId: number, page = 0): Promise<AxiosResponse<CreatorContent[]>> {
    return this.api.get(`/creators/${creatorId}/content`, { params: { page } });
  }

  // Brand APIs
  async registerBrand(brand: Partial<Brand>): Promise<AxiosResponse<Brand>> {
    return this.api.post('/brands/register', brand);
  }

  async getBrandProfile(): Promise<AxiosResponse<Brand>> {
    return this.api.get('/brands/profile');
  }

  async createCollaboration(collaboration: Partial<BrandCollaboration>): Promise<AxiosResponse<BrandCollaboration>> {
    return this.api.post('/brands/collaborations', collaboration);
  }

  async getBrandCollaborations(page = 0): Promise<AxiosResponse<BrandCollaboration[]>> {
    return this.api.get('/brands/collaborations', { params: { page } });
  }

  async approveCollaboration(collaborationId: number): Promise<AxiosResponse<void>> {
    return this.api.post(`/brands/collaborations/${collaborationId}/approve`);
  }

  async discoverCreatorsForBrand(page = 0): Promise<AxiosResponse<Creator[]>> {
    return this.api.get('/brands/creators/discover', { params: { page } });
  }

  async getBrandAnalytics(): Promise<AxiosResponse<any>> {
    return this.api.get('/brands/analytics');
  }

  // Gamification APIs
  async getFitCoinBalance(): Promise<AxiosResponse<FitCoinBalance>> {
    return this.api.get('/gamification/fitcoins/balance');
  }

  async getFitCoinTransactions(page = 0): Promise<AxiosResponse<FitCoin[]>> {
    return this.api.get('/gamification/fitcoins/transactions', { params: { page } });
  }

  async claimDailyLootBox(): Promise<AxiosResponse<LootBox>> {
    return this.api.post('/gamification/lootbox/daily');
  }

  async openLootBox(lootBoxId: number): Promise<AxiosResponse<LootBoxRewards>> {
    return this.api.post(`/gamification/lootbox/${lootBoxId}/open`);
  }

  async getUserLootBoxes(): Promise<AxiosResponse<LootBox[]>> {
    return this.api.get('/gamification/lootbox');
  }

  async getUserAvatar(): Promise<AxiosResponse<UserAvatar>> {
    return this.api.get('/gamification/avatar');
  }

  async customizeAvatar(customization: AvatarCustomization): Promise<AxiosResponse<UserAvatar>> {
    return this.api.post('/gamification/avatar/customize', customization);
  }

  async performDailySpin(): Promise<AxiosResponse<DailySpinResult>> {
    return this.api.post('/gamification/daily-spin');
  }

  async getLeaderboard(type: string, period = 'weekly'): Promise<AxiosResponse<Leaderboard>> {
    return this.api.get(`/gamification/leaderboard/${type}`, { params: { period } });
  }

  async getGamificationStats(): Promise<AxiosResponse<GamificationStats>> {
    return this.api.get('/gamification/stats');
  }

  // AI Analysis APIs
  async analyzeFoodImage(request: FoodAnalysisRequest): Promise<AxiosResponse<FoodAnalysisResponse>> {
    return this.api.post('/ai/analyze/food', request);
  }

  async analyzeWorkoutVideo(request: WorkoutAnalysisRequest): Promise<AxiosResponse<WorkoutAnalysisResponse>> {
    return this.api.post('/ai/analyze/workout', request);
  }

  async getFoodAnalysisHistory(page = 0): Promise<AxiosResponse<FoodAnalysis[]>> {
    return this.api.get('/ai/food-analysis/history', { params: { page } });
  }

  async getWorkoutAnalysisHistory(page = 0): Promise<AxiosResponse<WorkoutAnalysis[]>> {
    return this.api.get('/ai/workout-analysis/history', { params: { page } });
  }

  async getAIRecommendations(): Promise<AxiosResponse<any[]>> {
    return this.api.get('/ai/recommendations');
  }

  async getAICoachingSessions(page = 0): Promise<AxiosResponse<any[]>> {
    return this.api.get('/ai/coaching-sessions', { params: { page } });
  }

  // Dashboard APIs
  async getDashboardStats(): Promise<AxiosResponse<DashboardStats>> {
    return this.api.get('/dashboard/stats');
  }

  async getDailyNutritionSummary(date?: string): Promise<AxiosResponse<DailyNutritionSummary>> {
    const params = date ? { date } : {};
    return this.api.get('/dashboard/nutrition/daily', { params });
  }

  async getRecentActivities(): Promise<AxiosResponse<RecentActivity[]>> {
    return this.api.get('/dashboard/activities/recent');
  }

  async logWaterIntake(glasses: number): Promise<AxiosResponse<void>> {
    return this.api.post('/dashboard/hydration', null, { params: { glasses } });
  }

  async getTodayWaterIntake(): Promise<AxiosResponse<number>> {
    return this.api.get('/dashboard/hydration/today');
  }
}

export const apiService = new ApiService();