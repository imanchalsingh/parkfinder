import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as Icons from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";
import { useOnboarding } from "../context/OnboardingContext";

const THEME_CLASSES = {
  light: {
    bg: "bg-[#f8fafc]",
    navBgScrolled: "bg-white/90 backdrop-blur-xl border-b border-gray-200",
    navBgUnscrolled: "bg-white/70 backdrop-blur-lg",
    text: "text-gray-900",
    textSecondary: "text-gray-600",
    border: "border-gray-200",
    card: "bg-white/80 border-gray-200",
    hover: "hover:bg-gray-100",
    gradient: "from-blue-600 via-indigo-500 to-pink-500",
    active:
      "bg-gradient-to-r from-blue-500/10 to-pink-500/10 border border-blue-200",
  },
  dark: {
    bg: "bg-[#0a0a0a]",
    navBgScrolled: `
      bg-[#141414]
      backdrop-blur-xl
      border-b border-white/10
      shadow-[0_8px_30px_rgba(0,0,0,0.45)]
    `,
    navBgUnscrolled: `
      bg-[#141414]
      backdrop-blur-xl
      border-b border-white/5
    `,
    text: "text-white",
    textSecondary: "text-white/70",
    border: "border-white/10",
    card: "bg-white/5 border-white/10",
    hover: "hover:bg-white/10",
    gradient: "from-[#1B42CB] via-[#5B7CFF] to-[#FF2F6C]",
    active:
      "bg-gradient-to-r from-[#1B42CB]/20 to-[#FF2F6C]/20 border border-[#1B42CB]/20",
  },
} as const;

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const { launchOnboarding } = useOnboarding();

  const { t, i18n } = useTranslation();
  // =========================
  // SCROLL EFFECT
  // =========================

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // =========================
  // THEME CLASSES
  // =========================

  const themeClasses =
    THEME_CLASSES[theme as keyof typeof THEME_CLASSES] || THEME_CLASSES.light;
  const navBg = isScrolled ? themeClasses.navBgScrolled : themeClasses.navBgUnscrolled;

  // =========================
  // NAVIGATION ITEMS
  // =========================

  const navItems = [
    {
      name: t("navbar.home"),
      path: "/",
      icon: Icons.Home,
    },
    {
      name: t("navbar.dashboard"),
      path: "/dashboard",
      icon: Icons.LayoutDashboard,
    },
    {
      name: t("navbar.parking_slots"),
      path: "/parkingslots",
      icon: Icons.MapPin,
    },
    {
      name: t("navbar.bookings"),
      path: "/bookings",
      icon: Icons.Calendar,
    },
    {
      name: t("navbar.favorites"),
      path: "/favorites",
      icon: Icons.Heart,
    },
    {
      name: t("navbar.contact"),
      path: "/contact",
      icon: Icons.LifeBuoy,
    },

    ...(user?.role === "admin"
      ? [
          {
            name: "Admin Panel",
            path: "/admin-panel",
            icon: Icons.Shield,
          },
        ]
      : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    logout();

    navigate("/login");

    setIsDropdownOpen(false);

    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* ========================= */}
      {/* NAVBAR */}
      {/* ========================= */}

      <nav
        className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-500
          ${navBg}
        `}
      >
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* ========================= */}
            {/* LOGO */}
            {/* ========================= */}

            <Link to="/" className="relative flex items-center group">
              {/* <img
                src="/logo.png"
                alt="SmartPark"
                className="h-12 md:h-14 w-auto object-contain transition-all duration-500 group-hover:scale-110"
                style={{
                  filter:
                    theme === "light"
                      ? "drop-shadow(0 0 10px rgba(27,66,203,0.25))"
                      : "brightness(0) invert(1) drop-shadow(0 0 12px rgba(91,124,255,0.5))",
                }}
              /> */}

              <img
                src="/logo.png"
                alt="SmartPark"
                className="h-11 md:h-12 w-auto object-contain transition-all duration-300 group-hover:scale-105"
                style={{
                  filter:
                    theme === "light"
                      ? "brightness(0)"
                      : "brightness(0) invert(1)",
                }}
              />

              {/* Glow */}
              <div
                className={`
                  absolute inset-0
                  opacity-0 group-hover:opacity-100
                  transition-opacity duration-500
                  bg-gradient-to-r ${themeClasses.gradient}
                  blur-3xl rounded-full
                  -z-10
                `}
              ></div>
            </Link>

            {/* ========================= */}
            {/* DESKTOP NAVIGATION */}
            {/* ========================= */}

            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    aria-current={isActive(item.path) ? "page" : undefined}
                    className={`
                      relative
                      flex items-center gap-2
                      px-5 py-3
                      rounded-2xl
                      font-medium
                      overflow-hidden
                      transition-all duration-300
                      group
                      ${
                        isActive(item.path)
                          ? `${themeClasses.active} ${themeClasses.text}`
                          : `${themeClasses.textSecondary} ${themeClasses.hover}`
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />

                    <span className="relative z-10">{item.name}</span>

                    {/* Hover Line */}
                    <div
                      className={`
                        absolute bottom-0 left-1/2
                        -translate-x-1/2
                        h-[2px] w-0
                        group-hover:w-3/4
                        transition-all duration-500
                        bg-gradient-to-r ${themeClasses.gradient}
                      `}
                    ></div>
                  </Link>
                );
              })}
            </div>

            {/* ========================= */}
            {/* RIGHT SIDE */}
            {/* ========================= */}

            <div className="hidden md:flex items-center gap-4">
              {/* LANGUAGE TOGGLE */}
              <button
                onClick={() => i18n.changeLanguage(i18n.language === "en" ? "es" : "en")}
                aria-label="Toggle Language"
                className={`
                  relative overflow-hidden
                  w-12 h-12
                  rounded-2xl
                  border
                  flex items-center justify-center
                  transition-all duration-500
                  hover:scale-105
                  active:scale-95
                  group
                  font-bold
                  ${themeClasses.card}
                  ${themeClasses.text}
                `}
              >
                <div
                  className={`
                    absolute inset-0
                    opacity-0 group-hover:opacity-100
                    transition-opacity duration-500
                    bg-gradient-to-r ${themeClasses.gradient}
                    blur-2xl
                  `}
                ></div>
                <span className="relative z-10">{i18n.language === "es" ? "ES" : "EN"}</span>
              </button>

              {/* TOUR BUTTON */}
              <button
                onClick={launchOnboarding}
                aria-label="How it works"
                className={`
                  flex items-center gap-2
                  px-4 py-2.5
                  rounded-2xl
                  border
                  font-medium
                  transition-all duration-300
                  hover:scale-[1.02]
                  ${themeClasses.card}
                  ${themeClasses.text}
                `}
              >
                <Icons.HelpCircle className="w-4 h-4" />
                <span className="text-sm">Tour</span>
              </button>

              {/* THEME TOGGLE */}

              <button
                onClick={toggleTheme}
                aria-label="Toggle Theme"
                className={`
                  relative overflow-hidden
                  w-12 h-12
                  rounded-2xl
                  border
                  flex items-center justify-center
                  transition-all duration-500
                  hover:scale-105
                  active:scale-95
                  group
                  ${themeClasses.card}
                `}
              >
                {/* Glow */}

                <div
                  className={`
                    absolute inset-0
                    opacity-0 group-hover:opacity-100
                    transition-opacity duration-500
                    bg-gradient-to-r ${themeClasses.gradient}
                    blur-2xl
                  `}
                ></div>

                {/* ICON */}

                <div className="relative z-10">
                  {theme === "dark" ? (
                    <Icons.Sun
                      className="
                        w-5 h-5 text-white
                        transition-transform duration-500
                        group-hover:rotate-180
                      "
                    />
                  ) : (
                    <Icons.Moon
                      className="
                        w-5 h-5 text-blue-600
                        transition-transform duration-500
                        group-hover:-rotate-12
                      "
                    />
                  )}
                </div>
              </button>

              {/* USER */}

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`
                      flex items-center gap-3
                      px-4 py-2.5
                      rounded-2xl
                      border
                      transition-all duration-300
                      hover:scale-[1.02]
                      ${themeClasses.card}
                    `}
                  >
                    <Icons.User
                      className={`w-4 h-4 ${themeClasses.textSecondary}`}
                    />

                    <span
                      className={`font-medium text-sm ${themeClasses.text}`}
                    >
                      {user.name?.toUpperCase()}
                    </span>

                    <Icons.ChevronDown
                      className={`
                        w-4 h-4
                        transition-transform duration-300
                        ${themeClasses.textSecondary}
                        ${isDropdownOpen ? "rotate-180" : ""}
                      `}
                    />
                  </button>

                  {/* DROPDOWN */}

                  {isDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0"
                        onClick={() => setIsDropdownOpen(false)}
                      ></div>

                      <div
                        className={`
                          absolute right-0 mt-3 w-56
                          rounded-3xl
                          overflow-hidden
                          backdrop-blur-2xl
                          border
                          shadow-2xl
                          z-50
                          ${themeClasses.card}
                        `}
                      >
                        <div
                          className={`
                            p-4 border-b
                            ${themeClasses.border}
                          `}
                        >
                          <p className={`font-semibold ${themeClasses.text}`}>
                            {user.name}
                          </p>

                          <p
                            className={`text-sm ${themeClasses.textSecondary}`}
                          >
                            {user.role === "admin" ? "Administrator" : "User"}
                          </p>
                        </div>

                        <button
                          onClick={handleLogout}
                          className="
                            w-full
                            flex items-center justify-between
                            px-4 py-4
                            text-[#FF2F6C]
                            hover:bg-[#FF2F6C]/10
                            transition-all duration-300
                          "
                        >
                          <span>Logout</span>

                          <Icons.LogOut className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  {/* LOGIN */}

                  <button
                    onClick={() => navigate("/login")}
                    className={`
                      px-5 py-3
                      rounded-2xl
                      border
                      flex items-center gap-2
                      transition-all duration-300
                      hover:scale-[1.03]
                      ${themeClasses.card}
                      ${themeClasses.text}
                    `}
                  >
                    <Icons.LogIn className="w-4 h-4" />

                    <span>Login</span>
                  </button>

                  {/* SIGNUP */}

                  <button
                    onClick={() => navigate("/signup")}
                    className={`
                      px-5 py-3
                      rounded-2xl
                      text-white
                      flex items-center gap-2
                      transition-all duration-500
                      hover:scale-[1.03]
                      bg-gradient-to-r ${themeClasses.gradient}
                      shadow-lg
                    `}
                  >
                    <Icons.UserPlus className="w-4 h-4" />

                    <span>Sign Up</span>
                  </button>
                </>
              )}
            </div>

            {/* ========================= */}
            {/* MOBILE MENU BUTTON */}
            {/* ========================= */}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
              className={`
                md:hidden
                w-11 h-11
                rounded-2xl
                border
                flex items-center justify-center
                ${themeClasses.card}
                ${themeClasses.text}
              `}
            >
              {isMobileMenuOpen ? (
                <Icons.X className="w-6 h-6" />
              ) : (
                <Icons.Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* ========================= */}
        {/* MOBILE MENU */}
        {/* ========================= */}

        {isMobileMenuOpen && (
          <div
            className={`
              md:hidden
              border-t
              backdrop-blur-2xl
              ${themeClasses.card}
            `}
          >
            <div className="px-4 py-4 space-y-2">
              {/* THEME BUTTON */}

              {/* <button
                onClick={toggleTheme}
                className={`
                  w-full
                  flex items-center justify-center gap-3
                  px-4 py-4
                  rounded-2xl
                  border
                  transition-all duration-300
                  ${themeClasses.card}
                  ${themeClasses.text}
                `}
              >
                {theme === "dark" ? (
                  <Icons.Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Icons.Moon className="w-5 h-5 text-blue-600" />
                )}

                <span>
                  Switch to {theme === "dark" ? "Light" : "Dark"} Mode
                </span>
              </button> */}

              <button
                onClick={toggleTheme}
                aria-label="Toggle Theme"
                className={`fixed top-5 right-[5.5rem] z-50 p-3 rounded-full backdrop-blur-lg border transition-all duration-300 hover:scale-110 ${
                  theme === "light"
                    ? "bg-white border-gray-300 text-black"
                    : "bg-white/10 border-white/20 text-white"
                }`}
              >
                {theme === "dark" ? (
                  <Icons.Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Icons.Moon className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={() => i18n.changeLanguage(i18n.language === "en" ? "es" : "en")}
                aria-label="Toggle Language"
                className={`fixed top-5 right-[10rem] z-50 px-3 py-3 font-bold rounded-full backdrop-blur-lg border transition-all duration-300 hover:scale-110 ${
                  theme === "light"
                    ? "bg-white border-gray-300 text-black"
                    : "bg-white/10 border-white/20 text-white"
                }`}
              >
                {i18n.language === "es" ? "ES" : "EN"}
              </button>

              {/* TOUR BUTTON MOBILE */}
              <button
                onClick={() => {
                  launchOnboarding();
                  setIsMobileMenuOpen(false);
                }}
                className={`
                  w-full
                  flex items-center gap-3
                  px-4 py-4
                  rounded-2xl
                  transition-all duration-300
                  ${themeClasses.textSecondary} ${themeClasses.hover}
                `}
              >
                <Icons.HelpCircle className="w-5 h-5" />
                <span>How it works</span>
              </button>

              {/* NAV ITEMS */}

              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-current={isActive(item.path) ? "page" : undefined}
                    className={`
                      flex items-center gap-3
                      px-4 py-4
                      rounded-2xl
                      transition-all duration-300
                      ${
                        isActive(item.path)
                          ? `${themeClasses.active} ${themeClasses.text}`
                          : `${themeClasses.textSecondary} ${themeClasses.hover}`
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />

                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* SPACER */}

      <div className="h-16 md:h-20"></div>

      {/* BACKGROUND GLOW */}

      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div
          className="
            absolute top-0 right-0
            w-96 h-96
            bg-blue-500/10
            rounded-full
            blur-3xl
          "
        ></div>

        <div
          className="
            absolute bottom-0 left-0
            w-96 h-96
            bg-pink-500/10
            rounded-full
            blur-3xl
          "
        ></div>
      </div>
    </>
  );
};

export default Navbar;
