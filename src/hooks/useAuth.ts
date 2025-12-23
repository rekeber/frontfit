import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';
import { tokenManager } from '../services/tokenManager';
import { User, LoginRequest, RegisterRequest } from '../types/api';

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    user: null,
    isLoading: true,
    error: null,
  });

  // Check login status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        if (tokenManager.isLoggedIn()) {
          // Try to get user profile to verify token is still valid
          const response = await apiService.getUserProfile();
          setAuthState({
            isLoggedIn: true,
            user: response.data,
            isLoading: false,
            error: null,
          });
        } else {
          setAuthState({
            isLoggedIn: false,
            user: null,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        // Token might be invalid, clear it
        tokenManager.clearTokens();
        setAuthState({
          isLoggedIn: false,
          user: null,
          isLoading: false,
          error: null,
        });
      }
    };

    checkAuthStatus();
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiService.login(credentials);
      const { accessToken, refreshToken, expiresIn, user } = response.data;

      // Save tokens and user info
      tokenManager.saveTokens(accessToken, refreshToken, expiresIn);
      tokenManager.saveUserInfo(user.id, user.email, user.name);

      setAuthState({
        isLoggedIn: true,
        user,
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al iniciar sesión';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      return { success: false, error: errorMessage };
    }
  }, []);

  const register = useCallback(async (userData: RegisterRequest) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiService.register(userData);
      const { accessToken, refreshToken, expiresIn, user } = response.data;

      // Save tokens and user info
      tokenManager.saveTokens(accessToken, refreshToken, expiresIn);
      tokenManager.saveUserInfo(user.id, user.email, user.name);

      setAuthState({
        isLoggedIn: true,
        user,
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al crear la cuenta';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      await apiService.logout();
    } catch (error) {
      // Even if logout API call fails, clear local tokens
      console.error('Logout API call failed:', error);
    } finally {
      tokenManager.clearTokens();
      setAuthState({
        isLoggedIn: false,
        user: null,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setAuthState(prev => ({
      ...prev,
      user: updatedUser,
    }));
  }, []);

  return {
    ...authState,
    login,
    register,
    logout,
    clearError,
    updateUser,
  };
};