import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ParkingSlotPage from "./components/ParkingSlotPage";
import BookedSlotsPage from "./components/BookedSlotsPage";
import "./App.css";
import { OnboardingProvider } from "./context/OnboardingContext";
import OnboardingCarousel from "./components/OnboardingCarousel";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AdminPanel from "./components/AdminPanel";
import DashboardPage from "./components/Dashboard";
import BackToTop from "./components/BackToTop";

// Humare naye pages jo humne create kiye hain
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import FavoritesPage from "./pages/FavoritesPage";
import ContactPage from "./pages/ContactPage";
import SessionTimeout from "./components/SessionTimeout";
import CookieConsent from "./components/CookieConsent";
import NotFoundPage from "./pages/NotFoundPage";

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
    </Router>
  );
}

export default App;