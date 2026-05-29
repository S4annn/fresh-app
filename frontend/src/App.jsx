import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/common/ErrorBoundary'
import ScrollToTop from './components/common/ScrollToTop'
import FeedbackProvider from './components/feedback/FeedbackProvider'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import VerifyOtpPage from './pages/VerifyOtpPage'
import PricingPage from './pages/PricingPage'
import CheckoutPage from './pages/CheckoutPage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'
import DashboardPage from './pages/DashboardPage'
import InventoryPage from './pages/InventoryPage'
import AddInventoryPage from './pages/AddInventoryPage'
import PemindaiAIPage from './pages/PemindaiAIPage'
import RekomendasiPage from './pages/RekomendasiPage'
import MarketplacePage from './pages/MarketplacePage'
import PesananPage from './pages/PesananPage'
import PesananDetailPage from './pages/PesananDetailPage'
import NotificationPage from './pages/NotificationPage'
import DonasiPage from './pages/DonasiPage'
import ProfilePage from './pages/ProfilePage'
import DashboardBisnisPage from './pages/DashboardBisnisPage'
import ProdukBisnisPage from './pages/ProdukBisnisPage'
import PesananBisnisPage from './pages/PesananBisnisPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import AnalyticsPage from './pages/AnalyticsPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <ErrorBoundary>
      <FeedbackProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* PUBLIC */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/pricing" element={<PricingPage />} />

            {/* CHECKOUT — requires login but no specific role */}
            <Route element={<ProtectedRoute allowedRoles={['pribadi', 'bisnis']} />}>
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/checkout/success" element={<PaymentSuccessPage />} />
            </Route>

            {/* PERSONAL ROLE */}
            <Route element={<ProtectedRoute allowedRoles={['pribadi']} />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/inventory/add" element={<AddInventoryPage />} />
              <Route path="/scanner" element={<PemindaiAIPage />} />
              <Route path="/rekomendasi" element={<RekomendasiPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/pesanan" element={<PesananPage />} />
              <Route path="/pesanan/:id" element={<PesananDetailPage />} />
              <Route path="/notifications" element={<NotificationPage />} />
              <Route path="/donasi" element={<DonasiPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
            </Route>

            {/* BUSINESS ROLE */}
            <Route element={<ProtectedRoute allowedRoles={['bisnis']} />}>
              <Route path="/dashboard-bisnis" element={<DashboardBisnisPage />} />
              <Route path="/produk" element={<ProdukBisnisPage />} />
              <Route path="/pesanan-bisnis" element={<PesananBisnisPage />} />
              <Route path="/scanner-bisnis" element={<PemindaiAIPage />} />
              <Route path="/notifications-bisnis" element={<NotificationPage />} />
              <Route path="/marketplace-bisnis" element={<MarketplacePage />} />
              <Route path="/profile-bisnis" element={<ProfilePage />} />
              <Route path="/analytics-bisnis" element={<AnalyticsPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </FeedbackProvider>
    </ErrorBoundary>
  )
}
