import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { trackPageView } from './utils/analytics'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ProductListPage from './pages/ProductListPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import WishlistPage from './pages/WishlistPage'
import ProfilePage from './pages/ProfilePage'
import OrderTrackingPage from './pages/OrderTrackingPage'
import OrderDetailPage from './pages/OrderDetailPage'
import SupportPage from './pages/SupportPage'
import SizeGuidePage from './pages/SizeGuidePage'
import ReturnPage from './pages/ReturnPage'
import ReferralPage from './pages/ReferralPage'
import GiftCardPage from './pages/GiftCardPage'
import LegalPage from './pages/legal/LegalPage'
import SellerDashboardPage from './pages/seller/SellerDashboardPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'

function PageViewTracker() {
  const location = useLocation()
  useEffect(() => { trackPageView(location.pathname + location.search) }, [location])
  return null
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-page-gradient">
      <div className="promo-strip hidden sm:block">
        Free delivery on orders above ₹499 · New arrivals every week · Use code WELCOME10
      </div>
      <PageViewTracker />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/orders" element={<OrderTrackingPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/returns" element={<ReturnPage />} />
          <Route path="/referral" element={<ReferralPage />} />
          <Route path="/gift-cards" element={<GiftCardPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/size-guide" element={<SizeGuidePage />} />
          <Route path="/legal/:slug" element={<LegalPage />} />
          <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="*" element={
            <div className="page-shell text-center py-24">
              <div className="empty-state inline-block max-w-md">
                <div className="empty-state-icon">🔍</div>
                <h2 className="font-display text-2xl font-semibold mb-2 relative z-10">Page not found</h2>
                <p className="text-gray-500 mb-6 relative z-10">The page you're looking for doesn't exist or has moved.</p>
                <Link to="/" className="btn-primary relative z-10">Go Home</Link>
              </div>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
