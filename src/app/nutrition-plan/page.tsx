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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
  Edit,
  History,
  Close,
  ExpandMore,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import MainLayout from '@/components/Layout/MainLayout';
import { apiService } from '@/services/apiService';
import { profileHistoryService, ProfileChange } from '@/services/profileHistoryService';

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
  const { user, isLoading: authLoading, updateUser } = useAuth();
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  const [recommendations, setRecommendations] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialog, setEditDialog] = useState(false);
  const [historyDialog, setHistoryDialog] = useState(false);
  const [profileHistory, setProfileHistory] = useState<ProfileChange[]>([]);
  
  // Form states for editing profile
  const [editWeight, setEditWeight] = useState<number>(70);
  const [editGoal, setEditGoal] = useState<string>('MANTENER');
  const [editActivityLevel, setEditActivityLevel] = useState<string>('MODERADO');
  const [editNotes, setEditNotes] = useState<string>('');

  const GOALS = [
    { value: 'PERDER_PESO', label: 'Perder Peso' },
    { value: 'GANAR_MUSCULO', label: 'Ganar Músculo' },
    { value: 'MANTENER', label: 'Mantener' },
  ];

  const ACTIVITY_LEVELS = [
    { value: 'SEDENTARIO', label: 'Sedentario (poco o ningún ejercicio)' },
    { value: 'LIGERO', label: 'Ligero (ejercicio 1-3 días/semana)' },
    { value: 'MODERADO', label: 'Moderado (ejercicio 3-5 días/semana)' },
    { value: 'ACTIVO', label: 'Activo (ejercicio 6-7 días/semana)' },
    { value: 'MUY_ACTIVO', label: 'Muy Activo (ejercicio intenso diario)' },
  ];

  useEffect(() => {
    if (!authLoading && user) {
      loadNutritionPlan();
      loadRecommendations();
      loadProfileHistory();
      
      // Initialize edit form with current values
      setEditWeight(user.currentWeight || 70);
      setEditGoal(user.goal || 'MANTENER');
      setEditActivityLevel(user.activityLevel || 'MODERADO');
    }
  }, [user, authLoading]);

  const loadProfileHistory = () => {
    if (user?.id) {
      const history = profileHistoryService.getHistory(user.id);
      setProfileHistory(history);
    }
  };

  const handleOpenEditDialog = () => {
    if (user) {
      setEditWeight(user.currentWeight || 70);
      setEditGoal(user.goal || 'MANTENER');
      setEditActivityLevel(user.activityLevel || 'MODERADO');
      setEditNotes('');
      setEditDialog(true);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    const changes: Array<{ type: ProfileChange['type']; previousValue: any; newValue: any }> = [];

    // Check what changed
    if (editWeight !== user.currentWeight) {
      changes.push({
        type: 'weight',
        previousValue: user.currentWeight,
        newValue: editWeight,
      });
    }

    if (editGoal !== user.goal) {
      changes.push({
        type: 'goal',
        previousValue: user.goal,
        newValue: editGoal,
      });
    }

    if (editActivityLevel !== user.activityLevel) {
      changes.push({
        type: 'activityLevel',
        previousValue: user.activityLevel,
        newValue: editActivityLevel,
      });
    }

    if (changes.length === 0) {
      setEditDialog(false);
      return;
    }

    try {
      setLoading(true);

      // Create updated user object
      const updatedUser = {
        ...user,
        currentWeight: editWeight,
        goal: editGoal,
        activityLevel: editActivityLevel,
      };

      // Save to backend first
      const response = await apiService.updateUserProfile(updatedUser);
      const savedUser = response.data;

      // Save each change to history
      changes.forEach(change => {
        profileHistoryService.addChange(user.id, {
          ...change,
          notes: editNotes || undefined,
        });
      });

      // Update user globally using the hook
      updateUser(savedUser);

      // Reload data with new user info
      loadProfileHistory();
      await loadNutritionPlan();
      await loadRecommendations();
      
      setEditDialog(false);
      
      // Show success message
      setError(null);
      
      // Force reload of other pages by dispatching a custom event
      window.dispatchEvent(new CustomEvent('userProfileUpdated', { detail: savedUser }));
      
      alert(`Perfil actualizado correctamente.\n\n${changes.length} cambio(s) registrado(s) en tu historial.\n\nTodas las secciones se actualizarán con los nuevos datos.`);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError('Error al guardar el perfil: ' + (err.response?.data?.message || err.message));
      alert('Error al guardar el perfil. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const loadNutritionPlan = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Calculate nutrition plan locally using frontend service
      // This ensures we always get fresh calculations based on current profile
      const { nutritionCalculatorService } = await import('@/services/nutritionCalculatorService');
      
      const plan = nutritionCalculatorService.calculateNutritionPlan({
        age: user.age || 30,
        height: user.height || 170,
        currentWeight: user.currentWeight || 70,
        targetWeight: user.targetWeight || 70,
        goal: user.goal || 'MANTENER',
        activityLevel: user.activityLevel || 'MODERADO',
        gender: 'male', // Default to male, can be enhanced later with user preference
      });
      
      console.log('Nutrition plan calculated locally:', plan);
      
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
          Plan científicamente calculado basado en tu objetivo: <strong>{GOALS.find(g => g.value === user.goal)?.label || user.goal}</strong>
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    👤 Mi Perfil
                  </Typography>
                  <Box>
                    <IconButton size="small" onClick={() => setHistoryDialog(true)} title="Ver historial">
                      <History />
                    </IconButton>
                    <IconButton size="small" onClick={handleOpenEditDialog} color="primary" title="Editar perfil">
                      <Edit />
                    </IconButton>
                  </Box>
                </Box>
                
                <List dense>
                  <ListItem>
                    <ListItemIcon><Whatshot /></ListItemIcon>
                    <ListItemText 
                      primary="Peso Actual" 
                      secondary={`${user.currentWeight} kg`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Timeline /></ListItemIcon>
                    <ListItemText 
                      primary="Objetivo" 
                      secondary={GOALS.find(g => g.value === user.goal)?.label || user.goal} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><FitnessCenter /></ListItemIcon>
                    <ListItemText 
                      primary="Actividad" 
                      secondary={ACTIVITY_LEVELS.find(a => a.value === user.activityLevel)?.label || user.activityLevel} 
                    />
                  </ListItem>
                </List>

                {profileHistory.length > 0 && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="caption">
                      Último cambio: {profileHistoryService.formatTimestamp(profileHistory[profileHistory.length - 1].timestamp)}
                    </Typography>
                  </Alert>
                )}
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

        {/* Edit Profile Dialog */}
        <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Editar Mi Perfil
            <IconButton
              onClick={() => setEditDialog(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Alert severity="info">
                Cada cambio que realices será registrado en tu historial con fecha y hora.
              </Alert>

              <TextField
                label="Peso Actual (kg)"
                type="number"
                value={editWeight}
                onChange={(e) => setEditWeight(Number(e.target.value))}
                inputProps={{ min: 30, max: 300, step: 0.1 }}
                fullWidth
              />

              <TextField
                label="Objetivo"
                select
                value={editGoal}
                onChange={(e) => setEditGoal(e.target.value)}
                fullWidth
              >
                {GOALS.map((goal) => (
                  <MenuItem key={goal.value} value={goal.value}>
                    {goal.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Nivel de Actividad"
                select
                value={editActivityLevel}
                onChange={(e) => setEditActivityLevel(e.target.value)}
                fullWidth
              >
                {ACTIVITY_LEVELS.map((level) => (
                  <MenuItem key={level.value} value={level.value}>
                    {level.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Notas (opcional)"
                multiline
                rows={2}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Ej: Cambio después de consulta médica"
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialog(false)}>Cancelar</Button>
            <Button onClick={handleSaveProfile} variant="contained">
              Guardar Cambios
            </Button>
          </DialogActions>
        </Dialog>

        {/* History Dialog */}
        <Dialog open={historyDialog} onClose={() => setHistoryDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Historial de Cambios de Perfil
            <IconButton
              onClick={() => setHistoryDialog(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {profileHistory.length === 0 ? (
              <Alert severity="info">
                No hay cambios registrados aún. Los cambios que realices en tu perfil se guardarán aquí automáticamente.
              </Alert>
            ) : (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total de cambios registrados: {profileHistory.length}
                </Typography>
                
                <List>
                  {profileHistory.slice().reverse().map((change) => (
                    <ListItem key={change.id} sx={{ flexDirection: 'column', alignItems: 'flex-start', borderBottom: 1, borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {profileHistoryService.getChangeDescription(change)}
                        </Typography>
                        {change.type === 'weight' && (
                          <Chip 
                            icon={change.newValue > change.previousValue ? <TrendingUp /> : <TrendingDown />}
                            label={change.newValue > change.previousValue ? 'Aumento' : 'Disminución'}
                            size="small"
                            color={change.newValue > change.previousValue ? 'warning' : 'success'}
                          />
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {profileHistoryService.formatTimestamp(change.timestamp)}
                      </Typography>
                      {change.notes && (
                        <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                          Nota: {change.notes}
                        </Typography>
                      )}
                    </ListItem>
                  ))}
                </List>

                {/* Weight Chart Summary */}
                {profileHistoryService.getWeightHistory(user?.id || 0).length > 1 && (
                  <Accordion sx={{ mt: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="subtitle2">📊 Resumen de Peso</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box>
                        {profileHistoryService.getWeightHistory(user?.id || 0).map((entry, index) => (
                          <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">
                              {new Date(entry.date).toLocaleDateString('es-ES')}
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {entry.weight} kg
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setHistoryDialog(false)}>Cerrar</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
};

// Componente auxiliar para Scale icon
const Scale: React.FC = () => <Whatshot />;

export default NutritionPlanPage;