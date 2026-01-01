class TokenManager {
  private readonly ACCESS_TOKEN_KEY = 'fitlife_access_token';
  private readonly REFRESH_TOKEN_KEY = 'fitlife_refresh_token';
  private readonly EXPIRES_AT_KEY = 'fitlife_expires_at';
  private readonly USER_ID_KEY = 'fitlife_user_id';
  private readonly USER_EMAIL_KEY = 'fitlife_user_email';
  private readonly USER_NAME_KEY = 'fitlife_user_name';

  saveTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
    if (typeof window === 'undefined') return;
    
    const expiresAt = Date.now() + (expiresIn * 1000);
    
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(this.EXPIRES_AT_KEY, expiresAt.toString());
  }

  saveUserInfo(userId: number, email: string, name: string): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(this.USER_ID_KEY, userId.toString());
    localStorage.setItem(this.USER_EMAIL_KEY, email);
    localStorage.setItem(this.USER_NAME_KEY, name);
  }

  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  getUserId(): number | null {
    if (typeof window === 'undefined') return null;
    const userId = localStorage.getItem(this.USER_ID_KEY);
    return userId ? parseInt(userId) : null;
  }

  getUserEmail(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.USER_EMAIL_KEY);
  }

  getUserName(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.USER_NAME_KEY);
  }

  isTokenExpired(): boolean {
    if (typeof window === 'undefined') return true;
    
    const expiresAt = localStorage.getItem(this.EXPIRES_AT_KEY);
    if (!expiresAt) return true;
    
    return Date.now() >= parseInt(expiresAt);
  }

  isLoggedIn(): boolean {
    return this.hasValidToken();
  }

  clearTokens(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.EXPIRES_AT_KEY);
    localStorage.removeItem(this.USER_ID_KEY);
    localStorage.removeItem(this.USER_EMAIL_KEY);
    localStorage.removeItem(this.USER_NAME_KEY);
  }

  hasValidToken(): boolean {
    return this.getAccessToken() !== null && !this.isTokenExpired();
  }
}

export const tokenManager = new TokenManager();