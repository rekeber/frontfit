'use client';

import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Avatar, 
  Button, 
  Grid,
  Divider,
  LinearProgress,
  Chip
} from '@mui/material';
import { 
  Edit, 
  Settings, 
  EmojiEvents, 
  TrendingUp,
  Logout
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/Layout/MainLayout';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const stats = [
    { label: 'Peso perdido', value: '5.2 kg', color: '#4CAF50' },
    { label: 'Entrenamientos', value: '24', color: '#2196F3' },
    { label: 'Días activos', value: '15', color: '#FF9800' },
    { label: 'Logros', value: '8', color: '#9C27B0' }
  ];

  const achievements = [
    { name: 'Primera semana', description: '7 días seguidos', earned: true },
    { name: 'Guerrero del fitness', description: '20 entrenamientos', earned: true },
    { name: 'Nutricionista', description: '50 comidas registradas', earned: false },
    { name: 'Maratonista', description: '100 km corridos', earned: false }
  ];

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          👤 Mi Perfil
        </Typography>

        <Grid container spacing={3}>
          {/* Profile Info */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar 
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    mx: 'auto', 
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: '2rem'
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
                
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {user?.name || 'Usuario'}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {user?.email || 'email@example.com'}
                </Typography>

                <Chip 
                  label="Miembro Premium" 
                  color="primary" 
                  variant="outlined" 
                  sx={{ mb: 2 }}
                />

                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                  <Button variant="contained" startIcon={<Edit />} size="small">
                    Editar
                  </Button>
                  <Button variant="outlined" startIcon={<Settings />} size="small">
                    Config
                  </Button>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Información Personal
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Edad</Typography>
                  <Typography variant="body2" fontWeight="bold">28 años</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Altura</Typography>
                  <Typography variant="body2" fontWeight="bold">175 cm</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Peso actual</Typography>
                  <Typography variant="body2" fontWeight="bold">72.5 kg</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2">Objetivo</Typography>
                  <Typography variant="body2" fontWeight="bold">70 kg</Typography>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Progreso hacia el objetivo
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={75} 
                  sx={{ height: 8, borderRadius: 4, mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  75% completado
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Stats and Achievements */}
          <Grid item xs={12} md={8}>
            {/* Stats */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  📊 Estadísticas
                </Typography>
                
                <Grid container spacing={2}>
                  {stats.map((stat, index) => (
                    <Grid item xs={6} sm={3} key={index}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" fontWeight="bold" color={stat.color}>
                          {stat.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {stat.label}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EmojiEvents sx={{ mr: 1, color: 'warning.main' }} />
                  <Typography variant="h6" fontWeight="bold">
                    Logros
                  </Typography>
                </Box>
                
                <Grid container spacing={2}>
                  {achievements.map((achievement, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Card 
                        variant="outlined" 
                        sx={{ 
                          opacity: achievement.earned ? 1 : 0.5,
                          bgcolor: achievement.earned ? 'success.light' : 'grey.100'
                        }}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {achievement.name}
                            </Typography>
                            {achievement.earned && (
                              <EmojiEvents 
                                sx={{ ml: 'auto', color: 'warning.main', fontSize: 20 }} 
                              />
                            )}
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {achievement.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* Logout Button */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button 
                variant="outlined" 
                color="error" 
                startIcon={<Logout />}
                onClick={handleLogout}
              >
                Cerrar Sesión
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </MainLayout>
  );
};

export default ProfilePage;