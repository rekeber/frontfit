class TokenManager {
  private readonly ACCESS_TOKEN_KEY = 'fitlife_access_token';
  private readonly REFRESH_TOKEN_KEY = 'fitlife_refresh_token';
  private readonly TOKEN_EXPIRY_KEY = 'fitlife_token_expiry';
  private readonly USER_ID_KEY = 'fitlife_user_id';
  private readonly USER_EMAIL_KEY = 'fitlife_user_email';
  private readonly USER_NAME_KEY = 'fitlife_user_name';

  saveTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
    const expiryTime = Date.now() + (expiresIn * 1000);
    
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
  }

  getAccessToken(): string | null {
    const token = localStorage.getItem(this.ACCESS_TOKEN_KEY);
    const expiryTime = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    
    if (token && expiryTime && Date.now() < parseInt(expiryTime)) {
      return token;
    }
    
    return null;
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  isTokenValid(): boolean {
    const expiryTime = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    return expiryTime ? Date.now() < parseInt(expiryTime) : false;
  }

  saveUserInfo(userId: number, email: string, name: string): void {
    localStorage.setItem(this.USER_ID_KEY, userId.toString());
    localStorage.setItem(this.USER_EMAIL_KEY, email);
    localStorage.setItem(this.USER_NAME_KEY, name);
  }

  getUserId(): number | null {
    const userId = localStorage.getItem(this.USER_ID_KEY);
    return userId ? parseInt(userId) : null;
  }

  getUserEmail(): string | null {
    return localStorage.getItem(this.USER_EMAIL_KEY);
  }

  getUserName(): string | null {
    return localStorage.getItem(this.USER_NAME_KEY);
  }

  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    localStorage.removeItem(this.USER_ID_KEY);
    localStorage.removeItem(this.USER_EMAIL_KEY);
    localStorage.removeItem(this.USER_NAME_KEY);
  }

  isLoggedIn(): boolean {
    return this.getAccessToken() !== null && this.isTokenValid();
  }
}

export const tokenManager = new TokenManager();