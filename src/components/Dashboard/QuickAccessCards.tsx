'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  CameraAlt,
  VideoCall,
  MonetizationOn,
  EmojiEvents,
  CardGiftcard,
  TrendingUp,
  Star,
  LocalFireDepartment
} from '@mui/icons-material';
import { DashboardStats } from '@/types/dashboard';

interface QuickAccessCardsProps {
  stats?: DashboardStats | null;
}

const QuickAccessCards: React.FC<QuickAccessCardsProps> = ({ stats }) => {
  const router = useRouter();

  const quickAccessItems = [
    {
      title: 'Escanear Comida',
      subtitle: 'Análisis nutricional con IA',
      icon: <CameraAlt sx={{ fontSize: 40 }} />,
      color: 'success.main',
      path: '/food-camera',
      badge: 'AI',
      description: 'Identifica alimentos y obtén información nutricional instantánea'
    },
    {
      title: 'Analizar Ejercicio',
      subtitle: 'Mejora tu forma con IA',
      icon: <VideoCall sx={{ fontSize: 40 }} />,
      color: 'info.main',
      path: '/workout-camera',
      badge: 'AI',
      description: 'Graba tu ejercicio y recibe sugerencias de mejora'
    },
    {
      title: 'Centro de Recompensas',
      subtitle: 'FitCoins y loot boxes',
      icon: <EmojiEvents sx={{ fontSize: 40 }} />,
      color: 'warning.main',
      path: '/gamification',
      badge: 'NEW',
      description: 'Gana FitCoins, abre cajas de recompensas y compite'
    },
    {
      title: 'Creador de Contenido',
      subtitle: 'Gana dinero compartiendo',
      icon: <MonetizationOn sx={{ fontSize: 40 }} />,
      color: 'primary.main',
      path: '/creator',
      badge: 'EARN',
      description: 'Crea contenido fitness y monetiza tu experiencia'
    }
  ];

  // Only show stats if we have real data
  const statsCards = stats ? [
    {
      title: 'Racha Actual',
      value: stats.currentStreak.toString(),
      unit: 'días',
      icon: <LocalFireDepartment sx={{ color: 'error.main' }} />,
      progress: Math.min((stats.currentStreak / 30) * 100, 100), // Max 30 days for 100%
      color: 'error.main'
    },
    {
      title: 'FitCoins',
      value: stats.fitCoinsBalance.toLocaleString(),
      unit: 'FC',
      icon: <MonetizationOn sx={{ color: 'primary.main' }} />,
      progress: Math.min((stats.fitCoinsBalance / 10000) * 100, 100), // Max 10k for 100%
      color: 'primary.main'
    },
    {
      title: 'Logros',
      value: stats.unlockedAchievements.toString(),
      unit: `/${stats.totalAchievements}`,
      icon: <Star sx={{ color: 'warning.main' }} />,
      progress: stats.totalAchievements > 0 ? (stats.unlockedAchievements / stats.totalAchievements) * 100 : 0,
      color: 'warning.main'
    },
    {
      title: 'Ranking',
      value: stats.globalRanking > 0 ? `#${stats.globalRanking}` : 'N/A',
      unit: 'global',
      icon: <TrendingUp sx={{ color: 'success.main' }} />,
      progress: stats.globalRanking > 0 ? Math.max(100 - (stats.globalRanking / 100), 10) : 0,
      color: 'success.main'
    }
  ] : [];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <Box>
      {/* Quick Access Cards */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        🚀 Acceso Rápido
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickAccessItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={item.title}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                sx={{
                  cursor: 'pointer',
                  height: '100%',
                  background: `linear-gradient(135deg, ${item.color}15 0%, ${item.color}05 100%)`,
                  border: `1px solid ${item.color}30`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: `0 8px 25px ${item.color}40`,
                    transform: 'translateY(-2px)'
                  }
                }}
                onClick={() => handleNavigation(item.path)}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    <Box sx={{ color: item.color, mb: 1 }}>
                      {item.icon}
                    </Box>
                    <Chip
                      label={item.badge}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: -10,
                        right: -10,
                        bgcolor: item.color,
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.7rem'
                      }}
                    />
                  </Box>
                  
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {item.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {item.subtitle}
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    {item.description}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Stats Cards - Only show if we have real data */}
      {statsCards.length > 0 && (
        <>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
            📊 Tu Progreso
          </Typography>
          
          <Grid container spacing={3}>
            {statsCards.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={stat.title}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Box>
                          <Typography variant="h4" sx={{ fontWeight: 'bold', color: stat.color }}>
                            {stat.value}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {stat.unit}
                          </Typography>
                        </Box>
                        {stat.icon}
                      </Box>
                      
                      <Typography variant="body2" gutterBottom>
                        {stat.title}
                      </Typography>
                      
                      <LinearProgress
                        variant="determinate"
                        value={stat.progress}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: `${stat.color}20`,
                          '& .MuiLinearProgress-bar': {
                            bgcolor: stat.color,
                            borderRadius: 3
                          }
                        }}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default QuickAccessCards;