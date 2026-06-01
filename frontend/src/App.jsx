import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import ChatDashboard from './pages/ChatDashboard.jsx';
import Profile from './pages/Profile.jsx';
import SportsDashboard from './pages/SportsDashboard.jsx';
import LiveSportsHub from './pages/LiveSportsHub.jsx';
import SportsQuiz from './pages/SportsQuiz.jsx';
import PlayerComparator from './pages/PlayerComparator.jsx';
import SportsCalendar from './pages/SportsCalendar.jsx';
import FitnessLab from './pages/FitnessLab.jsx';
import SportsNews from './pages/SportsNews.jsx';

export default function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected: Chat */}
          <Route path="/chat" element={<ProtectedRoute><ChatDashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Protected: Sports Hub */}
          <Route path="/sports" element={<ProtectedRoute><SportsDashboard /></ProtectedRoute>} />
          <Route path="/sports/live" element={<ProtectedRoute><LiveSportsHub /></ProtectedRoute>} />
          <Route path="/sports/quiz" element={<ProtectedRoute><SportsQuiz /></ProtectedRoute>} />
          <Route path="/sports/compare" element={<ProtectedRoute><PlayerComparator /></ProtectedRoute>} />
          <Route path="/sports/calendar" element={<ProtectedRoute><SportsCalendar /></ProtectedRoute>} />
          <Route path="/sports/fitness" element={<ProtectedRoute><FitnessLab /></ProtectedRoute>} />
          <Route path="/sports/news" element={<ProtectedRoute><SportsNews /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
