'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Button,
  Alert,
  Chip,
  Divider,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Restaurant,
  LocalDrink,
  FitnessCenter,
  Timeline,
  Speed,
  Whatshot,
  EmojiEvents,
  Info,
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import MainLayout from '@/components/Layout/MainLayout';
import { apiService } from '@/services/apiService';

interface NutritionPlan {
  bmr: number;
  tdee: number;
  targetCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  waterIntake: number;
  mealsPerDay: number;
  calorieDistribution: string;
}

const NutritionPlanPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  const [recommendations, setRecommendations] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      loadNutritionPlan();
      loadRecommendations();
    }
  }, [user, authLoading]);

  const loadNutritionPlan = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/nutrition-plan/current', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('fitlife_access_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar el plan nutricional');
      }
      
      const plan = await response.json();
      setNutritionPlan(plan);
    } catch (err: any) {
      console.error('Error loading nutrition plan:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    try {
      const response = await fetch('/api/v1/nutrition-plan/recommendations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('fitlife_access_token')}`,
        },
      });
      
      if (response.ok) {
        const recs = await response.text();
        setRecommendations(recs);
      }
    } catch (err) {
      console.error('Error loading recommendations:', err);
    }
  };

  if (authLoading || loading) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <Box sx={{ p: 3 }}>
          <Alert severity="warning">
            Necesitas iniciar sesión para ver tu plan nutricional personalizado.
          </Alert>
        </Box>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <Box sx={{ p: 3 }}>
          <Alert severity="error" action={
            <Button color="inherit" size="small" onClick={loadNutritionPlan}>
              Reintentar
            </Button>
          }>
            {error}
          </Alert>
        </Box>
      </MainLayout>
    );
  }

  if (!nutritionPlan) {
    return (
      <MainLayout>
        <Box sx={{ p: 3 }}>
          <Alert severity="info">
            No se pudo cargar el plan nutricional. Verifica que tengas todos los datos de perfil completos.
          </Alert>
        </Box>
      </MainLayout>
    );
  }

  const macroPercentages = {
    protein: (nutritionPlan.protein * 4 / nutritionPlan.targetCalories) * 100,
    carbs: (nutritionPlan.carbs * 4 / nutritionPlan.targetCalories) * 100,
    fat: (nutritionPlan.fat * 9 / nutritionPlan.targetCalories) * 100,
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          🍎 Tu Plan Nutricional Personalizado
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Plan científicamente calculado basado en tu objetivo: <strong>{user.goal}</strong>
        </Typography>

        <Grid container spacing={3}>
          {/* Resumen de Calorías */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📊 Resumen Calórico
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary" fontWeight="bold">
                        {Math.round(nutritionPlan.bmr)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        BMR (Metabolismo Basal)
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main" fontWeight="bold">
                        {Math.round(nutritionPlan.tdee)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        TDEE (Gasto Total)
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main" fontWeight="bold">
                        {Math.round(nutritionPlan.targetCalories)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Calorías Objetivo
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="info.main" fontWeight="bold">
                        {Math.round(nutritionPlan.waterIntake)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Vasos de Agua
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Información del Usuario */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  👤 Tu Perfil
                </Typography>
                
                <List dense>
                  <ListItem>
                    <ListItemIcon><Scale /></ListItemIcon>
                    <ListItemText 
                      primary="Peso Actual" 
                      secondary={`${user.currentWeight} kg`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Timeline /></ListItemIcon>
                    <ListItemText 
                      primary="Objetivo" 
                      secondary={user.goal} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><FitnessCenter /></ListItemIcon>
                    <ListItemText 
                      primary="Actividad" 
                      secondary={user.activityLevel} 
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Macronutrientes */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🥗 Distribución de Macronutrientes
                </Typography>
                
                <Grid container spacing={4}>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <CircularProgress
                        variant="determinate"
                        value={macroPercentages.protein}
                        size={100}
                        thickness={6}
                        sx={{ color: '#E91E63', mb: 2 }}
                      />
                      <Typography variant="h5" fontWeight="bold" color="#E91E63">
                        {Math.round(nutritionPlan.protein)}g
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Proteína ({Math.round(macroPercentages.protein)}%)
                      </Typography>
                      <Chip 
                        label="Construcción muscular" 
                        size="small" 
                        color="secondary" 
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <CircularProgress
                        variant="determinate"
                        value={macroPercentages.carbs}
                        size={100}
                        thickness={6}
                        sx={{ color: '#2196F3', mb: 2 }}
                      />
                      <Typography variant="h5" fontWeight="bold" color="#2196F3">
                        {Math.round(nutritionPlan.carbs)}g
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Carbohidratos ({Math.round(macroPercentages.carbs)}%)
                      </Typography>
                      <Chip 
                        label="Energía" 
                        size="small" 
                        color="primary" 
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <CircularProgress
                        variant="determinate"
                        value={macroPercentages.fat}
                        size={100}
                        thickness={6}
                        sx={{ color: '#FF9800', mb: 2 }}
                      />
                      <Typography variant="h5" fontWeight="bold" color="#FF9800">
                        {Math.round(nutritionPlan.fat)}g
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Grasas ({Math.round(macroPercentages.fat)}%)
                      </Typography>
                      <Chip 
                        label="Hormonas" 
                        size="small" 
                        color="warning" 
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Fibra recomendada:
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {Math.round(nutritionPlan.fiber)}g
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Comidas por día:
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {nutritionPlan.mealsPerDay}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Distribución de Comidas */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🍽️ Distribución de Comidas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {nutritionPlan.calorieDistribution}
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Alert severity="info" icon={<Info />}>
                    Distribuye tus calorías a lo largo del día para optimizar tu metabolismo y energía.
                  </Alert>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Recomendaciones */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  💡 Recomendaciones Personalizadas
                </Typography>
                
                {recommendations && (
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography 
                      variant="body2" 
                      component="pre" 
                      sx={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}
                    >
                      {recommendations}
                    </Typography>
                  </Paper>
                )}
                
                <Box sx={{ mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    onClick={loadRecommendations}
                    size="small"
                  >
                    Actualizar Recomendaciones
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Acciones */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🎯 Próximos Pasos
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item>
                    <Button 
                      variant="contained" 
                      startIcon={<Restaurant />}
                      href="/nutrition"
                    >
                      Registrar Comida
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button 
                      variant="contained" 
                      startIcon={<LocalDrink />}
                      href="/dashboard"
                    >
                      Registrar Agua
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button 
                      variant="outlined" 
                      startIcon={<Timeline />}
                      onClick={loadNutritionPlan}
                    >
                      Recalcular Plan
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </MainLayout>
  );
};

// Componente auxiliar para Scale icon
const Scale: React.FC = () => <Whatshot />;

export default NutritionPlanPage;