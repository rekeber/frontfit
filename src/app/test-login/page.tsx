'use client';

import React, { useState } from 'react';
import {
  Container,
  Paper,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function TestLoginPage() {
  const [testResult, setTestResult] = useState<string>('');
  const [isTestingLogin, setIsTestingLogin] = useState(false);
  const [isTestingBackend, setIsTestingBackend] = useState(false);
  
  const { login, isLoading, error, user, isLoggedIn } = useAuth();
  const router = useRouter();

  const testBackendConnection = async () => {
    setIsTestingBackend(true);
    setTestResult('');
    
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'rekeber@gmail.com',
          password: 'password123'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setTestResult(`✅ Backend conectado correctamente. Token recibido: ${data.accessToken.substring(0, 50)}...`);
      } else {
        const errorText = await response.text();
        setTestResult(`❌ Error del backend: ${response.status} - ${errorText}`);
      }
    } catch (error: any) {
      setTestResult(`❌ Error de conexión: ${error.message}`);
    } finally {
      setIsTestingBackend(false);
    }
  };

  const testLogin = async () => {
    setIsTestingLogin(true);
    setTestResult('');
    
    try {
      const result = await login({
        email: 'rekeber@gmail.com',
        password: 'password123'
      });
      
      if (result.success) {
        setTestResult('✅ Login exitoso! Redirigiendo al dashboard...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setTestResult(`❌ Login falló: ${result.error}`);
      }
    } catch (error: any) {
      setTestResult(`❌ Error inesperado: ${error.message}`);
    } finally {
      setIsTestingLogin(false);
    }
  };

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
          <Typography component="h1" variant="h4" fontWeight="bold" color="primary" gutterBottom>
            🔧 Test de Login
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            Página de prueba para diagnosticar problemas de autenticación
          </Typography>

          {/* Current Auth State */}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1, width: '100%' }}>
            <Typography variant="h6" gutterBottom>Estado Actual:</Typography>
            <Typography variant="body2">
              • Logueado: {isLoggedIn ? '✅ Sí' : '❌ No'}
            </Typography>
            <Typography variant="body2">
              • Usuario: {user ? `${user.name} (${user.email})` : 'Ninguno'}
            </Typography>
            <Typography variant="body2">
              • Cargando: {isLoading ? '⏳ Sí' : '✅ No'}
            </Typography>
            {error && (
              <Typography variant="body2" color="error">
                • Error: {error}
              </Typography>
            )}
          </Box>

          {/* Test Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={testBackendConnection}
              disabled={isTestingBackend}
              startIcon={isTestingBackend ? <CircularProgress size={20} /> : null}
            >
              {isTestingBackend ? 'Probando Backend...' : 'Probar Backend Directo'}
            </Button>
            
            <Button
              variant="contained"
              onClick={testLogin}
              disabled={isTestingLogin || isLoading}
              startIcon={isTestingLogin ? <CircularProgress size={20} /> : null}
            >
              {isTestingLogin ? 'Probando Login...' : 'Probar Login con Hook'}
            </Button>
          </Box>

          {/* Test Result */}
          {testResult && (
            <Alert 
              severity={testResult.includes('✅') ? 'success' : 'error'} 
              sx={{ width: '100%', mb: 2 }}
            >
              {testResult}
            </Alert>
          )}

          {/* Navigation */}
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="text"
              onClick={() => router.push('/login')}
            >
              Ir a Login Normal
            </Button>
            
            {isLoggedIn && (
              <Button
                variant="text"
                onClick={() => router.push('/dashboard')}
              >
                Ir al Dashboard
              </Button>
            )}
          </Box>

          {/* Instructions */}
          <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1, width: '100%' }}>
            <Typography variant="body2" color="info.contrastText">
              <strong>Credenciales de prueba:</strong><br />
              Email: rekeber@gmail.com<br />
              Password: password123
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}