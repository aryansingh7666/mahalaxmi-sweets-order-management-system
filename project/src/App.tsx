import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Toast from './components/shared/Toast';
import ProtectedRoute from './components/shared/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import KioskPage from './pages/KioskPage';
import CheckoutPage from './pages/CheckoutPage';
import SuccessPage from './pages/SuccessPage';
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import MenuPage from './pages/admin/MenuPage';
import OrdersPage from './pages/admin/OrdersPage';
import CustomersPage from './pages/admin/CustomersPage';
import CouponsPage from './pages/admin/CouponsPage';
import SettingsPage from './pages/admin/SettingsPage';
import KitchenPage from './pages/admin/KitchenPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <CartProvider>
          <AuthProvider>
            <ToastProvider>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Navigate to="/kiosk" replace />} />
                <Route path="/kiosk" element={<KioskPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/success" element={<SuccessPage />} />
                <Route path="/admin/login" element={<LoginPage />} />
                <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="menu" element={<MenuPage />} />
                  <Route path="orders" element={<OrdersPage />} />
                  <Route path="customers" element={<CustomersPage />} />
                  <Route path="coupons" element={<CouponsPage />} />
                  <Route path="kitchen" element={<KitchenPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>
              </Routes>
              <Toast />
            </ToastProvider>
          </AuthProvider>
        </CartProvider>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
