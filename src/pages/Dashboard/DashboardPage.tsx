import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  CircularProgress,
  Button,
  Avatar,
  Chip,
  Stack,
  Paper,
  IconButton,
} from '@mui/material';
import {
  FitnessCenter,
  Restaurant,
  LocalDrink,
  Scale,
  Analytics,
  Whatshot,
  Star,
  TrendingUp,
  EmojiEvents,
  Timeline,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Welcome Card */}
        <Grid item xs={12}>
          <WelcomeCard userName={user?.name || 'Usuario'} />
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12}>
          <QuickStatsRow />
        </Grid>

        {/* Calorie Progress */}
        <Grid item xs={12} md={8}>
          <CalorieProgressCard />
        </Grid>

        {/* Today's Summary */}
        <Grid item xs={12} md={4}>
          <TodaySummaryCard />
        </Grid>

        {/* Macronutrients */}
        <Grid item xs={12} md={6}>
          <MacronutrientsCard />
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <RecentActivitiesCard />
        </Grid>

        {/* Achievements */}
        <Grid item xs={12}>
          <AchievementsCard />
        </Grid>
      </Grid>
    </Box>
  );
};

const WelcomeCard: React.FC<{ userName: string }> = ({ userName }) => (
  <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            ¡Hola, {userName}! 👋
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Hoy es un gran día para mantenerte saludable
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6">Hoy</Typography>
          <Typography variant="h4" fontWeight="bold">
            {new Date().getDate()}
          </Typography>
          <Typography variant="body2">
            {new Date().toLocaleDateString('es-ES', { month: 'short' })}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const QuickStatsRow: React.FC = () => {
  const stats = [
    { label: 'Peso Actual', value: '72.5 kg', icon: Scale, color: '#4CAF50' },
    { label: 'IMC', value: '22.1', icon: Analytics, color: '#2196F3' },
    { label: 'Racha', value: '15 días', icon: Whatshot, color: '#FF9800' },
    { label: 'Puntos', value: '1,250', icon: Star, color: '#9C27B0' },
  ];

  return (
    <Grid container spacing={2}>
      {stats.map((stat, index) => (
        <Grid item xs={6} sm={3} key={index}>
          <StatCard {...stat} />
        </Grid>
      ))}
    </Grid>
  );
};

const StatCard: React.FC<{
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
}> = ({ label, value, icon: Icon, color }) => (
  <Card sx={{ textAlign: 'center', height: '100%' }}>
    <CardContent>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          backgroundColor: `${color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 1,
        }}
      >
        <Icon sx={{ color, fontSize: 24 }} />
      </Box>
      <Typography variant="h6" fontWeight="bold" color={color}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </CardContent>
  </Card>
);

const CalorieProgressCard: React.FC = () => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Calorías de Hoy
        </Typography>
        <Typography variant="body1" color="primary" fontWeight="bold">
          1,450 / 2,000
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={72.5}
        sx={{
          height: 12,
          borderRadius: 6,
          mb: 2,
          '& .MuiLinearProgress-bar': {
            borderRadius: 6,
          },
        }}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Restantes: 550 cal
        </Typography>
        <Typography variant="body2" fontWeight="bold" color="primary">
          72.5%
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={4}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="success.main" fontWeight="bold">
              320
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Desayuno
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={4}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="warning.main" fontWeight="bold">
              450
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Almuerzo
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={4}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="info.main" fontWeight="bold">
              680
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cena
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

const TodaySummaryCard: React.FC = () => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Resumen de Hoy
      </Typography>
      
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalDrink color="primary" />
            <Typography variant="body2">Agua</Typography>
          </Box>
          <Typography variant="body2" fontWeight="bold">6/8 vasos</Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FitnessCenter color="success" />
            <Typography variant="body2">Ejercicio</Typography>
          </Box>
          <Typography variant="body2" fontWeight="bold">30 min</Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Timeline color="warning" />
            <Typography variant="body2">Pasos</Typography>
          </Box>
          <Typography variant="body2" fontWeight="bold">8,432</Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Whatshot color="error" />
            <Typography variant="body2">Calorías quemadas</Typography>
          </Box>
          <Typography variant="body2" fontWeight="bold">420 cal</Typography>
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const MacronutrientsCard: React.FC = () => {
  const macros = [
    { name: 'Proteínas', current: 85, target: 120, color: '#E91E63' },
    { name: 'Carbos', current: 180, target: 250, color: '#2196F3' },
    { name: 'Grasas', current: 45, target: 67, color: '#FF9800' },
  ];

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Macronutrientes
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {macros.map((macro, index) => (
            <Grid item xs={4} key={index}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
                  <CircularProgress
                    variant="determinate"
                    value={(macro.current / macro.target) * 100}
                    size={60}
                    thickness={6}
                    sx={{ color: macro.color }}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="caption" fontWeight="bold">
                      {Math.round((macro.current / macro.target) * 100)}%
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" fontWeight="bold">
                  {macro.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {macro.current}g/{macro.target}g
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

const RecentActivitiesCard: React.FC = () => {
  const activities = [
    {
      title: 'Desayuno registrado',
      description: 'Avena con frutas - 320 cal',
      icon: Restaurant,
      time: 'Hace 2 horas',
    },
    {
      title: 'Ejercicio completado',
      description: 'Cardio 30 min - 250 cal quemadas',
      icon: FitnessCenter,
      time: 'Hace 4 horas',
    },
    {
      title: 'Agua registrada',
      description: '6 vasos de 8 hoy',
      icon: LocalDrink,
      time: 'Hace 1 hora',
    },
  ];

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            Actividades Recientes
          </Typography>
          <Button size="small">Ver todas</Button>
        </Box>
        
        <Stack spacing={2}>
          {activities.map((activity, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.light', width: 40, height: 40 }}>
                <activity.icon fontSize="small" />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight="bold">
                  {activity.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {activity.description}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {activity.time}
              </Typography>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

const AchievementsCard: React.FC = () => {
  const achievements = [
    { emoji: '🔥', value: '15', label: 'Días seguidos' },
    { emoji: '🏆', value: '8', label: 'Logros desbloqueados' },
    { emoji: '⭐', value: '1,250', label: 'Puntos totales' },
    { emoji: '💪', value: '24', label: 'Entrenamientos' },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Logros y Racha
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {achievements.map((achievement, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" sx={{ mb: 1 }}>
                  {achievement.emoji}
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  {achievement.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {achievement.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default DashboardPage;