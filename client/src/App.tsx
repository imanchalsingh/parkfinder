import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ParkingSlotPage from "./components/ParkingSlotPage";
import BookedSlotsPage from "./components/BookedSlotsPage";
import "./App.css";

// Eagerly loaded components (essential/layout)
import { OnboardingProvider } from "./context/OnboardingContext";
import OnboardingCarousel from "./components/OnboardingCarousel";
import Navbar from "./components/Navbar";
import SessionTimeout from "./components/SessionTimeout";
import CookieConsent from "./components/CookieConsent";
import BackToTop from "./components/BackToTop";

// Lazy loaded components (route-level)
const HomePage = React.lazy(() => import("./components/HomePage"));
const DashboardPage = React.lazy(() => import("./components/Dashboard"));
const ParkingSlotPage = React.lazy(() => import("./components/ParkingSlotPage"));
const BookedSlotsPage = React.lazy(() => import("./components/BookedSlotsPage"));
const FavoritesPage = React.lazy(() => import("./pages/FavoritesPage"));
const SignupPage = React.lazy(() => import("./pages/SignupPage"));
const LoginPage = React.lazy(() => import("./pages/LoginPage"));
const ForgotPasswordPage = React.lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = React.lazy(() => import("./pages/ResetPasswordPage"));
const AdminPanel = React.lazy(() => import("./components/AdminPanel"));
const PrivacyPage = React.lazy(() => import("./pages/PrivacyPage"));
const TermsPage = React.lazy(() => import("./pages/TermsPage"));
const ContactPage = React.lazy(() => import("./pages/ContactPage"));
const NotFoundPage = React.lazy(() => import("./pages/NotFoundPage"));

// Global Loader component for Suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-transparent">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-[#1B42CB]/20 border-t-[#FF2F6C] rounded-full animate-spin"></div>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Toaster 
        position="top-center" 
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '10px',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <SessionTimeout />
      <CookieConsent />
      <Navbar />
      <BackToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/parkingslots" element={<ParkingSlotPage />} />
          <Route path="/bookings" element={<BookedSlotsPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/admin-panel" element={<AdminPanel />} />
          
          {/* Naye added routes */}
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;