'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, Alert, CircularProgress, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Divider, Autocomplete } from '@mui/material';
import { FitnessCenter, Add, Delete, Close, Edit, PlayArrow, AddCircleOutline } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { dataIntegrationService, IntegratedExerciseEntry } from '@/services/dataIntegrationService';
import { exerciseRecommendationService, SimpleExerciseRecommendation } from '@/services/exerciseRecommendationService';

interface Exercise {
  id: number;
  name: string;
  category: string;
  caloriesPerMinute: number;
  icon?: string;
}

const COMMON_EXERCISES = [
  { name: 'Correr', category: 'Cardio', caloriesPerMinute: 10, icon: '🏃‍♂️' },
  { name: 'Caminar', category: 'Cardio', caloriesPerMinute: 4, icon: '🚶‍♂️' },
  { name: 'Ciclismo', category: 'Cardio', caloriesPerMinute: 8, icon: '🚴‍♂️' },
  { name: 'Natación', category: 'Cardio', caloriesPerMinute: 11, icon: '🏊‍♂️' },
  { name: 'Saltar la cuerda', category: 'Cardio', caloriesPerMinute: 13, icon: '🪢' },
  { name: 'Burpees', category: 'HIIT', caloriesPerMinute: 12, icon: '🔥' },
  { name: 'Sentadillas', category: 'Fuerza', caloriesPerMinute: 6, icon: '🏋️‍♂️' },
  { name: 'Flexiones', category: 'Fuerza', caloriesPerMinute: 8, icon: '💪' },
  { name: 'Dominadas', category: 'Fuerza', caloriesPerMinute: 9, icon: '🤸' },
  { name: 'Plancha', category: 'Core', caloriesPerMinute: 5, icon: '🧘‍♂️' },
  { name: 'Abdominales', category: 'Core', caloriesPerMinute: 7, icon: '💪' },
  { name: 'Yoga', category: 'Flexibilidad', caloriesPerMinute: 3, icon: '🧘‍♀️' },
  { name: 'Estiramientos', category: 'Flexibilidad', caloriesPerMinute: 2, icon: '🧘' },
  { name: 'Pilates', category: 'Flexibilidad', caloriesPerMinute: 4, icon: '🤸‍♀️' },
  { name: 'Zumba', category: 'Cardio', caloriesPerMinute: 9, icon: '💃' },
  { name: 'Spinning', category: 'Cardio', caloriesPerMinute: 10, icon: '🚴' },
  { name: 'Remo', category: 'Cardio', caloriesPerMinute: 9, icon: '🚣' },
  { name: 'Boxeo', category: 'HIIT', caloriesPerMinute: 11, icon: '🥊' },
  { name: 'Escaladora', category: 'Cardio', caloriesPerMinute: 8, icon: '🪜' },
  { name: 'Elíptica', category: 'Cardio', caloriesPerMinute: 7, icon: '⚙️' },
];

const CATEGORIES = ['Cardio', 'Fuerza', 'HIIT', 'Core', 'Flexibilidad', 'Otro'];
const ICONS = ['🏃‍♂️', '🚶‍♂️', '🚴‍♂️', '🏊‍♂️', '🏋️‍♂️', '💪', '🔥', '🧘‍♂️', '🧘‍♀️', '⚡', '💯', '🎯'];

const ExercisePage: React.FC = () => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<IntegratedExerciseEntry[]>([]);
  const [recommendations, setRecommendations] = useState<SimpleExerciseRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addDialog, setAddDialog] = useState(false);
  const [customDialog, setCustomDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<SimpleExerciseRecommendation | null>(null);
  const [editingExercise, setEditingExercise] = useState<IntegratedExerciseEntry | null>(null);
  const [actualDuration, setActualDuration] = useState<number>(30);
  const [actualSets, setActualSets] = useState<number>(3);
  const [actualReps, setActualReps] = useState<number>(10);
  const [actualWeight, setActualWeight] = useState<number>(0);
  const [editDuration, setEditDuration] = useState<number>(30);
  const [editSets, setEditSets] = useState<number>(3);
  const [editReps, setEditReps] = useState<number>(10);
  const [editWeight, setEditWeight] = useState<number>(0);
  const [customExerciseName, setCustomExerciseName] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<string>('Cardio');
  const [customCaloriesPerMin, setCustomCaloriesPerMin] = useState<number>(5);
  const [customIcon, setCustomIcon] = useState<string>('🏃‍♂️');
  const [customDuration, setCustomDuration] = useState<number>(30);
  const [customSets, setCustomSets] = useState<number>(3);
  const [customReps, setCustomReps] = useState<number>(10);
  const [customWeight, setCustomWeight] = useState<number>(0);

  useEffect(() => {
    if (user) {
      loadTodayExercises();
      loadRecommendations();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadTodayExercises = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const data = await dataIntegrationService.getDailyIntegratedData(today, user?.id);
      setExercises(data.exerciseEntries || []);
    } catch (err: any) {
      console.error('Error loading exercises:', err);
      setError('Error al cargar los ejercicios');
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = () => {
    const goalConfig = { goal: 'MAINTAIN' as const, currentWeight: 70, targetWeight: 70, height: 170, activityLevel: 'MODERATE' as const };
    const recs = exerciseRecommendationService.getRecommendedExercises(goalConfig);
    setRecommendations(recs);
  };

  const getTotalStats = () => {
    const totalDuration = exercises.reduce((sum, ex) => sum + ex.duration, 0);
    const totalCalories = exercises.reduce((sum, ex) => sum + ex.caloriesBurned, 0);
    return { totalDuration, totalCalories };
  };

  const getExercisesByCategory = () => {
    const categories: { [key: string]: IntegratedExerciseEntry[] } = {};
    exercises.forEach(ex => {
      const category = ex.exercise.category || 'Otros';
      if (!categories[category]) categories[category] = [];
      categories[category].push(ex);
    });
    return categories;
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const exerciseDate = new Date(date);
    const diffMs = now.getTime() - exerciseDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `Hace ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;
    return exerciseDate.toLocaleDateString();
  };

  const handleSelectRecommendation = (rec: SimpleExerciseRecommendation) => {
    setSelectedRecommendation(rec);
    setActualDuration(rec.duration);
    setActualSets(3);
    setActualReps(10);
    setActualWeight(0);
    setAddDialog(true);
  };

  const handleOpenCustomDialog = () => {
    setCustomExerciseName('');
    setCustomCategory('Cardio');
    setCustomCaloriesPerMin(5);
    setCustomIcon('🏃‍♂️');
    setCustomDuration(30);
    setCustomSets(3);
    setCustomReps(10);
    setCustomWeight(0);
    setCustomDialog(true);
  };

  const handleSelectCommonExercise = (exercise: typeof COMMON_EXERCISES[0]) => {
    setCustomExerciseName(exercise.name);
    setCustomCategory(exercise.category);
    setCustomCaloriesPerMin(exercise.caloriesPerMinute);
    setCustomIcon(exercise.icon);
  };

  const addExerciseEntry = async () => {
    if (!selectedRecommendation) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const exercise: Exercise = { id: Date.now(), name: selectedRecommendation.name, category: selectedRecommendation.category, caloriesPerMinute: selectedRecommendation.caloriesPerMinute, icon: selectedRecommendation.icon };
      await dataIntegrationService.addExerciseEntry({ exercise: exercise, duration: actualDuration, sets: actualSets, reps: actualReps, weight: actualWeight, date: today }, user?.id);
      await loadTodayExercises();
      setSelectedRecommendation(null);
      setActualDuration(30);
      setActualSets(3);
      setActualReps(10);
      setActualWeight(0);
      setAddDialog(false);
      setError(null);
    } catch (err: any) {
      console.error('Error adding exercise:', err);
      setError('Error al agregar el ejercicio');
    }
  };

  const addCustomExercise = async () => {
    if (!customExerciseName.trim()) {
      setError('El nombre del ejercicio es requerido');
      return;
    }
    try {
      const today = new Date().toISOString().split('T')[0];
      const exercise: Exercise = { id: Date.now(), name: customExerciseName, category: customCategory, caloriesPerMinute: customCaloriesPerMin, icon: customIcon };
      await dataIntegrationService.addExerciseEntry({ exercise: exercise, duration: customDuration, sets: customSets, reps: customReps, weight: customWeight, date: today }, user?.id);
      await loadTodayExercises();
      setCustomDialog(false);
      setError(null);
    } catch (err: any) {
      console.error('Error adding custom exercise:', err);
      setError('Error al agregar el ejercicio personalizado');
    }
  };

  const handleEditEntry = (entry: IntegratedExerciseEntry) => {
    setEditingExercise(entry);
    setEditDuration(entry.duration);
    setEditSets(entry.sets || 3);
    setEditReps(entry.reps || 10);
    setEditWeight(entry.weight || 0);
    setEditDialog(true);
  };

  const updateExerciseEntry = async () => {
    if (!editingExercise) return;
    try {
      await dataIntegrationService.deleteExerciseEntry(editingExercise.id, user?.id);
      const today = new Date().toISOString().split('T')[0];
      await dataIntegrationService.addExerciseEntry({ exercise: editingExercise.exercise, duration: editDuration, sets: editSets, reps: editReps, weight: editWeight, date: today }, user?.id);
      await loadTodayExercises();
      setEditingExercise(null);
      setEditDialog(false);
      setError(null);
    } catch (err: any) {
      console.error('Error updating exercise:', err);
      setError('Error al actualizar el ejercicio');
    }
  };

  const deleteExerciseEntry = async (entryId: number) => {
    try {
      await dataIntegrationService.deleteExerciseEntry(entryId, user?.id);
      await loadTodayExercises();
    } catch (err: any) {
      console.error('Error deleting exercise:', err);
      setError('Error al eliminar el ejercicio');
    }
  };

  const { totalDuration, totalCalories } = getTotalStats();
  const exercisesByCategory = getExercisesByCategory();

  if (loading) {
    return (<MainLayout><Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><CircularProgress /></Box></MainLayout>);
  }

  if (!user) {
    return (<MainLayout><Box sx={{ p: 3 }}><Alert severity="warning">Necesitas iniciar sesión para gestionar tus ejercicios.</Alert></Box></MainLayout>);
  }

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box><Typography variant="h4" fontWeight="bold">💪 Ejercicios</Typography><Typography variant="body1" color="text.secondary">Registra tus entrenamientos y quema calorías</Typography></Box>
        </Box>
        {error && (<Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>)}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}><CardContent><Typography variant="h6" fontWeight="bold" gutterBottom>📊 Resumen del Día</Typography><Box sx={{ textAlign: 'center', mb: 3 }}><Typography variant="h2" fontWeight="bold" color="error">{Math.round(totalCalories)}</Typography><Typography variant="body2" color="text.secondary">calorías quemadas</Typography></Box><Divider sx={{ my: 2 }} /><Grid container spacing={2}><Grid item xs={6}><Box sx={{ textAlign: 'center' }}><Typography variant="h6" color="primary.main" fontWeight="bold">{totalDuration}</Typography><Typography variant="caption">Minutos</Typography></Box></Grid><Grid item xs={6}><Box sx={{ textAlign: 'center' }}><Typography variant="h6" color="success.main" fontWeight="bold">{exercises.length}</Typography><Typography variant="caption">Ejercicios</Typography></Box></Grid></Grid><Button variant="outlined" fullWidth onClick={loadTodayExercises} startIcon={<FitnessCenter />} sx={{ mt: 3 }}>Actualizar Datos</Button></CardContent></Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Card><CardContent><Typography variant="h6" fontWeight="bold" gutterBottom>🏋️ Ejercicios de Hoy</Typography>{exercises.length === 0 ? (<Alert severity="info">No has registrado ejercicios hoy. ¡Comienza ahora!</Alert>) : (Object.entries(exercisesByCategory).map(([category, categoryExercises]) => (<Box key={category} sx={{ mb: 3 }}><Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>{category}</Typography><List dense>{categoryExercises.map((entry) => (<ListItem key={entry.id} sx={{ px: 0, bgcolor: 'background.paper', mb: 1, borderRadius: 1 }}><ListItemText primary={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Typography>{entry.exercise.icon || '🏃'}</Typography><Typography fontWeight="bold">{entry.exercise.name}</Typography><Chip label={`${Math.round(entry.caloriesBurned)} cal`} size="small" color="error" /></Box>} secondary={<Box><Typography variant="body2">Duración: {entry.duration} min{entry.sets && entry.reps && ` | ${entry.sets} series × ${entry.reps} reps`}{entry.weight && entry.weight > 0 && ` | ${entry.weight} kg`}</Typography><Typography variant="caption" color="text.secondary">{formatTimeAgo(entry.date)}</Typography></Box>} /><ListItemSecondaryAction><IconButton edge="end" size="small" onClick={() => handleEditEntry(entry)} sx={{ mr: 1 }}><Edit fontSize="small" /></IconButton><IconButton edge="end" size="small" onClick={() => deleteExerciseEntry(entry.id)}><Delete fontSize="small" /></IconButton></ListItemSecondaryAction></ListItem>))}</List></Box>)))}</CardContent></Card>
          </Grid>
          <Grid item xs={12}>
            <Card><CardContent><Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}><Box><Typography variant="h6" fontWeight="bold">⭐ Ejercicios Recomendados</Typography><Typography variant="body2" color="text.secondary">Basados en tu objetivo de fitness</Typography></Box><Button type="button" variant="outlined" startIcon={<AddCircleOutline />} onClick={handleOpenCustomDialog}>Agregar Personalizado</Button></Box><Grid container spacing={2} sx={{ mt: 1 }}>{recommendations.map((rec, index) => (<Grid item xs={12} sm={6} md={4} key={index}><Card variant="outlined" sx={{ height: '100%' }}><CardContent><Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}><Typography variant="h4">{rec.icon}</Typography><Box><Typography variant="subtitle1" fontWeight="bold">{rec.name}</Typography><Chip label={rec.category} size="small" variant="outlined" /></Box></Box><Typography variant="body2" color="text.secondary" gutterBottom>Duración recomendada: {rec.duration} min</Typography><Typography variant="body2" color="error.main" fontWeight="bold" gutterBottom>~{Math.round(rec.caloriesPerMinute * rec.duration)} calorías</Typography><Button type="button" variant="contained" fullWidth startIcon={<PlayArrow />} onClick={() => handleSelectRecommendation(rec)} sx={{ mt: 2 }}>Comenzar</Button></CardContent></Card></Grid>))}</Grid></CardContent></Card>
          </Grid>
        </Grid>
        <Dialog open={addDialog} onClose={() => setAddDialog(false)} maxWidth="sm" fullWidth><DialogTitle>Registrar Ejercicio<IconButton onClick={() => setAddDialog(false)} sx={{ position: 'absolute', right: 8, top: 8 }}><Close /></IconButton></DialogTitle><DialogContent>{selectedRecommendation && (<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}><Alert severity="info"><Typography variant="subtitle2" fontWeight="bold">{selectedRecommendation.icon} {selectedRecommendation.name}</Typography><Typography variant="body2">{selectedRecommendation.category} - {selectedRecommendation.caloriesPerMinute} cal/min</Typography></Alert><TextField label="Duración real (minutos)" type="number" value={actualDuration} onChange={(e) => setActualDuration(Number(e.target.value))} inputProps={{ min: 1, max: 300 }} fullWidth /><Alert severity="success"><Typography variant="body2" fontWeight="bold">Calorías quemadas: {Math.round(selectedRecommendation.caloriesPerMinute * actualDuration)} cal</Typography></Alert>{selectedRecommendation.category === 'Fuerza' && (<><TextField label="Series realizadas" type="number" value={actualSets} onChange={(e) => setActualSets(Number(e.target.value))} inputProps={{ min: 1, max: 20 }} fullWidth /><TextField label="Repeticiones por serie" type="number" value={actualReps} onChange={(e) => setActualReps(Number(e.target.value))} inputProps={{ min: 1, max: 100 }} fullWidth /><TextField label="Peso utilizado (kg)" type="number" value={actualWeight} onChange={(e) => setActualWeight(Number(e.target.value))} inputProps={{ min: 0, max: 500 }} fullWidth /><Alert severity="info"><Typography variant="body2">Total de repeticiones: {actualSets * actualReps}</Typography></Alert></>)}</Box>)}</DialogContent><DialogActions><Button type="button" onClick={() => setAddDialog(false)}>Cancelar</Button><Button type="button" onClick={addExerciseEntry} variant="contained" disabled={!selectedRecommendation || actualDuration <= 0} startIcon={<Add />}>Registrar Ejercicio</Button></DialogActions></Dialog>
        <Dialog open={customDialog} onClose={() => setCustomDialog(false)} maxWidth="md" fullWidth><DialogTitle>Agregar Ejercicio Personalizado<IconButton onClick={() => setCustomDialog(false)} sx={{ position: 'absolute', right: 8, top: 8 }}><Close /></IconButton></DialogTitle><DialogContent><Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}><Typography variant="subtitle2" color="text.secondary">Selecciona un ejercicio común o crea uno personalizado</Typography><Autocomplete options={COMMON_EXERCISES} getOptionLabel={(option) => `${option.icon} ${option.name} (${option.category})`} onChange={(_, value) => value && handleSelectCommonExercise(value)} renderInput={(params) => <TextField {...params} label="Buscar ejercicio común" placeholder="Ej: Correr, Natación..." />} /><Divider><Chip label="O crea uno personalizado" size="small" /></Divider><Grid container spacing={2}><Grid item xs={12} sm={8}><TextField label="Nombre del ejercicio" value={customExerciseName} onChange={(e) => setCustomExerciseName(e.target.value)} placeholder="Ej: Entrenamiento funcional" fullWidth required /></Grid><Grid item xs={12} sm={4}><Autocomplete options={ICONS} getOptionLabel={(option) => option} value={customIcon} onChange={(_, value) => setCustomIcon(value || '🏃‍♂️')} renderInput={(params) => <TextField {...params} label="Icono" />} /></Grid><Grid item xs={12} sm={6}><Autocomplete options={CATEGORIES} value={customCategory} onChange={(_, value) => setCustomCategory(value || 'Cardio')} renderInput={(params) => <TextField {...params} label="Categoría" />} /></Grid><Grid item xs={12} sm={6}><TextField label="Calorías por minuto" type="number" value={customCaloriesPerMin} onChange={(e) => setCustomCaloriesPerMin(Number(e.target.value))} inputProps={{ min: 1, max: 20 }} fullWidth /></Grid><Grid item xs={12} sm={6}><TextField label="Duración (minutos)" type="number" value={customDuration} onChange={(e) => setCustomDuration(Number(e.target.value))} inputProps={{ min: 1, max: 300 }} fullWidth /></Grid><Grid item xs={12} sm={6}><Alert severity="success"><Typography variant="body2" fontWeight="bold">Calorías: {Math.round(customCaloriesPerMin * customDuration)} cal</Typography></Alert></Grid></Grid>{(customCategory === 'Fuerza' || customCategory === 'Core') && (<><Divider sx={{ my: 1 }}><Chip label="Datos de fuerza (opcional)" size="small" /></Divider><Grid container spacing={2}><Grid item xs={4}><TextField label="Series" type="number" value={customSets} onChange={(e) => setCustomSets(Number(e.target.value))} inputProps={{ min: 1, max: 20 }} fullWidth /></Grid><Grid item xs={4}><TextField label="Repeticiones" type="number" value={customReps} onChange={(e) => setCustomReps(Number(e.target.value))} inputProps={{ min: 1, max: 100 }} fullWidth /></Grid><Grid item xs={4}><TextField label="Peso (kg)" type="number" value={customWeight} onChange={(e) => setCustomWeight(Number(e.target.value))} inputProps={{ min: 0, max: 500 }} fullWidth /></Grid></Grid></>)}</Box></DialogContent><DialogActions><Button type="button" onClick={() => setCustomDialog(false)}>Cancelar</Button><Button type="button" onClick={addCustomExercise} variant="contained" disabled={!customExerciseName.trim() || customDuration <= 0} startIcon={<Add />}>Agregar Ejercicio</Button></DialogActions></Dialog>
        <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth><DialogTitle>Editar Ejercicio<IconButton onClick={() => setEditDialog(false)} sx={{ position: 'absolute', right: 8, top: 8 }}><Close /></IconButton></DialogTitle><DialogContent>{editingExercise && (<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}><Alert severity="info"><Typography variant="subtitle2" fontWeight="bold">{editingExercise.exercise.icon || '🏃'} {editingExercise.exercise.name}</Typography><Typography variant="body2">{editingExercise.exercise.category} - {editingExercise.exercise.caloriesPerMinute} cal/min</Typography></Alert><TextField label="Duración real (minutos)" type="number" value={editDuration} onChange={(e) => setEditDuration(Number(e.target.value))} inputProps={{ min: 1, max: 300 }} fullWidth /><Alert severity="success"><Typography variant="body2" fontWeight="bold">Calorías quemadas: {Math.round(editingExercise.exercise.caloriesPerMinute * editDuration)} cal</Typography></Alert>{editingExercise.exercise.category === 'Fuerza' && (<><TextField label="Series realizadas" type="number" value={editSets} onChange={(e) => setEditSets(Number(e.target.value))} inputProps={{ min: 1, max: 20 }} fullWidth /><TextField label="Repeticiones por serie" type="number" value={editReps} onChange={(e) => setEditReps(Number(e.target.value))} inputProps={{ min: 1, max: 100 }} fullWidth /><TextField label="Peso utilizado (kg)" type="number" value={editWeight} onChange={(e) => setEditWeight(Number(e.target.value))} inputProps={{ min: 0, max: 500 }} fullWidth /><Alert severity="info"><Typography variant="body2">Total de repeticiones: {editSets * editReps}</Typography></Alert></>)}</Box>)}</DialogContent><DialogActions><Button type="button" onClick={() => setEditDialog(false)}>Cancelar</Button><Button type="button" onClick={updateExerciseEntry} variant="contained" disabled={!editingExercise || editDuration <= 0} startIcon={<Edit />}>Guardar Cambios</Button></DialogActions></Dialog>
      </Box>
    </MainLayout>
  );
};

export default ExercisePage;
