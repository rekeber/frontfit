'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  Container,
  Paper,
  Button,
  Typography,
  Box,
  Grid,
} from '@mui/material';
import {
  Login,
  PersonAdd,
  BugReport,
  Dashboard,
} from '@mui/icons-material';

export default function HomePage() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();

  const navigationOptions = [
    {
      title: 'Iniciar Sesión',
      description: 'Accede a tu cuenta de FitLife',
      icon: <Login sx={{ fontSize: 40 }} />,
      path: '/login',
      color: 'primary',
      show: !isLoggedIn,
    },
    {
      title: 'Registrarse',
      description: 'Crea una nueva cuenta',
      icon: <PersonAdd sx={{ fontSize: 40 }} />,
      path: '/register',
      color: 'secondary',
      show: !isLoggedIn,
    },
    {
      title: 'Dashboard',
      description: 'Ve a tu panel principal',
      icon: <Dashboard sx={{ fontSize: 40 }} />,
      path: '/dashboard',
      color: 'success',
      show: isLoggedIn,
    },
    {
      title: '🔧 Test de Login',
      description: 'Página de diagnóstico para problemas de login',
      icon: <BugReport sx={{ fontSize: 40 }} />,
      path: '/test-login',
      color: 'warning',
      show: true,
    },
  ];

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h2" component="h1" fontWeight="bold" color="primary" gutterBottom>
              🏃‍♂️ FitLife
            </Typography>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Tu compañero para una vida saludable
            </Typography>
            
            {isLoggedIn && user && (
              <Typography variant="body1" color="success.main" sx={{ mt: 2 }}>
                ¡Bienvenido de vuelta, {user.name}! 👋
              </Typography>
            )}
          </Box>

          {/* Navigation Grid */}
          <Grid container spacing={3} sx={{ maxWidth: 600 }}>
            {navigationOptions
              .filter(option => option.show)
              .map((option, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        elevation: 4,
                        transform: 'translateY(-2px)',
                      },
                    }}
                    onClick={() => router.push(option.path)}
                  >
                    <Box sx={{ color: `${option.color}.main`, mb: 2 }}>
                      {option.icon}
                    </Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {option.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {option.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
          </Grid>

          {/* Quick Access */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Acceso rápido para pruebas:
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => router.push('/test-login')}
              >
                Test Login
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => router.push('/add-food')}
              >
                Agregar Comida
              </Button>
              {isLoggedIn && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => router.push('/dashboard')}
                >
                  Dashboard
                </Button>
              )}
            </Box>
          </Box>

          {/* Credentials Info */}
          <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1, width: '100%', maxWidth: 400 }}>
            <Typography variant="body2" color="info.contrastText" sx={{ textAlign: 'center' }}>
              <strong>Credenciales de prueba:</strong><br />
              📧 rekeber@gmail.com<br />
              🔒 password123
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}