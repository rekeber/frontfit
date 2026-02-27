'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Delete,
  Refresh,
  CheckCircle,
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';

const DebugClearPage: React.FC = () => {
  const [cleared, setCleared] = useState(false);
  const [dataInfo, setDataInfo] = useState<any>(null);

  const checkData = () => {
    const info = {
      tokens: {
        accessToken: !!localStorage.getItem('fitlife_access_token'),
        refreshToken: !!localStorage.getItem('fitlife_refresh_token'),
      },
      foodEntries: localStorage.getItem('fitlife_integrated_food_entries') ? 
        JSON.parse(localStorage.getItem('fitlife_integrated_food_entries')!).length : 0,
      exerciseEntries: localStorage.getItem('fitlife_integrated_exercise_entries') ? 
        JSON.parse(localStorage.getItem('fitlife_integrated_exercise_entries')!).length : 0,
      waterIntake: localStorage.getItem('fitlife_integrated_water_intake') ? 
        Object.keys(JSON.parse(localStorage.getItem('fitlife_integrated_water_intake')!)).length : 0,
      legacyFood: localStorage.getItem('fitlife_food_entries') ? 
        JSON.parse(localStorage.getItem('fitlife_food_entries')!).length : 0,
    };
    setDataInfo(info);
  };

  const clearAllData = () => {
    // Limpiar tokens
    localStorage.removeItem('fitlife_access_token');
    localStorage.removeItem('fitlife_refresh_token');
    localStorage.removeItem('fitlife_token_expiry');
    localStorage.removeItem('fitlife_user_id');
    localStorage.removeItem('fitlife_user_email');
    localStorage.removeItem('fitlife_user_name');

    // Limpiar datos de comida y ejercicio
    localStorage.removeItem('fitlife_integrated_food_entries');
    localStorage.removeItem('fitlife_integrated_exercise_entries');
    localStorage.removeItem('fitlife_integrated_water_intake');
    localStorage.removeItem('fitlife_food_entries');
    localStorage.removeItem('fitlife_exercise_entries');

    // Limpiar historial de perfil
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('fitlife_profile_history_')) {
        localStorage.removeItem(key);
      }
    });

    setCleared(true);
    setDataInfo(null);
  };

  const clearOnlyData = () => {
    // Solo limpiar datos, mantener tokens
    localStorage.removeItem('fitlife_integrated_food_entries');
    localStorage.removeItem('fitlife_integrated_exercise_entries');
    localStorage.removeItem('fitlife_integrated_water_intake');
    localStorage.removeItem('fitlife_food_entries');
    localStorage.removeItem('fitlife_exercise_entries');

    setCleared(true);
    setDataInfo(null);
  };

  const goToLogin = () => {
    window.location.href = '/login';
  };

  React.useEffect(() => {
    checkData();
  }, []);

  return (
    <MainLayout>
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h4" gutterBottom>
          🔧 Herramientas de Depuración
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Usa estas herramientas para solucionar problemas con datos o tokens.
        </Typography>

        {cleared && (
          <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircle />}>
            Datos limpiados correctamente. Haz clic en "Ir a Login" para iniciar sesión nuevamente.
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Información de Datos */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📊 Estado Actual de Datos
                </Typography>
                
                {dataInfo && (
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary="Tokens de Autenticación" 
                        secondary={dataInfo.tokens.accessToken ? 'Presente' : 'No encontrado'} 
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText 
                        primary="Entradas de Comida" 
                        secondary={`${dataInfo.foodEntries} registros`} 
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText 
                        primary="Entradas de Ejercicio" 
                        secondary={`${dataInfo.exerciseEntries} registros`} 
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText 
                        primary="Registros de Agua" 
                        secondary={`${dataInfo.waterIntake} días`} 
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText 
                        primary="Datos Legacy" 
                        secondary={`${dataInfo.legacyFood} registros antiguos`} 
                      />
                    </ListItem>
                  </List>
                )}

                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={checkData}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Actualizar Estado
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Acciones de Limpieza */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="warning.main">
                  ⚠️ Limpiar Solo Datos
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Elimina comidas, ejercicios y agua registrados. Mantiene tu sesión activa.
                </Typography>
                <Button
                  variant="contained"
                  color="warning"
                  startIcon={<Delete />}
                  onClick={clearOnlyData}
                  fullWidth
                >
                  Limpiar Datos
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="error.main">
                  🗑️ Limpieza Completa
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Elimina TODO: datos, tokens y sesión. Tendrás que iniciar sesión nuevamente.
                </Typography>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<Delete />}
                  onClick={clearAllData}
                  fullWidth
                >
                  Limpiar Todo
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {cleared && (
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={goToLogin}
                fullWidth
                size="large"
              >
                Ir a Login
              </Button>
            </Grid>
          )}
        </Grid>

        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Nota:</strong> Esta página es solo para desarrollo. Los datos en localStorage son temporales.
            En producción, todos los datos vienen del backend.
          </Typography>
        </Alert>
      </Box>
    </MainLayout>
  );
};

// Importar Grid que faltaba
import { Grid } from '@mui/material';

export default DebugClearPage;
