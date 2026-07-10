import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="loading">Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="loading">Loading...</p>;
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}
