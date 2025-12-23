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
} from '../types/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:8080/api/v1',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = tokenManager.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = tokenManager.getRefreshToken();
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              tokenManager.saveTokens(
                response.data.accessToken,
                response.data.refreshToken,
                response.data.expiresIn
              );
              
              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            tokenManager.clearTokens();
            window.location.href = '/login';
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
}

export const apiService = new ApiService();