import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import ChatDashboard from './pages/ChatDashboard.jsx';
import Profile from './pages/Profile.jsx';

export default function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
