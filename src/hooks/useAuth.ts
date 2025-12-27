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
          // Create a basic user object from stored info
          const userId = tokenManager.getUserId();
          const userEmail = tokenManager.getUserEmail();
          const userName = tokenManager.getUserName();
          
          if (userId && userEmail && userName) {
            const basicUser: User = {
              id: userId,
              email: userEmail,
              name: userName,
              age: 0,
              height: 0,
              currentWeight: 0,
              targetWeight: 0,
              goal: '',
              activityLevel: '',
              isActive: true,
              emailVerified: true,
              streakDays: 0,
              totalPoints: 0,
              totalWeightLost: 0,
              createdAt: new Date().toISOString(),
              allergies: [],
              dietaryRestrictions: []
            };
            
            setAuthState({
              isLoggedIn: true,
              user: basicUser,
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error('Missing user info');
          }
        } else {
          setAuthState({
            isLoggedIn: false,
            user: null,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
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

    // Add a small delay to prevent flash of loading state
    const timer = setTimeout(checkAuthStatus, 100);
    return () => clearTimeout(timer);
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
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al iniciar sesión';
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
      console.error('Register error:', error);
      
      let errorMessage = 'Error al crear la cuenta';
      
      if (error.response?.status === 400) {
        // Validation errors
        const validationErrors = error.response?.data?.errors;
        if (validationErrors && Array.isArray(validationErrors)) {
          errorMessage = validationErrors.join(', ');
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = 'Datos de registro inválidos. Verifica que la contraseña tenga al menos 8 caracteres y el nombre al menos 2 caracteres.';
        }
      } else if (error.response?.status === 403) {
        errorMessage = 'Acceso denegado. Verifica los datos del formulario.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
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