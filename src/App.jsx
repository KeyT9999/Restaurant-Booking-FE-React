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
import RestaurantsPage from './pages/restaurants/RestaurantsPage';
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
import AdminChatPage from './pages/admin/AdminChatPage';
import OwnerProtectedRoute from './components/owner/OwnerProtectedRoute';
import { ChatWidgetProvider } from './context/ChatWidgetProvider';
import MiniChatWidget from './components/chat-widget/MiniChatWidget';
import { RestaurantProvider } from './context/RestaurantProvider';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerChatPage from './pages/owner/OwnerChatPage';
import OwnerRestaurants from './pages/owner/OwnerRestaurants';
import CreateRestaurantPage from './pages/owner/CreateRestaurantPage';
import EditRestaurantPage from './pages/owner/EditRestaurantPage';
import MenuPage from './pages/owner/MenuPage';
import TablePage from './pages/owner/TablePage';
import RestaurantDetailPage from './pages/restaurants/RestaurantDetailPage';
import CustomerChatPage from './pages/chat/CustomerChatPage';
import BookingFormPage from './pages/booking/BookingFormPage';
import MyBookingsPage from './pages/booking/MyBookingsPage';
import BookingDetailPage from './pages/booking/BookingDetailPage';
import OwnerBookingsPage from './pages/owner/OwnerBookingsPage';
import OwnerBilling from './pages/owner/OwnerBilling';
import PaymentSuccess from './pages/payment/PaymentSuccess';
import PaymentCancel from './pages/payment/PaymentCancel';
import AdminRevenue from './pages/admin/AdminRevenue';
import AdminRefunds from './pages/admin/AdminRefunds';
import OwnerVouchers from './pages/owner/OwnerVouchers';
import SavedVouchers from './pages/profile/SavedVouchers';
import AdminVouchers from './pages/admin/AdminVouchers';
import WaitlistFormPage from './pages/waitlist/WaitlistFormPage';
import MyWaitlistsPage from './pages/waitlist/MyWaitlistsPage';
import WaitlistDetailPage from './pages/waitlist/WaitlistDetailPage';
import OwnerWaitlistPage from './pages/owner/OwnerWaitlistPage';
import OwnerReviewsPage from './pages/owner/OwnerReviewsPage';
import AdminReviews from './pages/admin/AdminReviews';
import AdminWaitlists from './pages/admin/AdminWaitlists';
import useBookingNotifications from './hooks/useBookingNotifications';
import useWaitlistNotifications from './hooks/useWaitlistNotifications';
import './App.css';

function AppRoutes() {
  useBookingNotifications();
  useWaitlistNotifications();
  return (
    <Routes>
      <Route path="/"                        element={<HomePage />} />
      <Route path="/restaurants"             element={<RestaurantsPage />} />
      <Route path="/restaurants/:id"         element={<RestaurantDetailPage />} />
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
      <Route
        path="/restaurants/:id/booking"
        element={
          <ProtectedRoute>
            <BookingFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/restaurants/:id/waitlist"
        element={
          <ProtectedRoute>
            <WaitlistFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute>
            <MyBookingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-waitlists"
        element={
          <ProtectedRoute>
            <MyWaitlistsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-vouchers"
        element={
          <ProtectedRoute>
            <SavedVouchers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings/:id"
        element={
          <ProtectedRoute>
            <BookingDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/waitlists/:id"
        element={
          <ProtectedRoute>
            <WaitlistDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Payment result pages */}
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/payment-cancel" element={<PaymentCancel />} />

      {/* Owner routes */}
      <Route
        path="/owner/*"
        element={
          <OwnerProtectedRoute>
            <RestaurantProvider>
              <Routes>
                <Route path="dashboard" element={<OwnerDashboard />} />
                <Route path="chat" element={<OwnerChatPage />} />
                <Route path="restaurants" element={<OwnerRestaurants />} />
                <Route path="restaurants/create" element={<CreateRestaurantPage />} />
                <Route path="restaurants/:id/edit" element={<EditRestaurantPage />} />
                <Route path="menu" element={<MenuPage />} />
                <Route path="tables" element={<TablePage />} />
                <Route path="bookings" element={<OwnerBookingsPage />} />
                <Route path="waitlists" element={<OwnerWaitlistPage />} />
                <Route path="billing" element={<OwnerBilling />} />
                <Route path="vouchers" element={<OwnerVouchers />} />
                <Route path="reviews" element={<OwnerReviewsPage />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </RestaurantProvider>
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
              <Route path="waitlists" element={<AdminWaitlists />} />
              <Route path="chat" element={<AdminChatPage />} />
              <Route path="revenue" element={<AdminRevenue />} />
              <Route path="refunds" element={<AdminRefunds />} />
              <Route path="vouchers" element={<AdminVouchers />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </AdminProtectedRoute>
        }
      />

      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <CustomerChatPage />
          </ProtectedRoute>
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
      <ChatWidgetProvider>
        <AppRoutes />
        <MiniChatWidget />
      </ChatWidgetProvider>
    </AuthProvider>
  );
}

export default App;
