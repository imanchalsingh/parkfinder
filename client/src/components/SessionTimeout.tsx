import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import * as Icons from "lucide-react";
import { useThemeClasses } from "../hooks/useThemeClasses";
import { useTranslation } from "react-i18next";

const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes
const WARNING_DURATION = 29 * 60 * 1000; // Show warning 1 minute before timeout
const ACTIVITY_EVENTS = ["mousemove", "keydown", "scroll", "touchstart", "click"];
const STORAGE_KEY = "lastActivity";

const SessionTimeout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const themeClasses = useThemeClasses();
  const { t } = useTranslation();
  
  const [showWarning, setShowWarning] = useState(false);
  const showWarningRef = React.useRef(showWarning);
  const [timeLeft, setTimeLeft] = useState(60);

  // Keep ref in sync with state for use inside event listeners
  useEffect(() => {
    showWarningRef.current = showWarning;
  }, [showWarning]);

  // We only care if the user is authenticated
  const isAuthenticated = !!user;

  const resetTimer = useCallback(() => {
    if (!isAuthenticated) return;
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    setShowWarning(false);
    setTimeLeft(60);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Set initial activity
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    }

    const checkInactivity = () => {
      const lastActivityStr = localStorage.getItem(STORAGE_KEY);
      if (!lastActivityStr) return;

      const lastActivity = parseInt(lastActivityStr, 10);
      const currentTime = Date.now();
      const timeSinceLastActivity = currentTime - lastActivity;

      if (timeSinceLastActivity >= TIMEOUT_DURATION) {
        // Time is up, log the user out
        logout();
        navigate("/login");
      } else if (timeSinceLastActivity >= WARNING_DURATION) {
        // Show warning
        setShowWarning(true);
        // Calculate remaining seconds
        const remaining = Math.max(0, Math.ceil((TIMEOUT_DURATION - timeSinceLastActivity) / 1000));
        setTimeLeft(remaining);
      } else {
        // Hide warning if we are well within the time limit
        setShowWarning(false);
      }
    };

    // Check inactivity every second
    const intervalId = setInterval(checkInactivity, 1000);

    // Event listeners to detect activity
    const handleActivity = () => {
      // If warning is currently showing, require explicit click on "Continue" button
      if (showWarningRef.current) return;

      // Throttle localStorage updates to once per second
      const lastActivityStr = localStorage.getItem(STORAGE_KEY);
      if (lastActivityStr) {
        const lastActivity = parseInt(lastActivityStr, 10);
        if (Date.now() - lastActivity > 1000) {
          resetTimer();
        }
      } else {
        resetTimer();
      }
    };

    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Handle cross-tab synchronization
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        // Another tab updated activity, hide warning if shown
        setShowWarning(false);
        setTimeLeft(60);
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(intervalId);
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [isAuthenticated, logout, navigate, resetTimer]);

  // We don't want to show timeout on public pages or auth pages
  const isAuthPage = ["/login", "/signup", "/forgot-password"].some(path => location.pathname.includes(path));

  if (!isAuthenticated || isAuthPage || !showWarning) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`relative max-w-sm w-full ${themeClasses.cardBg} border ${themeClasses.cardBorder} rounded-2xl shadow-2xl p-6 text-center animate-in fade-in zoom-in duration-300`}>
        <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/30">
          <Icons.Clock className="w-8 h-8 text-yellow-500 animate-pulse" />
        </div>
        
        <h2 className={`text-xl font-bold ${themeClasses.text} mb-2`}>{t("session.warning_title")}</h2>
        
        <p className={`${themeClasses.textSecondary} mb-6`}>
          {t("session.warning_desc")} 
          <span className="font-mono text-[#FF2F6C] font-bold mx-1 text-lg">{timeLeft}</span> 
          {t("session.seconds")}
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className={`px-4 py-2 rounded-xl font-semibold border ${themeClasses.border} ${themeClasses.textSecondary} hover:${themeClasses.bg} transition-colors`}
          >
            {t("session.logout_now")}
          </button>
          
          <button
            onClick={resetTimer}
            className={`px-6 py-2 rounded-xl font-semibold text-white bg-gradient-to-r ${themeClasses.gradient.primary} hover:shadow-lg hover:shadow-[#1B42CB]/20 transition-all`}
          >
            {t("session.continue")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeout;
