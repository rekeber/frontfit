import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Link,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Person,
  FitnessCenter,
  Height,
  MonitorWeight,
  DateRange,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    age: '',
    height: '',
    currentWeight: '',
    targetWeight: '',
    goal: 'PERDER_PESO',
    activityLevel: 'MODERADO',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { register, isLoading, error, clearError, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard');
    }
  }, [isLoggedIn, navigate]);

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const goals = [
    { value: 'PERDER_PESO', label: 'Perder peso' },
    { value: 'MANTENER', label: 'Mantener peso' },
    { value: 'GANAR_MUSCULO', label: 'Ganar músculo' },
  ];

  const activityLevels = [
    { value: 'SEDENTARIO', label: 'Sedentario' },
    { value: 'LIGERO', label: 'Ligero' },
    { value: 'MODERADO', label: 'Moderado' },
    { value: 'ACTIVO', label: 'Activo' },
    { value: 'MUY_ACTIVO', label: 'Muy activo' },
  ];

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Ingresa un email válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!formData.age) {
      newErrors.age = 'La edad es requerida';
    } else if (parseInt(formData.age) < 13 || parseInt(formData.age) > 120) {
      newErrors.age = 'Ingresa una edad válida (13-120)';
    }

    if (!formData.height) {
      newErrors.height = 'La altura es requerida';
    } else if (parseFloat(formData.height) < 100 || parseFloat(formData.height) > 250) {
      newErrors.height = 'Ingresa una altura válida (100-250 cm)';
    }

    if (!formData.currentWeight) {
      newErrors.currentWeight = 'El peso actual es requerido';
    } else if (parseFloat(formData.currentWeight) < 30 || parseFloat(formData.currentWeight) > 300) {
      newErrors.currentWeight = 'Ingresa un peso válido (30-300 kg)';
    }

    if (!formData.targetWeight) {
      newErrors.targetWeight = 'El peso objetivo es requerido';
    } else if (parseFloat(formData.targetWeight) < 30 || parseFloat(formData.targetWeight) > 300) {
      newErrors.targetWeight = 'Ingresa un peso objetivo válido (30-300 kg)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Clear server error when user starts typing
    if (error) {
      clearError();
    }
  };

  const handleSelectChange = (field: string) => (e: any) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    
    // Clear server error when user changes selection
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await register({
      email: formData.email.trim(),
      password: formData.password,
      name: formData.name.trim(),
      age: parseInt(formData.age),
      height: parseFloat(formData.height),
      currentWeight: parseFloat(formData.currentWeight),
      targetWeight: parseFloat(formData.targetWeight),
      goal: formData.goal,
      activityLevel: formData.activityLevel,
    });
    
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const isFormValid = Object.values(formData).every(value => value !== '') && 
                     Object.values(errors).every(error => error === '');

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
            maxWidth: 600,
          }}
        >
          {/* Logo and Title */}
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <FitnessCenter sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography component="h1" variant="h4" fontWeight="bold" color="primary">
              Crear Cuenta
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Completa tus datos para comenzar
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ width: '100%', mb: 2 }}
              onClose={() => clearError()}
            >
              {error}
            </Alert>
          )}

          {/* Register Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            {/* Personal Information */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Información Personal
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Nombre completo"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  error={!!errors.name}
                  helperText={errors.name}
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={8}>
                <TextField
                  required
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  error={!!errors.email}
                  helperText={errors.email}
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  required
                  fullWidth
                  label="Edad"
                  type="number"
                  value={formData.age}
                  onChange={handleInputChange('age')}
                  error={!!errors.age}
                  helperText={errors.age}
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DateRange />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            {/* Physical Information */}
            <Typography variant="h6" sx={{ mb: 2, mt: 3, fontWeight: 'bold' }}>
              Información Física
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  required
                  fullWidth
                  label="Altura (cm)"
                  type="number"
                  value={formData.height}
                  onChange={handleInputChange('height')}
                  error={!!errors.height}
                  helperText={errors.height}
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Height />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  required
                  fullWidth
                  label="Peso actual (kg)"
                  type="number"
                  value={formData.currentWeight}
                  onChange={handleInputChange('currentWeight')}
                  error={!!errors.currentWeight}
                  helperText={errors.currentWeight}
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MonitorWeight />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  required
                  fullWidth
                  label="Peso objetivo (kg)"
                  type="number"
                  value={formData.targetWeight}
                  onChange={handleInputChange('targetWeight')}
                  error={!!errors.targetWeight}
                  helperText={errors.targetWeight}
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MonitorWeight />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            {/* Goals and Activity */}
            <Typography variant="h6" sx={{ mb: 2, mt: 3, fontWeight: 'bold' }}>
              Objetivos y Actividad
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Objetivo</InputLabel>
                  <Select
                    value={formData.goal}
                    label="Objetivo"
                    onChange={handleSelectChange('goal')}
                    disabled={isLoading}
                  >
                    {goals.map((goal) => (
                      <MenuItem key={goal.value} value={goal.value}>
                        {goal.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Nivel de Actividad</InputLabel>
                  <Select
                    value={formData.activityLevel}
                    label="Nivel de Actividad"
                    onChange={handleSelectChange('activityLevel')}
                    disabled={isLoading}
                  >
                    {activityLevels.map((level) => (
                      <MenuItem key={level.value} value={level.value}>
                        {level.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Security */}
            <Typography variant="h6" sx={{ mb: 2, mt: 3, fontWeight: 'bold' }}>
              Seguridad
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  error={!!errors.password}
                  helperText={errors.password}
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          disabled={isLoading}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Confirmar contraseña"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 4, mb: 2, py: 1.5 }}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Crear Cuenta'
              )}
            </Button>
            
            {error && (
              <Button
                fullWidth
                variant="outlined"
                sx={{ mb: 2, py: 1.5 }}
                onClick={() => clearError()}
                disabled={isLoading}
              >
                Limpiar Error y Reintentar
              </Button>
            )}
            
            <Box sx={{ textAlign: 'center' }}>
              <Link
                component="button"
                variant="body2"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/login');
                }}
                sx={{ textDecoration: 'none' }}
                disabled={isLoading}
              >
                ¿Ya tienes cuenta? Inicia sesión
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;