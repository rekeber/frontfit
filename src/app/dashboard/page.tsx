'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  CircularProgress,
  Button,
  Avatar,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  FitnessCenter,
  Restaurant,
  LocalDrink,
  Scale,
  Analytics,
  Whatshot,
  Star,
  Timeline,
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import MainLayout from '@/components/Layout/MainLayout';
import QuickAccessCards from '@/components/Dashboard/QuickAccessCards';
import { apiService } from '@/services/apiService';
import { DashboardStats, DailyNutritionSummary, RecentActivity } from '@/types/dashboard';

const DashboardPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [nutritionSummary, setNutritionSummary] = useState<DailyNutritionSummary | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [waterIntake, setWaterIntake] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Dashboard mounted, user:', user);
    console.log('Auth state:', { user, isLoading: authLoading });
    
    // Only load dashboard data when auth loading is complete
    if (!authLoading) {
      loadDashboardData();
    }
  }, [user, authLoading]); // Add authLoading as dependency

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Loading dashboard data, user authenticated:', !!user);
      console.log('User data:', user);

      // Check if user is authenticated
      if (!user) {
        console.log('No user found, showing empty dashboard');
        // For demo purposes, show empty dashboard for non-authenticated users
        setDashboardStats({
          currentWeight: 0,
          bmi: null,
          currentStreak: 0,
          fitCoinsBalance: 0,
          totalAchievements: 0,
          unlockedAchievements: 0,
          globalRanking: 0,
          totalWorkouts: 0,
          totalCaloriesBurned: 0,
          longestStreak: 0,
        });
        setNutritionSummary({
          date: new Date().toISOString().split('T')[0],
          calorieGoal: null,
          proteinGoal: null,
          carbGoal: null,
          fatGoal: null,
          totalCalories: 0,
          totalCarbs: 0,
          totalProtein: 0,
          totalFat: 0,
          totalFiber: 0,
          waterGlasses: 0,
          waterGoal: 8,
          meals: [],
        });
        setRecentActivities([]);
        setWaterIntake(0);
        setLoading(false);
        return;
      }

      console.log('User authenticated, fetching real dashboard data...');
      const [statsResponse, nutritionResponse, activitiesResponse, waterResponse] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getDailyNutritionSummary(),
        apiService.getRecentActivities(),
        apiService.getTodayWaterIntake(),
      ]);

      console.log('Dashboard API responses:', {
        stats: statsResponse.data,
        nutrition: nutritionResponse.data,
        activities: activitiesResponse.data,
        water: waterResponse.data
      });

      setDashboardStats(statsResponse.data);
      setNutritionSummary(nutritionResponse.data);
      setRecentActivities(activitiesResponse.data);
      setWaterIntake(waterResponse.data);
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleWaterIntakeUpdate = async (glasses: number) => {
    console.log('User state:', user);
    console.log('Is logged in:', !!user);
    
    if (!user) {
      // For non-authenticated users, just update local state
      setWaterIntake(glasses);
      console.log(`Agua actualizada localmente: ${glasses} vasos`);
      return;
    }

    try {
      console.log('Attempting to update water intake on server...');
      await apiService.logWaterIntake(glasses);
      setWaterIntake(glasses);
      console.log(`Agua actualizada en servidor: ${glasses} vasos`);
    } catch (err: any) {
      console.error('Error updating water intake:', err);
      console.error('Error details:', err.response?.data || err.message);
      
      // Show user-friendly message
      alert(`Error al actualizar el agua: ${err.response?.data?.message || err.message || 'Error desconocido'}`);
      
      // Revert on error for authenticated users
      try {
        const waterResponse = await apiService.getTodayWaterIntake();
        setWaterIntake(waterResponse.data);
      } catch (revertErr) {
        console.error('Error reverting water intake:', revertErr);
      }
    }
  };

  if (loading || authLoading) {
    return (
      <MainLayout>
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
            <Grid item xs={12}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                {[1, 2, 3, 4].map((i) => (
                  <Grid item xs={6} sm={3} key={i}>
                    <Skeleton variant="rectangular" height={120} />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <Box sx={{ p: 3 }}>
          <Alert severity="error" action={
            <Button color="inherit" size="small" onClick={loadDashboardData}>
              Reintentar
            </Button>
          }>
            {error}
          </Alert>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {!user && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Para ver datos reales del dashboard, necesitas{' '}
            <Button href="/login" color="inherit" sx={{ textDecoration: 'underline' }}>
              iniciar sesión
            </Button>
            {' '}o{' '}
            <Button href="/register" color="inherit" sx={{ textDecoration: 'underline' }}>
              crear una cuenta
            </Button>
            . Mientras tanto, puedes explorar la interfaz (los botones de agua funcionan localmente).
          </Alert>
        )}

        {/* Debug Info - Remove in production */}
        <Alert severity="warning" sx={{ mb: 3 }}>
          <strong>Debug Info:</strong><br/>
          Usuario detectado: {user ? `Sí (${user.name})` : 'No'}<br/>
          Token disponible: {typeof window !== 'undefined' && localStorage.getItem('fitlife_access_token') ? 'Sí' : 'No'}<br/>
          <Button 
            size="small" 
            onClick={() => {
              console.log('=== DEBUG INFO ===');
              console.log('User object:', user);
              console.log('Access token:', typeof window !== 'undefined' ? localStorage.getItem('fitlife_access_token') : 'N/A');
              console.log('Refresh token:', typeof window !== 'undefined' ? localStorage.getItem('fitlife_refresh_token') : 'N/A');
              console.log('User ID:', typeof window !== 'undefined' ? localStorage.getItem('fitlife_user_id') : 'N/A');
              console.log('==================');
            }}
          >
            Ver Debug en Consola
          </Button>
        </Alert>
        
        <Grid container spacing={3}>
          {/* Welcome Card */}
          <Grid item xs={12}>
            <WelcomeCard userName={user?.name || 'Usuario'} />
          </Grid>

          {/* Quick Access Cards - NEW AI & Gamification Features */}
          <Grid item xs={12}>
            <QuickAccessCards stats={dashboardStats} />
          </Grid>

          {/* Quick Stats */}
          <Grid item xs={12}>
            <QuickStatsRow stats={dashboardStats} />
          </Grid>

          {/* Calorie Progress */}
          <Grid item xs={12} md={8}>
            <CalorieProgressCard nutrition={nutritionSummary} />
          </Grid>

          {/* Today's Summary */}
          <Grid item xs={12} md={4}>
            <TodaySummaryCard 
              waterIntake={waterIntake}
              waterGoal={nutritionSummary?.waterGoal || 8}
              stats={dashboardStats}
              onWaterUpdate={handleWaterIntakeUpdate}
            />
          </Grid>

          {/* Macronutrients */}
          <Grid item xs={12} md={6}>
            <MacronutrientsCard nutrition={nutritionSummary} />
          </Grid>

          {/* Recent Activities */}
          <Grid item xs={12} md={6}>
            <RecentActivitiesCard activities={recentActivities} />
          </Grid>

          {/* Achievements */}
          <Grid item xs={12}>
            <AchievementsCard stats={dashboardStats} />
          </Grid>
        </Grid>
      </Box>
    </MainLayout>
  );
};

const WelcomeCard: React.FC<{ userName: string }> = ({ userName }) => (
  <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            ¡Hola, {userName}! 👋
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Hoy es un gran día para mantenerte saludable
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6">Hoy</Typography>
          <Typography variant="h4" fontWeight="bold">
            {new Date().getDate()}
          </Typography>
          <Typography variant="body2">
            {new Date().toLocaleDateString('es-ES', { month: 'short' })}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const QuickStatsRow: React.FC<{ stats: DashboardStats | null }> = ({ stats }) => {
  console.log('=== QuickStatsRow DEBUG ===');
  console.log('Stats received:', stats);
  console.log('currentWeight:', stats?.currentWeight);
  console.log('bmi:', stats?.bmi);
  console.log('========================');
  
  if (!stats) {
    return (
      <Grid container spacing={2}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={6} sm={3} key={i}>
            <Skeleton variant="rectangular" height={120} />
          </Grid>
        ))}
      </Grid>
    );
  }

  const statsData = [
    { 
      label: 'Peso Actual', 
      value: stats.currentWeight !== null && stats.currentWeight !== undefined ? `${stats.currentWeight} kg` : 'Sin datos', 
      icon: Scale, 
      color: '#4CAF50' 
    },
    { 
      label: 'IMC', 
      value: stats.bmi !== null && stats.bmi !== undefined ? stats.bmi.toFixed(1) : 'Sin datos', 
      icon: Analytics, 
      color: '#2196F3' 
    },
    { 
      label: 'Racha', 
      value: `${stats.currentStreak} días`, 
      icon: Whatshot, 
      color: '#FF9800' 
    },
    { 
      label: 'FitCoins', 
      value: stats.fitCoinsBalance.toLocaleString(), 
      icon: Star, 
      color: '#9C27B0' 
    },
  ];

  return (
    <Grid container spacing={2}>
      {statsData.map((stat, index) => (
        <Grid item xs={6} sm={3} key={index}>
          <StatCard {...stat} />
        </Grid>
      ))}
    </Grid>
  );
};

const StatCard: React.FC<{
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
}> = ({ label, value, icon: Icon, color }) => (
  <Card sx={{ textAlign: 'center', height: '100%' }}>
    <CardContent>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          backgroundColor: `${color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 1,
        }}
      >
        <Icon sx={{ color, fontSize: 24 }} />
      </Box>
      <Typography variant="h6" fontWeight="bold" color={color}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </CardContent>
  </Card>
);

const CalorieProgressCard: React.FC<{ nutrition: DailyNutritionSummary | null }> = ({ nutrition }) => {
  if (!nutrition) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="rectangular" height={12} sx={{ my: 2 }} />
          <Grid container spacing={2}>
            {[1, 2, 3].map((i) => (
              <Grid item xs={4} key={i}>
                <Skeleton variant="text" height={24} />
                <Skeleton variant="text" height={16} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  }

  const calorieGoal = nutrition.calorieGoal || 2000;
  const totalCalories = nutrition.totalCalories || 0;
  const progress = calorieGoal > 0 ? (totalCalories / calorieGoal) * 100 : 0;
  const remaining = Math.max(0, calorieGoal - totalCalories);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            Calorías de Hoy
          </Typography>
          <Typography variant="body1" color="primary" fontWeight="bold">
            {totalCalories.toFixed(0)} / {calorieGoal}
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={Math.min(progress, 100)}
          sx={{
            height: 12,
            borderRadius: 6,
            mb: 2,
            '& .MuiLinearProgress-bar': {
              borderRadius: 6,
            },
          }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Restantes: {remaining.toFixed(0)} cal
          </Typography>
          <Typography variant="body2" fontWeight="bold" color="primary">
            {progress.toFixed(1)}%
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {nutrition.meals.map((meal, index) => (
            <Grid item xs={4} key={index}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color={getMealColor(meal.mealType)} fontWeight="bold">
                  {meal.calories.toFixed(0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {getMealDisplayName(meal.mealType)}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

const getMealColor = (mealType: string) => {
  switch (mealType.toLowerCase()) {
    case 'desayuno': return 'success.main';
    case 'almuerzo': return 'warning.main';
    case 'cena': return 'info.main';
    case 'snack': return 'secondary.main';
    default: return 'text.primary';
  }
};

const getMealDisplayName = (mealType: string) => {
  switch (mealType.toLowerCase()) {
    case 'desayuno': return 'Desayuno';
    case 'almuerzo': return 'Almuerzo';
    case 'cena': return 'Cena';
    case 'snack': return 'Snack';
    default: return mealType;
  }
};

const TodaySummaryCard: React.FC<{ 
  waterIntake: number; 
  waterGoal: number; 
  stats: DashboardStats | null;
  onWaterUpdate: (glasses: number) => void;
}> = ({ waterIntake, waterGoal, stats, onWaterUpdate }) => {
  const handleWaterIncrease = () => {
    const newIntake = Math.min(waterIntake + 1, 12); // Max 12 glasses
    onWaterUpdate(newIntake);
  };

  const handleWaterDecrease = () => {
    const newIntake = Math.max(waterIntake - 1, 0); // Min 0 glasses
    onWaterUpdate(newIntake);
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Resumen de Hoy
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalDrink color="primary" />
              <Typography variant="body2">Agua</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" fontWeight="bold">
                {waterIntake}/{waterGoal} vasos
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Button 
                  size="small" 
                  variant="outlined"
                  onClick={handleWaterDecrease} 
                  disabled={waterIntake <= 0}
                  sx={{ minWidth: '32px', px: 1 }}
                >
                  -1
                </Button>
                <Button 
                  size="small" 
                  variant="contained"
                  onClick={handleWaterIncrease} 
                  disabled={waterIntake >= 12}
                  sx={{ minWidth: '32px', px: 1 }}
                >
                  +1
                </Button>
              </Box>
            </Box>
          </Box>
          
          {/* Water Progress Bar */}
          <Box sx={{ px: 1 }}>
            <LinearProgress
              variant="determinate"
              value={waterGoal > 0 ? Math.min((waterIntake / waterGoal) * 100, 100) : 0}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'primary.light',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  bgcolor: waterIntake >= waterGoal ? 'success.main' : 'primary.main',
                },
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {waterIntake >= waterGoal ? '¡Meta alcanzada! 🎉' : `${waterGoal - waterIntake} vasos restantes`}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FitnessCenter color="success" />
              <Typography variant="body2">Entrenamientos</Typography>
            </Box>
            <Typography variant="body2" fontWeight="bold">
              {stats?.totalWorkouts || 0}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Timeline color="warning" />
              <Typography variant="body2">Racha actual</Typography>
            </Box>
            <Typography variant="body2" fontWeight="bold">
              {stats?.currentStreak || 0} días
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Whatshot color="error" />
              <Typography variant="body2">Calorías quemadas</Typography>
            </Box>
            <Typography variant="body2" fontWeight="bold">
              {stats?.totalCaloriesBurned || 0} cal
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const MacronutrientsCard: React.FC<{ nutrition: DailyNutritionSummary | null }> = ({ nutrition }) => {
  if (!nutrition) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Skeleton variant="text" width="60%" height={32} />
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {[1, 2, 3].map((i) => (
              <Grid item xs={4} key={i}>
                <Box sx={{ textAlign: 'center' }}>
                  <Skeleton variant="circular" width={60} height={60} sx={{ mx: 'auto', mb: 1 }} />
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={16} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  }

  const macros = [
    { 
      name: 'Proteínas', 
      current: nutrition.totalProtein || 0, 
      target: nutrition.proteinGoal || 120, 
      color: '#E91E63' 
    },
    { 
      name: 'Carbos', 
      current: nutrition.totalCarbs || 0, 
      target: nutrition.carbGoal || 250, 
      color: '#2196F3' 
    },
    { 
      name: 'Grasas', 
      current: nutrition.totalFat || 0, 
      target: nutrition.fatGoal || 67, 
      color: '#FF9800' 
    },
  ];

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Macronutrientes
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {macros.map((macro, index) => (
            <Grid item xs={4} key={index}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
                  <CircularProgress
                    variant="determinate"
                    value={macro.target > 0 ? Math.min((macro.current / macro.target) * 100, 100) : 0}
                    size={60}
                    thickness={6}
                    sx={{ color: macro.color }}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="caption" fontWeight="bold">
                      {macro.target > 0 ? Math.round((macro.current / macro.target) * 100) : 0}%
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" fontWeight="bold">
                  {macro.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {macro.current.toFixed(0)}g/{macro.target}g
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

const RecentActivitiesCard: React.FC<{ activities: RecentActivity[] }> = ({ activities }) => {
  const getActivityIcon = (iconType: string) => {
    switch (iconType.toLowerCase()) {
      case 'food':
      case 'restaurant': return Restaurant;
      case 'fitness':
      case 'workout': return FitnessCenter;
      case 'water':
      case 'drink': return LocalDrink;
      default: return Restaurant;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours === 1) return 'Hace 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Hace 1 día';
    return `Hace ${diffInDays} días`;
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            Actividades Recientes
          </Typography>
          <Button size="small">Ver todas</Button>
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {activities.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              No hay actividades recientes
            </Typography>
          ) : (
            activities.slice(0, 3).map((activity, index) => {
              const IconComponent = getActivityIcon(activity.iconType);
              return (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.light', width: 40, height: 40 }}>
                    <IconComponent fontSize="small" />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {activity.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activity.description}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {formatTimeAgo(activity.createdAt)}
                  </Typography>
                </Box>
              );
            })
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

const AchievementsCard: React.FC<{ stats: DashboardStats | null }> = ({ stats }) => {
  if (!stats) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="text" width="60%" height={32} />
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={6} sm={3} key={i}>
                <Box sx={{ textAlign: 'center' }}>
                  <Skeleton variant="text" height={48} />
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" height={20} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  }

  const achievements = [
    { emoji: '🔥', value: stats.currentStreak.toString(), label: 'Días seguidos' },
    { emoji: '🏆', value: stats.unlockedAchievements.toString(), label: 'Logros desbloqueados' },
    { emoji: '⭐', value: stats.fitCoinsBalance.toLocaleString(), label: 'FitCoins totales' },
    { emoji: '💪', value: stats.totalWorkouts.toString(), label: 'Entrenamientos' },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Logros y Racha
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {achievements.map((achievement, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" sx={{ mb: 1 }}>
                  {achievement.emoji}
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  {achievement.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {achievement.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default DashboardPage;