import { useState, useEffect } from "react";
import { useOnboarding } from "../context/OnboardingContext";
import { useTheme } from "../context/ThemeContext";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Calendar, QrCode, CreditCard, ChevronRight, ChevronLeft, X } from "lucide-react";

const THEME_CLASSES = {
  light: {
    overlay: "bg-black/50",
    modal: "bg-white",
    text: "text-gray-900",
    textSecondary: "text-gray-600",
    iconColor: "text-blue-600",
    buttonPrimary: "bg-blue-600 text-white hover:bg-blue-700",
    buttonSecondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    dotActive: "bg-blue-600",
    dotInactive: "bg-gray-300",
  },
  dark: {
    overlay: "bg-black/70",
    modal: "bg-[#191919] border border-[#1B42CB]/30",
    text: "text-[#EEECF6]",
    textSecondary: "text-[#EEECF6]/70",
    iconColor: "text-[#1B42CB]",
    buttonPrimary: "bg-[#1B42CB] text-white hover:bg-[#1B42CB]/90",
    buttonSecondary: "bg-[#191919] border border-[#1B42CB]/30 text-[#EEECF6] hover:bg-[#1B42CB]/10",
    dotActive: "bg-[#1B42CB]",
    dotInactive: "bg-gray-700",
  },
} as const;

const slides = [
  {
    id: 1,
    title: "Find the Perfect Spot",
    description: "Search across multiple parking locations, filter by EV charging, and view real-time slot availability.",
    icon: Search,
  },
  {
    id: 2,
    title: "Book in Advance",
    description: "Secure your parking slot before you arrive. Choose your vehicle type and reserve your space hassle-free.",
    icon: Calendar,
  },
  {
    id: 3,
    title: "Scan & Park",
    description: "Upon arrival, use your phone to scan the QR code and instantly check in to your assigned parking slot.",
    icon: QrCode,
  },
  {
    id: 4,
    title: "Seamless Checkout",
    description: "When you're ready to leave, simply check out. Payments are handled smoothly for a complete contactless experience.",
    icon: CreditCard,
  },
];

export default function OnboardingCarousel() {
  const { isVisible, dismissOnboarding } = useOnboarding();
  const { theme } = useTheme();
  const location = useLocation();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Prevent showing onboarding on specific auth pages if it somehow mounts
  const isAuthPage = ["/login", "/signup", "/forgot-password"].includes(location.pathname);

  useEffect(() => {
    // Reset slide to 0 if reopened
    if (isVisible) {
      setCurrentSlide(0);
    }
  }, [isVisible]);

  if (!isVisible || isAuthPage) return null;

  const t = THEME_CLASSES[theme as keyof typeof THEME_CLASSES] || THEME_CLASSES.light;
  const current = slides[currentSlide];
  const Icon = current.icon;
  const isLast = currentSlide === slides.length - 1;

  const nextSlide = () => {
    if (isLast) {
      dismissOnboarding();
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => Math.max(0, prev - 1));
  };

  return (
    <AnimatePresence>
      <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${t.overlay}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative w-full max-w-lg rounded-3xl p-6 md:p-10 shadow-2xl overflow-hidden ${t.modal}`}
        >
          {/* Close Button */}
          <button
            onClick={dismissOnboarding}
            className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${t.buttonSecondary} border-none`}
            aria-label="Skip onboarding"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Slide Content */}
          <div className="flex flex-col items-center text-center mt-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center w-full"
              >
                <div className={`w-24 h-24 mb-6 rounded-full flex items-center justify-center bg-opacity-10 ${t.iconColor.replace("text-", "bg-")}`}>
                  <Icon className={`w-12 h-12 ${t.iconColor}`} />
                </div>
                <h2 className={`text-2xl md:text-3xl font-bold mb-4 ${t.text}`}>
                  {current.title}
                </h2>
                <p className={`text-base md:text-lg leading-relaxed ${t.textSecondary}`}>
                  {current.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Controls */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Progress Dots */}
            <div className="flex space-x-2">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide ? `w-6 ${t.dotActive}` : `w-2 ${t.dotInactive}`
                  }`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center ${
                  currentSlide === 0 ? "opacity-0 pointer-events-none" : t.buttonSecondary
                }`}
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back
              </button>

              <button
                onClick={nextSlide}
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center ${t.buttonPrimary}`}
              >
                {isLast ? "Get Started" : "Next"}
                {!isLast && <ChevronRight className="w-5 h-5 ml-1" />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
