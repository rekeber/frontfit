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
  Tabs,
  Tab,
} from '@mui/material';
import {
  Restaurant,
  Add,
  Search,
  CameraAlt,
  Delete,
  Close,
  TrendingUp,
  LocalFireDepartment,
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/services/apiService';
import { dataIntegrationService } from '@/services/dataIntegrationService';

interface Food {
  id: number;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number;
}

const NutritionPage: React.FC = () => {
  const { user } = useAuth();
  const [integratedData, setIntegratedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Dialog states
  const [addFoodDialog, setAddFoodDialog] = useState(false);
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Form states
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState<number>(100);
  const [mealType, setMealType] = useState<string>('DESAYUNO');

  // Alimentos comunes predefinidos
  const commonFoods: Food[] = [
    { id: 1, name: 'Manzana', caloriesPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 14, fatPer100g: 0.2, fiberPer100g: 2.4 },
    { id: 2, name: 'Plátano', caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23, fatPer100g: 0.3, fiberPer100g: 2.6 },
    { id: 3, name: 'Pollo (pechuga)', caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6, fiberPer100g: 0 },
    { id: 4, name: 'Arroz blanco', caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28, fatPer100g: 0.3, fiberPer100g: 0.4 },
    { id: 5, name: 'Huevo', caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 11, fiberPer100g: 0 },
    { id: 6, name: 'Avena', caloriesPer100g: 389, proteinPer100g: 17, carbsPer100g: 66, fatPer100g: 7, fiberPer100g: 10.6 },
    { id: 7, name: 'Salmón', caloriesPer100g: 208, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 13, fiberPer100g: 0 },
    { id: 8, name: 'Brócoli', caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 7, fatPer100g: 0.4, fiberPer100g: 2.6 },
    { id: 9, name: 'Pan integral', caloriesPer100g: 247, proteinPer100g: 13, carbsPer100g: 41, fatPer100g: 4.2, fiberPer100g: 7 },
    { id: 10, name: 'Yogur natural', caloriesPer100g: 59, proteinPer100g: 10, carbsPer100g: 4, fatPer100g: 0.4, fiberPer100g: 0 },
  ];

  const mealTypes = [
    { value: 'DESAYUNO', label: 'Desayuno', color: '#4CAF50', icon: '🌅' },
    { value: 'ALMUERZO', label: 'Almuerzo', color: '#FF9800', icon: '☀️' },
    { value: 'CENA', label: 'Cena', color: '#2196F3', icon: '🌙' },
    { value: 'SNACK', label: 'Snack', color: '#9C27B0', icon: '🍪' }
  ];

  const mealLimits = {
    DESAYUNO: { min: 300, max: 600, target: 450 },
    ALMUERZO: { min: 400, max: 800, target: 600 },
    CENA: { min: 300, max: 700, target: 500 },
    SNACK: { min: 50, max: 300, target: 150 }
  };

  useEffect(() => {
    if (user) {
      loadNutritionData();
    } else {
      setLoading(false);
    }

    // Listen for profile updates
    const handleProfileUpdate = () => {
      console.log('Profile updated, reloading nutrition data...');
      if (user) {
        loadNutritionData();
      }
    };

    window.addEventListener('userProfileUpdated', handleProfileUpdate as EventListener);

    return () => {
      window.removeEventListener('userProfileUpdated', handleProfileUpdate as EventListener);
    };
  }, [user]);

  const loadNutritionData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const data = await dataIntegrationService.getDailyIntegratedData(today, user?.id);
      setIntegratedData(data);
    } catch (err: any) {
      console.error('Error loading nutrition:', err);
      setError('Error al cargar los datos nutricionales');
    } finally {
      setLoading(false);
    }
  };

  const searchFoods = async (query: string) => {
    if (!query.trim()) {
      setSearchResults(commonFoods);
      return;
    }
    
    try {
      setSearchLoading(true);
      // Buscar en alimentos comunes primero
      const localResults = commonFoods.filter(food => 
        food.name.toLowerCase().includes(query.toLowerCase())
      );
      
      // Intentar buscar en API
      try {
        const response = await apiService.searchFoods(query);
        const apiResults = response.data.content || [];
        setSearchResults([...localResults, ...apiResults]);
      } catch {
        setSearchResults(localResults);
      }
    } catch (err: any) {
      console.error('Error searching foods:', err);
      setSearchResults(commonFoods);
    } finally {
      setSearchLoading(false);
    }
  };

  const addFoodEntry = async () => {
    if (!selectedFood) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      await dataIntegrationService.addFoodEntry({
        food: selectedFood,
        quantity: quantity,
        mealType: mealType,
        date: today
      }, user?.id);

      await loadNutritionData();
      
      // Reset form
      setSelectedFood(null);
      setQuantity(100);
      setAddFoodDialog(false);
      setError(null);
    } catch (err: any) {
      console.error('Error adding food:', err);
      setError('Error al agregar el alimento');
    }
  };

  const deleteFoodEntry = async (entryId: number) => {
    try {
      await dataIntegrationService.deleteFoodEntry(entryId, user?.id);
      await loadNutritionData();
    } catch (err: any) {
      console.error('Error deleting food entry:', err);
      setError('Error al eliminar el alimento');
    }
  };

  const getMealEntries = (mealType: string) => {
    return integratedData?.mealBreakdown?.[mealType]?.entries || [];
  };

  const getMealCalories = (mealType: string) => {
    return integratedData?.mealBreakdown?.[mealType]?.calories || 0;
  };

  const getMealStatus = (mealType: string) => {
    return integratedData?.mealBreakdown?.[mealType] || { status: 'low', message: 'Sin datos' };
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
            Necesitas iniciar sesión para gestionar tu nutrición.
          </Alert>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              🍎 Nutrición
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gestiona tus comidas y mantén un seguimiento completo de tu nutrición
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setAddFoodDialog(true);
              searchFoods('');
            }}
            size="large"
          >
            Agregar Alimento
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Resumen Nutricional */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  📊 Resumen del Día
                </Typography>
                
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant="h2" fontWeight="bold" color="primary">
                    {Math.round(integratedData?.totalCaloriesConsumed || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    de 2000 calorías
                  </Typography>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={Math.min((integratedData?.totalCaloriesConsumed || 0) / 2000 * 100, 100)}
                  sx={{ mb: 3, height: 10, borderRadius: 5 }}
                />

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="error.main" fontWeight="bold">
                        {Math.round(integratedData?.macros?.protein || 0)}g
                      </Typography>
                      <Typography variant="caption">Proteínas</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="primary.main" fontWeight="bold">
                        {Math.round(integratedData?.macros?.carbs || 0)}g
                      </Typography>
                      <Typography variant="caption">Carbos</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="warning.main" fontWeight="bold">
                        {Math.round(integratedData?.macros?.fat || 0)}g
                      </Typography>
                      <Typography variant="caption">Grasas</Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={loadNutritionData}
                  startIcon={<Restaurant />}
                  sx={{ mt: 3 }}
                >
                  Actualizar Datos
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Comidas por Tipo */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  🍽️ Comidas de Hoy
                </Typography>
                
                {mealTypes.map((meal) => {
                  const entries = getMealEntries(meal.value);
                  const calories = getMealCalories(meal.value);
                  const limits = mealLimits[meal.value as keyof typeof mealLimits];
                  const status = getMealStatus(meal.value);
                  const progress = Math.min((calories / limits.target) * 100, 100);
                  
                  return (
                    <Box key={meal.value} sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h6">{meal.icon}</Typography>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {meal.label}
                          </Typography>
                          <Chip 
                            label={status.message} 
                            size="small" 
                            color={
                              status.status === 'good' ? 'success' : 
                              status.status === 'high' ? 'error' : 
                              status.status === 'low' ? 'warning' : 'info'
                            }
                            variant="outlined"
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {Math.round(calories)} / {limits.target} cal
                        </Typography>
                      </Box>
                      
                      <LinearProgress
                        variant="determinate"
                        value={progress}
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
                      
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        Rango recomendado: {limits.min} - {limits.max} calorías
                      </Typography>
                      
                      {entries.length > 0 && (
                        <List dense sx={{ mt: 1 }}>
                          {entries.map((entry: any) => (
                            <ListItem key={entry.id} sx={{ px: 0 }}>
                              <ListItemText
                                primary={entry.food.name}
                                secondary={`${entry.quantity}g - ${Math.round(entry.calories)} cal | P: ${Math.round(entry.protein)}g, C: ${Math.round(entry.carbs)}g, G: ${Math.round(entry.fat)}g`}
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
        </Grid>

        {/* Add Food Dialog */}
        <Dialog open={addFoodDialog} onClose={() => setAddFoodDialog(false)} maxWidth="md" fullWidth>
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
              {/* Meal Type Selection */}
              <Autocomplete
                options={mealTypes}
                getOptionLabel={(option) => `${option.icon} ${option.label}`}
                value={mealTypes.find(m => m.value === mealType) || mealTypes[0]}
                onChange={(_, newValue) => setMealType(newValue?.value || 'DESAYUNO')}
                renderInput={(params) => <TextField {...params} label="Tipo de comida" />}
              />
              
              {/* Quantity */}
              <TextField
                label="Cantidad (gramos)"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                inputProps={{ min: 1, max: 2000 }}
              />
              
              {/* Food Search */}
              <TextField
                label="Buscar alimento..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchFoods(e.target.value);
                }}
                InputProps={{
                  endAdornment: searchLoading && <CircularProgress size={20} />
                }}
              />
              
              {/* Selected Food Preview */}
              {selectedFood && (
                <Card variant="outlined" sx={{ p: 2, bgcolor: 'success.light' }}>
                  <Typography variant="h6" color="success.contrastText">{selectedFood.name}</Typography>
                  <Typography variant="body2" color="success.contrastText">
                    Por {quantity}g: {Math.round((selectedFood.caloriesPer100g * quantity) / 100)} calorías
                  </Typography>
                  <Typography variant="body2" color="success.contrastText">
                    P: {Math.round((selectedFood.proteinPer100g * quantity) / 100)}g | 
                    C: {Math.round((selectedFood.carbsPer100g * quantity) / 100)}g | 
                    G: {Math.round((selectedFood.fatPer100g * quantity) / 100)}g
                  </Typography>
                </Card>
              )}
              
              {/* Search Results */}
              <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                {searchResults.map((food) => (
                  <ListItem
                    key={food.id}
                    button
                    onClick={() => setSelectedFood(food)}
                    selected={selectedFood?.id === food.id}
                  >
                    <ListItemText
                      primary={food.name}
                      secondary={`${food.caloriesPer100g} cal/100g - P: ${food.proteinPer100g}g, C: ${food.carbsPer100g}g, G: ${food.fatPer100g}g`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddFoodDialog(false)}>Cancelar</Button>
            <Button
              onClick={addFoodEntry}
              variant="contained"
              disabled={!selectedFood}
              startIcon={<Add />}
            >
              Agregar Alimento
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
};

export default NutritionPage;
