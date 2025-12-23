import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'

import { useAuthStore } from './store/authStore'
import Layout from './components/Layout/Layout'
import LoginPage from './pages/Auth/LoginPage'
import RegisterPage from './pages/Auth/RegisterPage'
import DashboardPage from './pages/Dashboard/DashboardPage'
import ExercisePage from './pages/Exercise/ExercisePage'
import NutritionPage from './pages/Nutrition/NutritionPage'
import SocialPage from './pages/Social/SocialPage'
import ProfilePage from './pages/Profile/ProfilePage'
import MessagesPage from './pages/Messages/MessagesPage'
import ChatPage from './pages/Messages/ChatPage'

function App() {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Box>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/exercise" element={<ExercisePage />} />
        <Route path="/nutrition" element={<NutritionPage />} />
        <Route path="/social" element={<SocialPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/messages/:chatId" element={<ChatPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  )
}

export default App