import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector, useDispatch } from 'react-redux';
import { setUser, logout, setLoading } from './store/slices/authSlices';
import api from '../services/api';

import ProtectedRoute from './components/routes/ProtectedRoute';
import PublicRoute from './components/routes/PublicRoute';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Dashboard from './pages/Dashboard/Dashboard';
import ProjectsList from './pages/Projects/ProjectsList';
import ProjectDetails from './pages/Projects/ProjectDetails';
import './App.css';

// Stub components for sidebar links
const StubPage = ({ title }) => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-slate-800">{title}</h1>
    <p className="text-slate-500 mt-2">This page is under construction.</p>
  </div>
);

function App() {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      dispatch(setLoading(true));
      try {
        const response = await api.get('/auth/me');
        if (response.data.success) {
          dispatch(setUser(response.data.data));
        } else {
          dispatch(logout());
        }
      } catch (err) {
        dispatch(logout());
      } finally {
        dispatch(setLoading(false));
      }
    };

    checkAuth();
  }, [dispatch]);

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0F172A]"></div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      
      <Routes>
        {/* ======================================= */}
        {/* UNPROTECTED ROUTES (Only when logged out) */}
        {/* ======================================= */}
        <Route element={<PublicRoute isAuthenticated={isAuthenticated} loading={loading} />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>
        
        {/* ======================================= */}
        {/* PROTECTED ROUTES (Only when logged in)    */}
        {/* ======================================= */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} loading={loading} />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<ProjectsList />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route path="/tasks" element={<StubPage title="Tasks" />} />
          <Route path="/team" element={<StubPage title="Team" />} />
          <Route path="/reports" element={<StubPage title="Reports" />} />
          <Route path="/files" element={<StubPage title="Files" />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to={(isAuthenticated && !loading) ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </>
  );
}

export default App;
