import { Navigate, Outlet } from 'react-router-dom';

const PublicRoute = ({ isAuthenticated, loading, children }) => {
  if (loading) return null;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children ? children : <Outlet />;
};

export default PublicRoute;
