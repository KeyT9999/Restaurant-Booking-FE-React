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
import ProfilePage     from './pages/profile/ProfilePage';
import ProtectedRoute  from './components/ProtectedRoute';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserForm from './pages/admin/AdminUserForm';
import AdminRestaurants from './pages/admin/AdminRestaurants';
import AdminRestaurantDetail from './pages/admin/AdminRestaurantDetail';
import AdminBookings from './pages/admin/AdminBookings';
import AdminBookingDetail from './pages/admin/AdminBookingDetail';
import OwnerProtectedRoute from './components/owner/OwnerProtectedRoute';
import OwnerRestaurants from './pages/owner/OwnerRestaurants';
import CreateRestaurantPage from './pages/owner/CreateRestaurantPage';
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
      {/* Protected routes */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Owner routes */}
      <Route
        path="/owner/*"
        element={
          <OwnerProtectedRoute>
            <Routes>
              <Route path="restaurants" element={<OwnerRestaurants />} />
              <Route path="restaurants/create" element={<CreateRestaurantPage />} />
              <Route path="*" element={<Navigate to="restaurants" replace />} />
            </Routes>
          </OwnerProtectedRoute>
        }
      />
      
      {/* Admin routes */}
      <Route
        path="/admin/*"
        element={
          <AdminProtectedRoute>
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="users/create" element={<AdminUserForm />} />
              <Route path="users/:id/edit" element={<AdminUserForm />} />
              <Route path="restaurants" element={<AdminRestaurants />} />
              <Route path="restaurants/:id" element={<AdminRestaurantDetail />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="bookings/:id" element={<AdminBookingDetail />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </AdminProtectedRoute>
        }
      />

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

