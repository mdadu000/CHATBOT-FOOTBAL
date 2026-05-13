import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const loc = useLocation();

  if (loading) {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-neon border-t-transparent" />
          <span className="text-sm">Loading session…</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }

  return children;
}
