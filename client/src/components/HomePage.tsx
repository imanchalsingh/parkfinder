import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MapComponent from "./MapComponent";
import * as Icons from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";

const THEME_CLASSES = {
  light: {
    bg: "bg-gray-50",
    text: "text-gray-900",
    textSecondary: "text-gray-600",
    border: "border-gray-200",
    cardBg: "bg-white",
    cardBorder: "border-gray-200",
    overlay: "bg-black/5",
    linear: {
      primary: "from-blue-600 to-blue-500",
      secondary: "from-pink-600 to-pink-500",
      accent: "from-blue-600 to-pink-600",
    },
  },
  dark: {
    bg: "bg-[#191919]",
    text: "text-[#EEECF6]",
    textSecondary: "text-[#EEECF6]/70",
    border: "border-[#1B42CB]/20",
    cardBg: "bg-[#191919]/40",
    cardBorder: "border-[#1B42CB]/20",
    overlay: "bg-black/40",
    linear: {
      primary: "from-[#1B42CB] to-[#1B42CB]/80",
      secondary: "from-[#FF2F6C] to-[#FF2F6C]/80",
      accent: "from-[#1B42CB] to-[#FF2F6C]",
    },
  },
} as const;

const HomePage: React.FC = () => {
  const [isStarred, setIsStarred] = useState(false);
  const [favoriteMessage, setFavoriteMessage] = useState("");
  const [activeSection, setActiveSection] = useState(0);
  const [parkingSlots, setParkingSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ===== PAGINATION STATE =====
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 6;

  // Detect system theme
  const { theme } = useTheme();
  const { t } = useTranslation();

  interface ParkingSlot {
    [key: string]: unknown;
  }

  interface Coordinates {
    lat: number;
    lng: number;
  }

  const mockCoordinates: Coordinates[] = [
    { lat: 28.6159, lng: 77.2095 },
    { lat: 28.612, lng: 77.208 },
    { lat: 28.6145, lng: 77.2105 },
    { lat: 28.611, lng: 77.207 },
    { lat: 28.6165, lng: 77.211 },
    { lat: 28.6135, lng: 77.206 },
    { lat: 28.617, lng: 77.212 },
    { lat: 28.6105, lng: 77.205 },
    { lat: 28.618, lng: 77.213 },
    { lat: 28.6095, lng: 77.204 },
  ];

  // ===== FETCH PARKING SLOTS WITH PAGINATION =====
  const fetchParkingSlots = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/parking?page=${page}&limit=${pageSize}`);
      const result = await response.json();

      if (result.success) {
        const slotsWithCoordinates = result.data.map(
          (slot: ParkingSlot, index: number) => ({
            ...slot,
            coordinates: mockCoordinates[index % mockCoordinates.length] || {
              lat: 28.6139,
              lng: 77.209,
            },
          })
        );
        setParkingSlots(slotsWithCoordinates);
        setCurrentPage(result.pagination.currentPage);
        setTotalPages(result.pagination.totalPages);
        setTotalItems(result.pagination.totalItems);
        setError(null);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParkingSlots(1);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll(".home-section");
      const scrollPos = window.scrollY + window.innerHeight / 2;

      sections.forEach((section, index) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        const sectionHeight = (section as HTMLElement).offsetHeight;

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
          setActiveSection(index);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (index: number) => {
    const section = document.querySelectorAll(".home-section")[index];
    section?.scrollIntoView({ behavior: "smooth" });
  };

  const features = [
    {
      icon: Icons.MapPin,
      title: "Real-Time Availability",
      description: "See live parking slot availability updated every minute",
      color: "from-[#1B42CB] to-[#1B42CB]/80",
    },
    {
      icon: Icons.Navigation,
      title: "Smart Navigation",
      description: "Get turn-by-turn directions to your booked parking spot",
      color: "from-[#FF2F6C] to-[#FF2F6C]/80",
    },
    {
      icon: Icons.Shield,
      title: "Best Price Guarantee",
      description: "We guarantee the best parking rates in your area",
      color: "from-[#1B42CB] to-[#FF2F6C]",
    },
    {
      icon: Icons.Lock,
      title: "Secure Parking",
      description: "24/7 surveillance and security at all our locations",
      color: "from-[#FF2F6C] to-[#1B42CB]",
    },
  ];

  const themeClasses =
    THEME_CLASSES[theme as keyof typeof THEME_CLASSES] || THEME_CLASSES.light;

  return (
    <div
      className={`relative ${themeClasses.bg} transition-colors duration-300`}
    >
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#1B42CB]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#FF2F6C]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-linear-to-r from-[#1B42CB]/5 to-[#FF2F6C]/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Navigation Dots */}
      <div className="fixed right-[2px] sm:right-3 lg:right-6 top-1/2 transform -translate-y-1/2 z-40 flex flex-col gap-1.5 sm:gap-2">
        {[0, 1, 2].map((index) => (
          <button
            key={index}
            onClick={() => scrollToSection(index)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              activeSection === index
                ? `bg-linear-to-r ${themeClasses.linear.accent} scale-125`
                : "bg-gray-400/40 hover:bg-gray-400/60"
            }`}
            aria-label={`Go to section ${index + 1}`}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="home-section min-h-screen flex items-center justify-center relative px-4 py-16 md:py-24">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#1B42CB]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FF2F6C]/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                <span className="block">
                  <span className="bg-linear-to-br from-gray-900 via-[#1B42CB] to-[#FF2F6C] bg-clip-text text-transparent dark:from-white">
                    {t("home.hero_title_1")}
                  </span>
                </span>
                <span className="block mt-2">
                  <span className="relative">
                    <span className="bg-linear-to-br from-[#FF2F6C] via-[#1B42CB] to-gray-900 bg-clip-text text-transparent dark:to-white">
                      {t("home.hero_title_2")}
                    </span>
                    <span
                      className={`absolute -bottom-2 left-0 w-full h-1 bg-linear-to-br from-[#FF2F6C] to-[#1B42CB] rounded-full`}
                    ></span>
                  </span>
                </span>
              </h1>

              <div className="flex flex-wrap items-center gap-6 mb-8">
                <div className="flex items-center gap-3">
                  <div className={`text-3xl font-bold ${themeClasses.text}`}>
                    98%
                  </div>
                  <div className={themeClasses.textSecondary}>
                    Occupancy Rate
                  </div>
                </div>
                <div className="h-6 w-px bg-gray-700"></div>
                <div className="flex items-center gap-3">
                  <div className={`text-3xl font-bold ${themeClasses.text}`}>
                    24/7
                  </div>
                  <div className={themeClasses.textSecondary}>Support</div>
                </div>
              </div>

              <p
                className={`text-xl ${themeClasses.textSecondary} mb-10 max-w-2xl leading-relaxed`}
              >
                {t("home.hero_desc")}
              </p>

              <div className="flex flex-col sm:flex-row gap-5 mb-12">
                <Link
                  to="/parkingslots"
                  className={`group px-10 py-3 bg-linear-to-br from-[#1B42CB] via-[#6C3BFF] to-[#FF2F6C] text-white font-bold rounded-2xl text-lg hover:shadow-2xl hover:shadow-[#FF2F6C]/30 transition-all duration-500 transform hover:-translate-y-1 hover:scale-[1.02] flex items-center justify-center gap-3`}
                >
                  <span>{t("home.find_parking")}</span>
                  <Icons.ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right Side - Parking Card */}
            <div className="flex-1 w-full">
              <div className="relative max-w-md mx-auto lg:mx-0">
                <div
                  className={`backdrop-blur-xl ${themeClasses.cardBg} ${themeClasses.cardBorder} border rounded-3xl p-8 shadow-2xl shadow-[#1B42CB]/20 overflow-hidden`}
                >
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-8">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className={`w-12 h-12 bg-linear-to-br ${themeClasses.linear.accent} rounded-xl flex items-center justify-center`}
                          >
                            <Icons.Building2 className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3
                              className={`text-2xl font-bold ${themeClasses.text}`}
                            >
                              Platinum Tower
                            </h3>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-sm ${themeClasses.textSecondary}`}
                              >
                                Downtown
                              </span>
                              <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded-full">
                                TOP RATED
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (!isStarred) {
                            setFavoriteMessage("Saved to favorites !");
                          } else {
                            setFavoriteMessage("Removed from favorites");
                          }
                          setIsStarred(!isStarred);
                          setTimeout(() => {
                            setFavoriteMessage("");
                          }, 2000);
                        }}
                        className={`relative p-3 hover:${themeClasses.overlay} rounded-xl transition-colors`}
                      >
                        {favoriteMessage && (
                          <div className="absolute -top-1 right-0 text-[10px] text-yellow-500 whitespace-nowrap">
                            {favoriteMessage}
                          </div>
                        )}
                        <Icons.Star
                          className={`w-5 h-5 ${
                            isStarred
                              ? "text-yellow-400 fill-yellow-400"
                              : themeClasses.textSecondary
                          }`}
                        />
                      </button>
                    </div>

                    <div
                      className={`bg-linear-to-br from-black/30 to-black/50 rounded-2xl p-6 mb-6 ${themeClasses.cardBorder} border`}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <div
                            className={`text-sm ${themeClasses.textSecondary}`}
                          >
                            LIVE AVAILABILITY
                          </div>
                          <div
                            className={`text-3xl font-bold ${themeClasses.text} mt-1`}
                          >
                            12/24
                          </div>
                        </div>
                        <div className="relative">
                          <div className="w-20 h-20">
                            <svg
                              className="w-full h-full"
                              viewBox="0 0 100 100"
                            >
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="#1F2937"
                                strokeWidth="8"
                              />
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="url(#linear)"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray="251.2"
                                strokeDashoffset="75.36"
                                transform="rotate(-90 50 50)"
                              />
                              <defs>
                                <linearGradient
                                  id="linear"
                                  x1="0%"
                                  y1="0%"
                                  x2="100%"
                                  y2="0%"
                                >
                                  <stop offset="0%" stopColor="#1B42CB" />
                                  <stop offset="100%" stopColor="#FF2F6C" />
                                </linearGradient>
                              </defs>
                            </svg>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-white font-bold text-lg`}>
                              50%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-sm ${themeClasses.textSecondary}`}
                        >
                          Updated 2 mins ago
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div
                        className={`bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors`}
                      >
                        <div
                          className={`text-sm ${themeClasses.textSecondary} mb-1`}
                        >
                          RATE
                        </div>
                        <div
                          className={`text-2xl font-bold ${themeClasses.text}`}
                        >
                          ₹80/hr
                        </div>
                        <div
                          className={`text-xs ${themeClasses.textSecondary}`}
                        >
                          ₹500 day max
                        </div>
                      </div>
                      <div
                        className={`bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors`}
                      >
                        <div
                          className={`text-sm ${themeClasses.textSecondary} mb-1`}
                        >
                          DISTANCE
                        </div>
                        <div
                          className={`text-2xl font-bold ${themeClasses.text}`}
                        >
                          0.8 km
                        </div>
                        <div
                          className={`text-xs ${themeClasses.textSecondary}`}
                        >
                          10 min walk
                        </div>
                      </div>
                      <div
                        className={`bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors`}
                      >
                        <div
                          className={`text-sm ${themeClasses.textSecondary} mb-1`}
                        >
                          TYPE
                        </div>
                        <div
                          className={`text-2xl font-bold ${themeClasses.text}`}
                        >
                          COVERED
                        </div>
                        <div
                          className={`text-xs ${themeClasses.textSecondary}`}
                        >
                          EV Charging
                        </div>
                      </div>
                      <div
                        className={`bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors`}
                      >
                        <div
                          className={`text-sm ${themeClasses.textSecondary} mb-1`}
                        >
                          RATING
                        </div>
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-2xl font-bold ${themeClasses.text}`}
                          >
                            4.8
                          </span>
                          <span className="text-yellow-400">
                            {Array(5).fill("★").join("")}
                          </span>
                        </div>
                        <div
                          className={`text-xs ${themeClasses.textSecondary}`}
                        >
                          420 reviews
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-3 right-8 px-4 py-1.5 bg-linear-to-br from-green-500 to-green-600 text-white font-bold rounded-full text-sm flex items-center gap-2 animate-pulse">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  LIVE
                </div>
              </div>
            </div>
          </div>

          {/* How it works section */}
          <div
            className={`backdrop-blur-xl ${themeClasses.cardBg} ${themeClasses.cardBorder} border rounded-3xl p-8 md:p-12 mt-16`}
          >
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1">
                <h3
                  className={`text-2xl md:text-3xl font-bold ${themeClasses.text} mb-4`}
                >
                  How It Works
                </h3>
                <div className="space-y-6">
                  {[
                    {
                      step: "1",
                      title: "Search & Filter",
                      desc: "Find parking spots by location, price, and availability",
                      icon: Icons.Search,
                    },
                    {
                      step: "2",
                      title: "Book Instantly",
                      desc: "Reserve your spot with one click, no waiting required",
                      icon: Icons.CalendarCheck,
                    },
                    {
                      step: "3",
                      title: "Navigate & Park",
                      desc: "Get directions and park in your reserved spot",
                      icon: Icons.Navigation,
                    },
                    {
                      step: "4",
                      title: "Pay Securely",
                      desc: "Automatic payment with multiple secure options",
                      icon: Icons.Shield,
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-lg bg-linear-to-r ${themeClasses.linear.accent} flex items-center justify-center shrink-0`}
                      >
                        <item.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className={`font-bold ${themeClasses.text} mb-1`}>
                          {item.title}
                        </div>
                        <div className={themeClasses.textSecondary}>
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                  </div>
                )}
                <MapComponent parkingSlots={parkingSlots} loading={loading} />
              </div>
            </div>

            {/* ===== PAGINATION CONTROLS ===== */}
            {totalItems > pageSize && (
              <div className="mt-8">
                <div className="text-sm text-gray-500 dark:text-gray-400 text-center mb-2">
                  Showing {parkingSlots.length} of {totalItems} parking spots
                </div>
                <div className="flex justify-center items-center gap-2">
                  <button
                    onClick={() => fetchParkingSlots(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => fetchParkingSlots(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="home-section min-h-screen flex items-center relative px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              <span
                className={`bg-linear-to-r ${themeClasses.linear.accent} bg-clip-text text-transparent`}
              >
                Features That Make
              </span>
              <br />
              <span className={themeClasses.text}>Parking Effortless</span>
            </h2>
            <p
              className={`text-lg ${themeClasses.textSecondary} max-w-2xl mx-auto`}
            >
              Our platform combines technology with user-friendly design to
              transform your parking experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className={`group backdrop-blur-xl ${themeClasses.cardBg} ${themeClasses.cardBorder} border rounded-2xl p-6 hover:border-[#FF2F6C]/40 hover:shadow-2xl hover:shadow-[#FF2F6C]/10 transition-all duration-500 transform hover:-translate-y-2`}
                >
                  <div
                    className={`w-16 h-16 rounded-xl bg-linear-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className={`text-xl font-bold ${themeClasses.text} mb-3`}>
                    {feature.title}
                  </h3>
                  <p className={themeClasses.textSecondary}>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <div
        className={`flex flex-wrap items-center gap-8 pt-8 border-t ${themeClasses.border} justify-center max-w-7xl mx-auto px-4 py-12`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-green-500/20 to-green-500/10 rounded-lg flex items-center justify-center">
            <Icons.Lock className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <div className={`font-medium ${themeClasses.text}`}>
              Secure Booking
            </div>
            <div className={`text-sm ${themeClasses.textSecondary}`}>
              Encrypted Payments
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-[#FF2F6C]/20 to-[#FF2F6C]/10 rounded-lg flex items-center justify-center">
            <Icons.Zap className="w-5 h-5 text-[#FF2F6C]" />
          </div>
          <div>
            <div className={`font-medium ${themeClasses.text}`}>
              Instant Entry
            </div>
            <div className={`text-sm ${themeClasses.textSecondary}`}>
              QR Code Access
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <section className="home-section relative px-4 py-10">
        <div className="max-w-7xl mx-auto w-full">
          <div
            className={`backdrop-blur-xl ${themeClasses.cardBg} ${themeClasses.cardBorder} border rounded-3xl p-8 md:p-12`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-12 h-12 rounded-xl bg-linear-to-br ${themeClasses.linear.accent} flex items-center justify-center`}
                  >
                    <Icons.Car className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${themeClasses.text}`}>
                      SmartPark
                    </h2>
                    <p className={themeClasses.textSecondary}>
                      Parking Solutions
                    </p>
                  </div>
                </div>
                <p className={`${themeClasses.textSecondary} mb-8`}>
                  We're on a mission to make urban parking stress-free,
                  efficient, and accessible for everyone. Our technology
                  connects drivers with available parking spots in real-time.
                </p>
                <div className="flex gap-4">
                  <a
                    href="tel:+919876543210"
                    className={`w-10 h-10 rounded-lg bg-black/5 border ${themeClasses.border} flex items-center justify-center hover:border-[#FF2F6C]/30 transition-colors`}
                  >
                    <Icons.Smartphone
                      className={`w-5 h-5 ${themeClasses.textSecondary}`}
                    />
                  </a>
                  <a
                    href="mailto:support@smartpark.com"
                    className={`w-10 h-10 rounded-lg bg-black/5 border ${themeClasses.border} flex items-center justify-center hover:border-[#FF2F6C]/30 transition-colors`}
                  >
                    <Icons.Mail
                      className={`w-5 h-5 ${themeClasses.textSecondary}`}
                    />
                  </a>
                  <a
                    href="sms:+919876543210"
                    className={`w-10 h-10 rounded-lg bg-black/5 border ${themeClasses.border} flex items-center justify-center hover:border-[#FF2F6C]/30 hover:scale-110 transition-all duration-200`}
                  >
                    <Icons.MessageCircle
                      className={`w-5 h-5 ${themeClasses.textSecondary}`}
                    />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className={`font-bold ${themeClasses.text} mb-4`}>
                    Quick Links
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Parking Slots",
                      "Bookings",
                      "How It Works",
                      "Pricing",
                    ].map((item) => (
                      <li key={item}>
                        <a
                          href="#"
                          className={`${themeClasses.textSecondary} transition-all duration-200 hover:text-[#FF2F6C] hover:translate-x-1 inline-block`}
                        >
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className={`font-bold ${themeClasses.text} mb-4`}>
                    Contact
                  </h3>
                  <ul className={`space-y-3 ${themeClasses.textSecondary}`}>
                    <li>
                      <a
                        href="mailto:support@smartpark.com"
                        className="hover:text-[#FF2F6C] transition-colors"
                      >
                        support@smartpark.com
                      </a>
                    </li>
                    <li>
                      <a
                        href="tel:+919876543210"
                        className="hover:text-[#FF2F6C] transition-colors"
                      >
                        +91 98765 43210
                      </a>
                    </li>
                    <li>24/7 Support Available</li>
                  </ul>
                </div>
              </div>
            </div>

            <div
              className={`mt-12 pt-8 border-t ${themeClasses.border} text-center`}
            >
              <p className={themeClasses.textSecondary}>
                © {new Date().getFullYear()} SmartPark. All rights reserved.
              </p>
              <p className={`text-sm ${themeClasses.textSecondary} mt-2`}>
                Making parking better, one spot at a time.
              </p>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default HomePage;