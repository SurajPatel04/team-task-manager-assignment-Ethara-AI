import { Navigate } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';

const ProtectedRoute = ({ isAuthenticated, loading }) => {
  if (loading) return null;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <MainLayout />;
};

export default ProtectedRoute;
