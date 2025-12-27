import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, LinearProgress } from '@mui/material';
import { Restaurant, Add, Search } from '@mui/icons-material';

const NutritionPage: React.FC = () => {
  const meals = [
    { name: 'Desayuno', calories: 320, target: 400, color: '#4CAF50' },
    { name: 'Almuerzo', calories: 450, target: 600, color: '#FF9800' },
    { name: 'Cena', calories: 680, target: 700, color: '#2196F3' },
    { name: 'Snacks', calories: 150, target: 300, color: '#9C27B0' }
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        🍎 Nutrición
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Registra tus comidas y mantén un seguimiento de tu nutrición
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Comidas de Hoy
              </Typography>
              
              {meals.map((meal, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {meal.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {meal.calories} / {meal.target} cal
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(meal.calories / meal.target) * 100}
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
                </Box>
              ))}

              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button variant="contained" startIcon={<Add />} fullWidth>
                  Agregar Comida
                </Button>
                <Button variant="outlined" startIcon={<Search />} fullWidth>
                  Buscar Alimentos
                </Button>
              </Box>
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
                  1,600
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Calorías consumidas
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Proteínas</Typography>
                <Typography variant="body2" fontWeight="bold">85g</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Carbohidratos</Typography>
                <Typography variant="body2" fontWeight="bold">180g</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2">Grasas</Typography>
                <Typography variant="body2" fontWeight="bold">45g</Typography>
              </Box>

              <Button variant="outlined" fullWidth startIcon={<Restaurant />}>
                Ver Detalles
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NutritionPage;