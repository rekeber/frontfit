'use client';

import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, Chip } from '@mui/material';
import { FitnessCenter, Timer, LocalFireDepartment } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';

const ExercisePage: React.FC = () => {
  const exercises = [
    {
      name: 'Cardio HIIT',
      duration: '30 min',
      calories: '250 cal',
      difficulty: 'Intermedio',
      category: 'Cardio'
    },
    {
      name: 'Entrenamiento de Fuerza',
      duration: '45 min',
      calories: '180 cal',
      difficulty: 'Avanzado',
      category: 'Fuerza'
    },
    {
      name: 'Yoga Matutino',
      duration: '20 min',
      calories: '80 cal',
      difficulty: 'Principiante',
      category: 'Flexibilidad'
    }
  ];

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          💪 Ejercicios
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Mantente activo con nuestros entrenamientos personalizados
        </Typography>

        <Grid container spacing={3}>
          {exercises.map((exercise, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <FitnessCenter color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold">
                      {exercise.name}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip 
                      label={exercise.category} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                    <Chip 
                      label={exercise.difficulty} 
                      size="small" 
                      color="secondary" 
                      variant="outlined" 
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Timer fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2">{exercise.duration}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocalFireDepartment fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2">{exercise.calories}</Typography>
                    </Box>
                  </Box>

                  <Button variant="contained" fullWidth>
                    Comenzar Entrenamiento
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </MainLayout>
  );
};

export default ExercisePage;