import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import Login           from './pages/auth/Login';
import Register        from './pages/auth/Register';
import RegisterSuccess from './pages/auth/RegisterSuccess';
import GoogleCallback  from './pages/auth/GoogleCallback';
import VerifyEmail     from './pages/auth/VerifyEmail';
import ForgotPassword  from './pages/auth/ForgotPassword';
import ResetPassword   from './pages/auth/ResetPassword';
import HomePage        from './pages/home/HomePage';
import './App.css';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"                        element={<HomePage />} />
      <Route path="/auth/login"              element={<Login />} />
      <Route path="/auth/register"           element={<Register />} />
      <Route path="/auth/register-success"   element={<RegisterSuccess />} />
      <Route path="/auth/google/callback"    element={<GoogleCallback />} />
      {/* Email verification */}
      <Route path="/auth/verify-email"       element={<VerifyEmail />} />
      {/* Password reset */}
      <Route path="/auth/forgot-password"    element={<ForgotPassword />} />
      <Route path="/auth/reset-password"     element={<ResetPassword />} />
      {/* Redirects shorthand */}
      <Route path="/login"    element={<Navigate to="/auth/login"    replace />} />
      <Route path="/register" element={<Navigate to="/auth/register" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
