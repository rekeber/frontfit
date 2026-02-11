'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  TextField,
  Divider,
} from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { tokenManager } from '@/services/tokenManager';

export default function TestLoginPage() {
  const [testResult, setTestResult] = useState<string>('');
  const [isTestingLogin, setIsTestingLogin] = useState(false);
  const [isTestingBackend, setIsTestingBackend] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [email, setEmail] = useState('rekeber@gmail.com');
  const [password, setPassword] = useState('password123');
  
  const { login, isLoading, error, user, isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Actualizar info de debug cada segundo
    const interval = setInterval(() => {
      setDebugInfo({
        hasToken: !!tokenManager.getAccessToken(),
        tokenExpired: tokenManager.isTokenExpired(),
        isLoggedInToken: tokenManager.isLoggedIn(),
        userId: tokenManager.getUserId(),
        userEmail: tokenManager.getUserEmail(),
        userName: tokenManager.getUserName(),
        localStorage: typeof window !== 'undefined' ? {
          accessToken: localStorage.getItem('fitlife_access_token')?.substring(0, 50) + '...',
          refreshToken: localStorage.getItem('fitlife_refresh_token')?.substring(0, 50) + '...',
          expiresAt: localStorage.getItem('fitlife_expires_at'),
        } : null
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const testBackendConnection = async () => {
    setIsTestingBackend(true);
    setTestResult('');
    
    try {
      console.log('🔍 Testing backend connection...');
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend response:', data);
        setTestResult(`✅ Backend conectado correctamente. Token recibido: ${data.accessToken.substring(0, 50)}...`);
      } else {
        const errorText = await response.text();
        console.error('❌ Backend error:', response.status, errorText);
        setTestResult(`❌ Error del backend: ${response.status} - ${errorText}`);
      }
    } catch (error: any) {
      console.error('❌ Connection error:', error);
      setTestResult(`❌ Error de conexión: ${error.message}`);
    } finally {
      setIsTestingBackend(false);
    }
  };

  const testLogin = async () => {
    setIsTestingLogin(true);
    setTestResult('');
    
    try {
      console.log('🔐 Testing login with hook...');
      console.log('📧 Email:', email);
      console.log('🔒 Password:', password.substring(0, 3) + '***');
      
      const result = await login({
        email: email,
        password: password
      });
      
      console.log('🔐 Login result:', result);
      
      if (result.success) {
        setTestResult('✅ Login exitoso! Redirigiendo al dashboard...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setTestResult(`❌ Login falló: ${result.error}`);
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      setTestResult(`❌ Error inesperado: ${error.message}`);
    } finally {
      setIsTestingLogin(false);
    }
  };

  const clearStorage = () => {
    tokenManager.clearTokens();
    setTestResult('🧹 LocalStorage limpiado');
  };

  const testDirectLogin = async () => {
    setTestResult('🔄 Probando login directo...');
    
    try {
      // Login directo sin hook
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Guardar tokens manualmente
        tokenManager.saveTokens(data.accessToken, data.refreshToken, data.expiresIn);
        tokenManager.saveUserInfo(data.user.id, data.user.email, data.user.name);
        
        setTestResult('✅ Login directo exitoso! Tokens guardados manualmente. Recarga la página.');
      } else {
        const errorText = await response.text();
        setTestResult(`❌ Login directo falló: ${response.status} - ${errorText}`);
      }
    } catch (error: any) {
      setTestResult(`❌ Error en login directo: ${error.message}`);
    }
  };

  return (
    <Container component="main" maxWidth="lg">
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
          <Typography component="h1" variant="h4" fontWeight="bold" color="primary" gutterBottom>
            🔧 Diagnóstico Completo de Login
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            Página de diagnóstico avanzado para identificar problemas de autenticación
          </Typography>

          {/* Credentials Input */}
          <Box sx={{ mb: 3, display: 'flex', gap: 2, width: '100%', maxWidth: 400 }}>
            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              size="small"
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size="small"
              fullWidth
            />
          </Box>

          {/* Current Auth State */}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1, width: '100%' }}>
            <Typography variant="h6" gutterBottom>Estado del Hook useAuth:</Typography>
            <Typography variant="body2">• Logueado: {isLoggedIn ? '✅ Sí' : '❌ No'}</Typography>
            <Typography variant="body2">• Usuario: {user ? `${user.name} (${user.email})` : 'Ninguno'}</Typography>
            <Typography variant="body2">• Cargando: {isLoading ? '⏳ Sí' : '✅ No'}</Typography>
            {error && (
              <Typography variant="body2" color="error">• Error: {error}</Typography>
            )}
          </Box>

          {/* Debug Info */}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'info.light', borderRadius: 1, width: '100%' }}>
            <Typography variant="h6" gutterBottom>Estado del TokenManager:</Typography>
            <Typography variant="body2">• Tiene Token: {debugInfo.hasToken ? '✅ Sí' : '❌ No'}</Typography>
            <Typography variant="body2">• Token Expirado: {debugInfo.tokenExpired ? '❌ Sí' : '✅ No'}</Typography>
            <Typography variant="body2">• isLoggedIn: {debugInfo.isLoggedInToken ? '✅ Sí' : '❌ No'}</Typography>
            <Typography variant="body2">• User ID: {debugInfo.userId || 'Ninguno'}</Typography>
            <Typography variant="body2">• Email: {debugInfo.userEmail || 'Ninguno'}</Typography>
            <Typography variant="body2">• Nombre: {debugInfo.userName || 'Ninguno'}</Typography>
            {debugInfo.localStorage && (
              <>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2">• Access Token: {debugInfo.localStorage.accessToken || 'Ninguno'}</Typography>
                <Typography variant="body2">• Refresh Token: {debugInfo.localStorage.refreshToken || 'Ninguno'}</Typography>
                <Typography variant="body2">• Expires At: {debugInfo.localStorage.expiresAt || 'Ninguno'}</Typography>
              </>
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
              {isTestingBackend ? 'Probando Backend...' : '1. Probar Backend'}
            </Button>
            
            <Button
              variant="contained"
              onClick={testLogin}
              disabled={isTestingLogin || isLoading}
              startIcon={isTestingLogin ? <CircularProgress size={20} /> : null}
            >
              {isTestingLogin ? 'Probando Login...' : '2. Probar Login Hook'}
            </Button>

            <Button
              variant="contained"
              color="secondary"
              onClick={testDirectLogin}
            >
              3. Login Directo
            </Button>
            
            <Button
              variant="outlined"
              color="warning"
              onClick={clearStorage}
            >
              Limpiar Storage
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
            <Button variant="text" onClick={() => router.push('/login')}>
              Ir a Login Normal
            </Button>
            <Button variant="text" onClick={() => router.push('/')}>
              Ir a Inicio
            </Button>
            {isLoggedIn && (
              <Button variant="text" onClick={() => router.push('/dashboard')}>
                Ir al Dashboard
              </Button>
            )}
          </Box>

          {/* Console Instructions */}
          <Box sx={{ mt: 3, p: 2, bgcolor: 'warning.light', borderRadius: 1, width: '100%' }}>
            <Typography variant="body2" color="warning.contrastText">
              <strong>📋 Instrucciones:</strong><br />
              1. Abre las herramientas de desarrollador (F12)<br />
              2. Ve a la pestaña &quot;Console&quot;<br />
              3. Haz clic en los botones de prueba<br />
              4. Observa los logs detallados en la consola<br />
              5. Reporta cualquier error que veas
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}