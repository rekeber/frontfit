'use client';

import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Card, CardContent, Alert } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/services/apiService';
import { tokenManager } from '@/services/tokenManager';

const TestDashboardPage: React.FC = () => {
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    addResult(`Auth loading: ${authLoading}, User: ${user ? user.name : 'null'}, Logged in: ${isLoggedIn}`);
  }, [user, isLoggedIn, authLoading]);

  const testDashboardStats = async () => {
    try {
      addResult('Testing dashboard stats...');
      const response = await apiService.getDashboardStats();
      addResult('✅ Dashboard stats successful');
      addResult(`Stats data: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error: any) {
      addResult(`❌ Dashboard stats failed: ${error.message}`);
      addResult(`Error details: ${JSON.stringify(error.response?.data || error, null, 2)}`);
    }
  };

  const testUserProfile = async () => {
    try {
      addResult('Testing user profile...');
      const response = await apiService.getUserProfile();
      addResult('✅ User profile successful');
      addResult(`Profile data: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error: any) {
      addResult(`❌ User profile failed: ${error.message}`);
      addResult(`Error details: ${JSON.stringify(error.response?.data || error, null, 2)}`);
    }
  };

  const testNutritionSummary = async () => {
    try {
      addResult('Testing nutrition summary...');
      const response = await apiService.getDailyNutritionSummary();
      addResult('✅ Nutrition summary successful');
      addResult(`Nutrition data: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error: any) {
      addResult(`❌ Nutrition summary failed: ${error.message}`);
      addResult(`Error details: ${JSON.stringify(error.response?.data || error, null, 2)}`);
    }
  };

  const testWaterIntake = async () => {
    try {
      addResult('Testing water intake...');
      const response = await apiService.getTodayWaterIntake();
      addResult('✅ Water intake successful');
      addResult(`Water data: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error: any) {
      addResult(`❌ Water intake failed: ${error.message}`);
      addResult(`Error details: ${JSON.stringify(error.response?.data || error, null, 2)}`);
    }
  };

  const testAllAPIs = async () => {
    addResult('=== TESTING ALL DASHBOARD APIs ===');
    await testUserProfile();
    await testDashboardStats();
    await testNutritionSummary();
    await testWaterIntake();
    addResult('=== ALL TESTS COMPLETE ===');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Dashboard API Test Page
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Auth State
          </Typography>
          <Typography>Auth Loading: {authLoading ? 'Yes' : 'No'}</Typography>
          <Typography>Is Logged In: {isLoggedIn ? 'Yes' : 'No'}</Typography>
          <Typography>User: {user ? user.name : 'None'}</Typography>
          {user && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">User Details from useAuth:</Typography>
              <Typography>ID: {user.id}</Typography>
              <Typography>Email: {user.email}</Typography>
              <Typography>Height: {user.height}</Typography>
              <Typography>Current Weight: {user.currentWeight}</Typography>
              <Typography>BMI: {user.bmi}</Typography>
            </Box>
          )}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Token Info:</Typography>
            <Typography>Access Token: {tokenManager.getAccessToken() ? 'Present' : 'Missing'}</Typography>
            <Typography>User ID from token: {tokenManager.getUserId()}</Typography>
            <Typography>User email from token: {tokenManager.getUserEmail()}</Typography>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button variant="contained" onClick={testAllAPIs}>
          Test All APIs
        </Button>
        <Button variant="contained" onClick={testUserProfile}>
          Test User Profile
        </Button>
        <Button variant="contained" onClick={testDashboardStats}>
          Test Dashboard Stats
        </Button>
        <Button variant="contained" onClick={testNutritionSummary}>
          Test Nutrition
        </Button>
        <Button variant="contained" onClick={testWaterIntake}>
          Test Water Intake
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
            <Box sx={{ fontFamily: 'monospace', fontSize: '0.875rem', maxHeight: '500px', overflow: 'auto' }}>
              {testResults.map((result, index) => (
                <Typography key={index} sx={{ mb: 0.5, whiteSpace: 'pre-wrap' }}>
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

export default TestDashboardPage;