import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Delay slightly for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:max-w-md z-50"
          role="alertdialog"
          aria-labelledby="cookie-banner-title"
          aria-describedby="cookie-banner-desc"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-5 border border-gray-100 dark:border-gray-700 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                  <Cookie size={24} />
                </div>
                <h3 id="cookie-banner-title" className="font-semibold text-gray-900 dark:text-white text-lg">
                  Cookie Preferences
                </h3>
              </div>
              <button
                onClick={handleDecline}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Close cookie banner"
              >
                <X size={20} />
              </button>
            </div>
            
            <p id="cookie-banner-desc" className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.{' '}
              <Link to="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                Learn more
              </Link>
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button
                onClick={handleDecline}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-sm transition-colors"
              >
                Decline Optional
              </button>
              <button
                onClick={handleAccept}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors shadow-sm sm:ml-auto"
              >
                Accept All
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
