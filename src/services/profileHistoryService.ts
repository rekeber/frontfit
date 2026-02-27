/**
 * Profile History Service
 * Tracks changes to user profile (weight, goal, activity level) with timestamps
 */

export interface ProfileChange {
  id: number;
  timestamp: string;
  type: 'weight' | 'goal' | 'activityLevel' | 'all';
  previousValue: any;
  newValue: any;
  notes?: string;
}

export interface ProfileHistory {
  userId: number;
  changes: ProfileChange[];
}

class ProfileHistoryService {
  private readonly STORAGE_KEY = 'fitlife_profile_history';

  /**
   * Get profile history for a user
   */
  getHistory(userId: number): ProfileChange[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const allHistory: ProfileHistory[] = JSON.parse(stored);
      const userHistory = allHistory.find(h => h.userId === userId);
      
      return userHistory?.changes || [];
    } catch (error) {
      console.error('Error reading profile history:', error);
      return [];
    }
  }

  /**
   * Add a profile change to history
   */
  addChange(userId: number, change: Omit<ProfileChange, 'id' | 'timestamp'>): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      let allHistory: ProfileHistory[] = stored ? JSON.parse(stored) : [];

      const userHistoryIndex = allHistory.findIndex(h => h.userId === userId);
      
      const newChange: ProfileChange = {
        ...change,
        id: Date.now(),
        timestamp: new Date().toISOString(),
      };

      if (userHistoryIndex >= 0) {
        allHistory[userHistoryIndex].changes.push(newChange);
      } else {
        allHistory.push({
          userId,
          changes: [newChange],
        });
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allHistory));
      
      console.log('Profile change recorded:', newChange);
    } catch (error) {
      console.error('Error saving profile change:', error);
    }
  }

  /**
   * Get weight history
   */
  getWeightHistory(userId: number): Array<{ date: string; weight: number }> {
    const changes = this.getHistory(userId);
    const weightChanges = changes.filter(c => c.type === 'weight' || c.type === 'all');
    
    return weightChanges.map(c => ({
      date: c.timestamp,
      weight: c.newValue.currentWeight || c.newValue,
    }));
  }

  /**
   * Get latest weight
   */
  getLatestWeight(userId: number): number | null {
    const weightHistory = this.getWeightHistory(userId);
    if (weightHistory.length === 0) return null;
    
    return weightHistory[weightHistory.length - 1].weight;
  }

  /**
   * Get goal history
   */
  getGoalHistory(userId: number): Array<{ date: string; goal: string }> {
    const changes = this.getHistory(userId);
    const goalChanges = changes.filter(c => c.type === 'goal' || c.type === 'all');
    
    return goalChanges.map(c => ({
      date: c.timestamp,
      goal: c.newValue.goal || c.newValue,
    }));
  }

  /**
   * Get activity level history
   */
  getActivityHistory(userId: number): Array<{ date: string; activityLevel: string }> {
    const changes = this.getHistory(userId);
    const activityChanges = changes.filter(c => c.type === 'activityLevel' || c.type === 'all');
    
    return activityChanges.map(c => ({
      date: c.timestamp,
      activityLevel: c.newValue.activityLevel || c.newValue,
    }));
  }

  /**
   * Format timestamp for display
   */
  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Hoy a las ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Ayer a las ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  /**
   * Get change description
   */
  getChangeDescription(change: ProfileChange): string {
    switch (change.type) {
      case 'weight':
        const weightDiff = change.newValue - change.previousValue;
        const sign = weightDiff > 0 ? '+' : '';
        return `Peso: ${change.previousValue} kg → ${change.newValue} kg (${sign}${weightDiff.toFixed(1)} kg)`;
      
      case 'goal':
        return `Objetivo: ${change.previousValue} → ${change.newValue}`;
      
      case 'activityLevel':
        return `Actividad: ${change.previousValue} → ${change.newValue}`;
      
      case 'all':
        return 'Perfil actualizado completamente';
      
      default:
        return 'Cambio registrado';
    }
  }

  /**
   * Delete a change from history
   */
  deleteChange(userId: number, changeId: number): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return;

      let allHistory: ProfileHistory[] = JSON.parse(stored);
      const userHistoryIndex = allHistory.findIndex(h => h.userId === userId);
      
      if (userHistoryIndex >= 0) {
        allHistory[userHistoryIndex].changes = allHistory[userHistoryIndex].changes.filter(
          c => c.id !== changeId
        );
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allHistory));
      }
    } catch (error) {
      console.error('Error deleting profile change:', error);
    }
  }

  /**
   * Clear all history for a user
   */
  clearHistory(userId: number): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return;

      let allHistory: ProfileHistory[] = JSON.parse(stored);
      allHistory = allHistory.filter(h => h.userId !== userId);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allHistory));
    } catch (error) {
      console.error('Error clearing profile history:', error);
    }
  }
}

export const profileHistoryService = new ProfileHistoryService();
