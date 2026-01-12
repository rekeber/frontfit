'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  Chip,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Restaurant,
  Add,
  Search,
  CameraAlt,
  Delete,
  Edit,
  Close,
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/services/apiService';
import { Food, FoodLog, FoodLogRequest, DailyNutrition } from '@/types/api';

// Use API types directly
type FoodEntry = FoodLog;

const NutritionPage: React.FC = () => {
  const { user } = useAuth();
  const [dailyNutrition, setDailyNutrition] = useState<DailyNutrition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [addFoodDialog, setAddFoodDialog] = useState(false);
  const [searchDialog, setSearchDialog] = useState(false);
  const [cameraDialog, setCameraDialog] = useState(false);
  
  // Form states
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState<number>(100);
  const [mealType, setMealType] = useState<string>('DESAYUNO');
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  const mealTypes = [
    { value: 'DESAYUNO', label: 'Desayuno', color: '#4CAF50' },
    { value: 'ALMUERZO', label: 'Almuerzo', color: '#FF9800' },
    { value: 'CENA', label: 'Cena', color: '#2196F3' },
    { value: 'SNACK', label: 'Snack', color: '#9C27B0' }
  ];

  useEffect(() => {
    if (user) {
      loadDailyNutrition();
    }
  }, [user]);

  const loadDailyNutrition = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const response = await apiService.getDailyNutrition(today);
      setDailyNutrition(response.data);
    } catch (err: any) {
      console.error('Error loading nutrition:', err);
      setError('Error al cargar los datos nutricionales');
    } finally {
      setLoading(false);
    }
  };

  const searchFoods = async (query: string) => {
    if (!query.trim()) return;
    
    try {
      setSearchLoading(true);
      const response = await apiService.searchFoods(query);
      setSearchResults(response.data.content || []);
    } catch (err: any) {
      console.error('Error searching foods:', err);
      setError('Error al buscar alimentos');
    } finally {
      setSearchLoading(false);
    }
  };

  const addFoodEntry = async () => {
    if (!selectedFood) return;

    try {
      const foodLogRequest: FoodLogRequest = {
        foodId: selectedFood.id,
        quantity: quantity,
        unit: 'g',
        mealType: mealType,
        date: new Date().toISOString().split('T')[0]
      };

      await apiService.logFood(foodLogRequest);
      await loadDailyNutrition();
      
      // Reset form
      setSelectedFood(null);
      setQuantity(100);
      setAddFoodDialog(false);
      setSearchDialog(false);
    } catch (err: any) {
      console.error('Error adding food:', err);
      setError('Error al agregar el alimento');
    }
  };

  const deleteFoodEntry = async (entryId: number) => {
    try {
      // TODO: Implement delete endpoint
      console.log('Delete entry:', entryId);
      await loadDailyNutrition();
    } catch (err: any) {
      console.error('Error deleting food entry:', err);
      setError('Error al eliminar el alimento');
    }
  };

  const getMealEntries = (mealType: string) => {
    return dailyNutrition?.meals?.[mealType] || [];
  };

  const getMealCalories = (mealType: string) => {
    return getMealEntries(mealType).reduce((total, entry) => total + entry.calories, 0);
  };

  const getMealTarget = (mealType: string) => {
    if (!dailyNutrition?.calorieGoal) return 500;
    
    const distribution = {
      'DESAYUNO': 0.25,
      'ALMUERZO': 0.35,
      'CENA': 0.30,
      'SNACK': 0.10
    };
    
    return Math.round(dailyNutrition.calorieGoal * (distribution[mealType as keyof typeof distribution] || 0.25));
  };

  if (loading) {
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
            Necesitas iniciar sesión para registrar tus alimentos.
          </Alert>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          🍎 Nutrición
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Registra tus comidas y mantén un seguimiento de tu nutrición
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Comidas de Hoy
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => setAddFoodDialog(true)}
                      size="small"
                    >
                      Agregar
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Search />}
                      onClick={() => setSearchDialog(true)}
                      size="small"
                    >
                      Buscar
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CameraAlt />}
                      onClick={() => setCameraDialog(true)}
                      size="small"
                    >
                      Escanear
                    </Button>
                  </Box>
                </Box>
                
                {mealTypes.map((meal) => {
                  const entries = getMealEntries(meal.value);
                  const calories = getMealCalories(meal.value);
                  const target = getMealTarget(meal.value);
                  
                  return (
                    <Box key={meal.value} sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {meal.label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {Math.round(calories)} / {target} cal
                        </Typography>
                      </Box>
                      
                      <LinearProgress
                        variant="determinate"
                        value={Math.min((calories / target) * 100, 100)}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: `${meal.color}20`,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: meal.color,
                            borderRadius: 4,
                          },
                        }}
                      />
                      
                      {entries.length > 0 && (
                        <List dense sx={{ mt: 1 }}>
                          {entries.map((entry) => (
                            <ListItem key={entry.id} sx={{ px: 0 }}>
                              <ListItemText
                                primary={entry.food.name}
                                secondary={`${entry.quantity}g - ${Math.round(entry.calories)} cal`}
                              />
                              <ListItemSecondaryAction>
                                <IconButton
                                  edge="end"
                                  size="small"
                                  onClick={() => deleteFoodEntry(entry.id)}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </ListItemSecondaryAction>
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </Box>
                  );
                })}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Resumen Nutricional
                </Typography>
                
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant="h3" fontWeight="bold" color="primary">
                    {Math.round(dailyNutrition?.totalCalories || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    de {dailyNutrition?.calorieGoal || 2000} calorías
                  </Typography>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={dailyNutrition?.calorieGoal ? 
                    Math.min((dailyNutrition.totalCalories / dailyNutrition.calorieGoal) * 100, 100) : 0}
                  sx={{ mb: 3, height: 8, borderRadius: 4 }}
                />

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Proteínas</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {Math.round(dailyNutrition?.totalProtein || 0)}g
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Carbohidratos</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {Math.round(dailyNutrition?.totalCarbs || 0)}g
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2">Grasas</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {Math.round(dailyNutrition?.totalFat || 0)}g
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={loadDailyNutrition}
                  startIcon={<Restaurant />}
                >
                  Actualizar Datos
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Add Food Dialog */}
        <Dialog open={addFoodDialog} onClose={() => setAddFoodDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Agregar Alimento
            <IconButton
              onClick={() => setAddFoodDialog(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Autocomplete
                options={mealTypes}
                getOptionLabel={(option) => option.label}
                value={mealTypes.find(m => m.value === mealType) || mealTypes[0]}
                onChange={(_, newValue) => setMealType(newValue?.value || 'DESAYUNO')}
                renderInput={(params) => <TextField {...params} label="Tipo de comida" />}
              />
              
              <TextField
                label="Cantidad (gramos)"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                inputProps={{ min: 1, max: 2000 }}
              />
              
              {selectedFood && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6">{selectedFood.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Por {quantity}g: {Math.round((selectedFood.caloriesPer100g * quantity) / 100)} calorías
                    </Typography>
                  </CardContent>
                </Card>
              )}
              
              <Button
                variant="outlined"
                onClick={() => {
                  setAddFoodDialog(false);
                  setSearchDialog(true);
                }}
              >
                {selectedFood ? 'Cambiar Alimento' : 'Seleccionar Alimento'}
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddFoodDialog(false)}>Cancelar</Button>
            <Button
              onClick={addFoodEntry}
              variant="contained"
              disabled={!selectedFood}
            >
              Agregar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Search Foods Dialog */}
        <Dialog open={searchDialog} onClose={() => setSearchDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Buscar Alimentos
            <IconButton
              onClick={() => setSearchDialog(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Buscar alimento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchFoods(searchQuery)}
                InputProps={{
                  endAdornment: (
                    <Button onClick={() => searchFoods(searchQuery)} disabled={searchLoading}>
                      {searchLoading ? <CircularProgress size={20} /> : <Search />}
                    </Button>
                  )
                }}
              />
              
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {searchResults.map((food) => (
                  <ListItem
                    key={food.id}
                    button
                    onClick={() => {
                      setSelectedFood(food);
                      setSearchDialog(false);
                      setAddFoodDialog(true);
                    }}
                  >
                    <ListItemText
                      primary={food.name}
                      secondary={`${food.caloriesPer100g} cal/100g - P: ${food.proteinPer100g}g, C: ${food.carbsPer100g}g, G: ${food.fatPer100g}g`}
                    />
                  </ListItem>
                ))}
              </List>
              
              {searchResults.length === 0 && searchQuery && !searchLoading && (
                <Alert severity="info">
                  No se encontraron alimentos. Intenta con otro término de búsqueda.
                </Alert>
              )}
            </Box>
          </DialogContent>
        </Dialog>

        {/* Camera Dialog */}
        <Dialog open={cameraDialog} onClose={() => setCameraDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Escanear Alimento
            <IconButton
              onClick={() => setCameraDialog(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 2 }}>
              Funcionalidad de cámara en desarrollo. Por ahora usa la búsqueda manual.
            </Alert>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CameraAlt sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                Próximamente: Escanea códigos de barras o toma fotos de tus alimentos
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCameraDialog(false)}>Cerrar</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
};

export default NutritionPage;