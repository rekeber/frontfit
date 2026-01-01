'use client';

import React, { useState } from 'react';
import { Box, Button, Typography, Card, CardContent, Alert } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/services/apiService';
import { tokenManager } from '@/services/tokenManager';

const TestAuthPage: React.FC = () => {
  const { user, isLoggedIn, login, logout } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testLogin = async () => {
    try {
      addResult('Testing login...');
      const result = await login({
        email: 'rekeber@gmail.com',
        password: 'password123'
      });
      
      if (result.success) {
        addResult('✅ Login successful');
        addResult(`User data: ${JSON.stringify(user, null, 2)}`);
      } else {
        addResult(`❌ Login failed: ${result.error}`);
      }
    } catch (error: any) {
      addResult(`❌ Login error: ${error.message}`);
    }
  };

  const testProfileFetch = async () => {
    try {
      addResult('Testing profile fetch...');
      const response = await apiService.getUserProfile();
      addResult('✅ Profile fetch successful');
      addResult(`Profile data: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error: any) {
      addResult(`❌ Profile fetch failed: ${error.message}`);
    }
  };

  const testTokens = () => {
    addResult('Testing token storage...');
    addResult(`Access token: ${tokenManager.getAccessToken() ? 'Present' : 'Missing'}`);
    addResult(`Refresh token: ${tokenManager.getRefreshToken() ? 'Present' : 'Missing'}`);
    addResult(`User ID: ${tokenManager.getUserId()}`);
    addResult(`User email: ${tokenManager.getUserEmail()}`);
    addResult(`User name: ${tokenManager.getUserName()}`);
    addResult(`Is logged in: ${tokenManager.isLoggedIn()}`);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Authentication Test Page
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Auth State
          </Typography>
          <Typography>Is Logged In: {isLoggedIn ? 'Yes' : 'No'}</Typography>
          <Typography>User: {user ? user.name : 'None'}</Typography>
          {user && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">User Details:</Typography>
              <Typography>ID: {user.id}</Typography>
              <Typography>Email: {user.email}</Typography>
              <Typography>Height: {user.height}</Typography>
              <Typography>Current Weight: {user.currentWeight}</Typography>
              <Typography>BMI: {user.bmi}</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button variant="contained" onClick={testLogin}>
          Test Login
        </Button>
        <Button variant="contained" onClick={testProfileFetch}>
          Test Profile Fetch
        </Button>
        <Button variant="contained" onClick={testTokens}>
          Test Tokens
        </Button>
        <Button variant="outlined" onClick={logout}>
          Logout
        </Button>
        <Button variant="outlined" onClick={clearResults}>
          Clear Results
        </Button>
      </Box>

      {testResults.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Test Results
            </Typography>
            <Box sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
              {testResults.map((result, index) => (
                <Typography key={index} sx={{ mb: 0.5 }}>
                  {result}
                </Typography>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default TestAuthPage;