'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Autocomplete,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Chip,
} from '@mui/material';
import {
  Restaurant,
  Add,
  Delete,
  Save,
  LocalDrink,
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { dataIntegrationService, IntegratedFoodEntry } from '@/services/dataIntegrationService';

interface Food {
  id: number;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number;
}

interface FoodEntry {
  id: number;
  food: Food;
  quantity: number;
  mealType: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  createdAt: string;
}

const AddFoodPage: React.FC = () => {
  const { user } = useAuth();
  const [foodEntries, setFoodEntries] = useState<IntegratedFoodEntry[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState<number>(100);
  const [mealType, setMealType] = useState<string>('DESAYUNO');
  const [customFoodName, setCustomFoodName] = useState('');
  const [customCalories, setCustomCalories] = useState<number>(0);
  const [customProtein, setCustomProtein] = useState<number>(0);
  const [customCarbs, setCustomCarbs] = useState<number>(0);
  const [customFat, setCustomFat] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Alimentos comunes predefinidos
  const commonFoods: Food[] = [
    { id: 1, name: 'Manzana', caloriesPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 14, fatPer100g: 0.2, fiberPer100g: 2.4 },
    { id: 2, name: 'Plátano', caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23, fatPer100g: 0.3, fiberPer100g: 2.6 },
    { id: 3, name: 'Pollo (pechuga)', caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6, fiberPer100g: 0 },
    { id: 4, name: 'Arroz blanco (cocido)', caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28, fatPer100g: 0.3, fiberPer100g: 0.4 },
    { id: 5, name: 'Huevo', caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 11, fiberPer100g: 0 },
    { id: 6, name: 'Avena', caloriesPer100g: 389, proteinPer100g: 17, carbsPer100g: 66, fatPer100g: 7, fiberPer100g: 10.6 },
    { id: 7, name: 'Salmón', caloriesPer100g: 208, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 13, fiberPer100g: 0 },
    { id: 8, name: 'Brócoli', caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 7, fatPer100g: 0.4, fiberPer100g: 2.6 },
    { id: 9, name: 'Pan integral', caloriesPer100g: 247, proteinPer100g: 13, carbsPer100g: 41, fatPer100g: 4.2, fiberPer100g: 7 },
    { id: 10, name: 'Yogur natural', caloriesPer100g: 59, proteinPer100g: 10, carbsPer100g: 4, fatPer100g: 0.4, fiberPer100g: 0 },
    { id: 11, name: 'Almendras', caloriesPer100g: 579, proteinPer100g: 21, carbsPer100g: 22, fatPer100g: 50, fiberPer100g: 12.5 },
    { id: 12, name: 'Pasta (cocida)', caloriesPer100g: 131, proteinPer100g: 5, carbsPer100g: 25, fatPer100g: 1.1, fiberPer100g: 1.8 },
  ];

  const mealTypes = [
    { value: 'DESAYUNO', label: 'Desayuno', color: '#4CAF50' },
    { value: 'ALMUERZO', label: 'Almuerzo', color: '#FF9800' },
    { value: 'CENA', label: 'Cena', color: '#2196F3' },
    { value: 'SNACK', label: 'Snack', color: '#9C27B0' }
  ];

  useEffect(() => {
    loadTodayEntries();
  }, [user]);

  const loadTodayEntries = async () => {
    try {
      setLoading(true);
      console.log('=== LOAD TODAY ENTRIES DEBUG ===');
      const today = new Date().toISOString().split('T')[0];
      console.log('Loading entries for date:', today);
      console.log('User ID:', user?.id);
      
      const integratedData = await dataIntegrationService.getDailyIntegratedData(today, user?.id);
      console.log('Integrated data received:', integratedData);
      console.log('Food entries count:', integratedData?.foodEntries?.length || 0);
      
      // Ensure we always set an array
      const entries = Array.isArray(integratedData?.foodEntries) ? integratedData.foodEntries : [];
      setFoodEntries(entries);
      console.log('Food entries set in state:', entries.length);
      console.log('================================');
    } catch (error: any) {
      console.error('Error loading food entries:', error);
      const errorMessage = `Error al cargar alimentos: ${error.message || error}`;
      setError(errorMessage);
      // Set empty array on error
      setFoodEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const addFoodEntry = async () => {
    if (!selectedFood && !customFoodName) return;

    try {
      setLoading(true);
      console.log('=== ADD FOOD ENTRY UI DEBUG ===');
      
      const food = selectedFood || {
        id: Date.now(),
        name: customFoodName,
        caloriesPer100g: customCalories,
        proteinPer100g: customProtein,
        carbsPer100g: customCarbs,
        fatPer100g: customFat,
        fiberPer100g: 0
      };

      const today = new Date().toISOString().split('T')[0];

      console.log('Food to add:', food);
      console.log('Quantity:', quantity);
      console.log('Meal type:', mealType);
      console.log('Date:', today);
      console.log('User:', user);

      // Use integrated data service
      await dataIntegrationService.addFoodEntry({
        food: food,
        quantity: quantity,
        mealType: mealType,
        date: today
      }, user?.id);

      console.log('Food entry added successfully, reloading entries...');

      // Reload entries
      await loadTodayEntries();

      // Reset form
      setSelectedFood(null);
      setQuantity(100);
      setCustomFoodName('');
      setCustomCalories(0);
      setCustomProtein(0);
      setCustomCarbs(0);
      setCustomFat(0);
      
      console.log('Form reset and entries reloaded');
      console.log('===============================');
    } catch (error: any) {
      console.error('Error adding food entry:', error);
      const errorMessage = `Error al agregar alimento: ${error.message || 'Error desconocido'}`;
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteFoodEntry = async (entryId: number) => {
    try {
      await dataIntegrationService.deleteFoodEntry(entryId, user?.id);
      await loadTodayEntries();
    } catch (error) {
      console.error('Error deleting food entry:', error);
    }
  };

  const getTodayEntries = () => {
    return Array.isArray(foodEntries) ? foodEntries : []; // Ensure it's always an array
  };

  const getMealEntries = (mealType: string) => {
    const entries = getTodayEntries();
    return entries.filter(entry => entry.mealType === mealType);
  };

  const getTotalCalories = () => {
    const entries = getTodayEntries();
    return entries.reduce((total, entry) => total + (entry.calories || 0), 0);
  };

  const getTotalMacros = () => {
    const entries = getTodayEntries();
    return {
      protein: entries.reduce((total, entry) => total + (entry.protein || 0), 0),
      carbs: entries.reduce((total, entry) => total + (entry.carbs || 0), 0),
      fat: entries.reduce((total, entry) => total + (entry.fat || 0), 0),
    };
  };

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

  const macros = getTotalMacros();

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          🍎 Agregar Alimentos
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Registra tus comidas manualmente (datos guardados localmente)
        </Typography>

        <Alert severity="success" sx={{ mb: 3 }}>
          ✅ Ahora integrado con el sistema principal. Los datos se sincronizan automáticamente con Dashboard y Gestión de Alimentos.
          <Box sx={{ mt: 1 }}>
            <Button 
              size="small" 
              onClick={async () => {
                const today = new Date().toISOString().split('T')[0];
                console.log('=== DEBUG BUTTON CLICKED ===');
                console.log('Current food entries state:', foodEntries);
                console.log('LocalStorage keys:');
                console.log('- fitlife_food_entries:', localStorage.getItem('fitlife_food_entries'));
                console.log('- fitlife_integrated_food_entries:', localStorage.getItem('fitlife_integrated_food_entries'));
                
                const debugInfo = await dataIntegrationService.debugDataSources(today, user?.id);
                alert(`Debug Info:\nLegacy: ${debugInfo.sources.legacy.entries}\nIntegrated: ${debugInfo.sources.integrated.entries}\nAPI: ${debugInfo.sources.api.entries}\nFinal: ${debugInfo.finalData?.foodEntries?.length || 0}`);
              }}
            >
              🔧 Debug Datos
            </Button>
          </Box>
        </Alert>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Formulario de agregar alimento */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Agregar Alimento
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Autocomplete
                    options={mealTypes}
                    getOptionLabel={(option) => option.label}
                    value={mealTypes.find(m => m.value === mealType) || mealTypes[0]}
                    onChange={(_, newValue) => setMealType(newValue?.value || 'DESAYUNO')}
                    renderInput={(params) => <TextField {...params} label="Tipo de comida" />}
                  />

                  <Autocomplete
                    options={commonFoods}
                    getOptionLabel={(option) => option.name}
                    value={selectedFood}
                    onChange={(_, newValue) => {
                      setSelectedFood(newValue);
                      if (newValue) {
                        setCustomFoodName('');
                        setCustomCalories(0);
                        setCustomProtein(0);
                        setCustomCarbs(0);
                        setCustomFat(0);
                      }
                    }}
                    renderInput={(params) => <TextField {...params} label="Buscar alimento" />}
                  />

                  <Divider>O agregar alimento personalizado</Divider>

                  <TextField
                    label="Nombre del alimento"
                    value={customFoodName}
                    onChange={(e) => {
                      setCustomFoodName(e.target.value);
                      if (e.target.value) {
                        setSelectedFood(null);
                      }
                    }}
                  />

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        label="Calorías/100g"
                        type="number"
                        value={customCalories}
                        onChange={(e) => setCustomCalories(Number(e.target.value))}
                        disabled={!!selectedFood}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Proteína/100g"
                        type="number"
                        value={customProtein}
                        onChange={(e) => setCustomProtein(Number(e.target.value))}
                        disabled={!!selectedFood}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Carbohidratos/100g"
                        type="number"
                        value={customCarbs}
                        onChange={(e) => setCustomCarbs(Number(e.target.value))}
                        disabled={!!selectedFood}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Grasas/100g"
                        type="number"
                        value={customFat}
                        onChange={(e) => setCustomFat(Number(e.target.value))}
                        disabled={!!selectedFood}
                      />
                    </Grid>
                  </Grid>

                  <TextField
                    label="Cantidad (gramos)"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    inputProps={{ min: 1, max: 2000 }}
                  />

                  {(selectedFood || customFoodName) && (
                    <Card variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Información nutricional por {quantity}g:
                      </Typography>
                      <Typography variant="body2">
                        Calorías: {Math.round(((selectedFood?.caloriesPer100g || customCalories) * quantity) / 100)}
                      </Typography>
                      <Typography variant="body2">
                        Proteína: {Math.round(((selectedFood?.proteinPer100g || customProtein) * quantity) / 100)}g
                      </Typography>
                      <Typography variant="body2">
                        Carbohidratos: {Math.round(((selectedFood?.carbsPer100g || customCarbs) * quantity) / 100)}g
                      </Typography>
                      <Typography variant="body2">
                        Grasas: {Math.round(((selectedFood?.fatPer100g || customFat) * quantity) / 100)}g
                      </Typography>
                    </Card>
                  )}

                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={addFoodEntry}
                    disabled={(!selectedFood && !customFoodName) || loading}
                    fullWidth
                  >
                    {loading ? 'Agregando...' : 'Agregar Alimento'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Resumen del día */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Resumen de Hoy
                </Typography>

                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant="h3" fontWeight="bold" color="primary">
                    {Math.round(getTotalCalories())}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Calorías totales
                  </Typography>
                </Box>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="error.main">
                        {Math.round(macros.protein)}g
                      </Typography>
                      <Typography variant="body2">Proteína</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="primary.main">
                        {Math.round(macros.carbs)}g
                      </Typography>
                      <Typography variant="body2">Carbohidratos</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="warning.main">
                        {Math.round(macros.fat)}g
                      </Typography>
                      <Typography variant="body2">Grasas</Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Comidas por tipo:
                </Typography>

                {mealTypes.map((meal) => {
                  const entries = getMealEntries(meal.value);
                  const calories = entries.reduce((total, entry) => total + entry.calories, 0);
                  
                  return (
                    <Box key={meal.value} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip 
                          label={meal.label} 
                          size="small" 
                          sx={{ bgcolor: meal.color, color: 'white' }}
                        />
                        <Typography variant="body2">
                          {Math.round(calories)} cal ({entries.length} alimentos)
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </CardContent>
            </Card>
          </Grid>

          {/* Lista de alimentos del día */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Alimentos de Hoy ({foodEntries.length})
                </Typography>

                {foodEntries.length === 0 ? (
                  <Alert severity="info">
                    No has registrado alimentos hoy. ¡Comienza agregando tu primera comida!
                  </Alert>
                ) : (
                  <List>
                    {foodEntries.map((entry) => (
                      <ListItem key={entry.id}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip 
                                label={mealTypes.find(m => m.value === entry.mealType)?.label} 
                                size="small"
                                sx={{ 
                                  bgcolor: mealTypes.find(m => m.value === entry.mealType)?.color,
                                  color: 'white'
                                }}
                              />
                              <Typography variant="subtitle1">{entry.food.name}</Typography>
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              {entry.quantity}g - {Math.round(entry.calories)} cal | 
                              P: {Math.round(entry.protein)}g | 
                              C: {Math.round(entry.carbs)}g | 
                              G: {Math.round(entry.fat)}g
                            </Typography>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => deleteFoodEntry(entry.id)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}

                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Restaurant />}
                    href="/nutrition"
                  >
                    Gestión de Alimentos
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Restaurant />}
                    href="/nutrition"
                  >
                    Ver Nutrición
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<LocalDrink />}
                    href="/dashboard"
                  >
                    Dashboard
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </MainLayout>
  );
};

export default AddFoodPage;