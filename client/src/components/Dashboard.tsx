import * as React from "react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, Filler } from "chart.js";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Pie, Bar, Line } from "react-chartjs-2";
import * as Icons from "lucide-react";
import { BarChart, Bar as RechartsBar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend as RechartsLegend } from "recharts";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
  Filler,
);

interface FavoriteLocation {
  _id: string;
  name?: string;
  address?: string;
  price?: number;
  totalSlots?: number;
}

interface DashboardStats {
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalSpent: number;
  averageSpentPerBooking: number;
  totalParkingHours: number;
  favoriteParking: {
    name: string;
    count: number;
  } | null;
  recentActivity: {
    date: string;
    count: number;
  }[];
  bookingTrends: {
    month: string;
    bookings: number;
    spent: number;
  }[];
  parkingTypeDistribution: {
    type: string;
    count: number;
  }[];
  hourlyDistribution: {
    hour: string;
    bookings: number;
  }[];
  durationAnalysis: {
    range: string;
    count: number;
  }[];
  monthlyComparison: {
    month: string;
    currentYear: number;
    lastYear: number;
  }[];
}

interface ActiveBooking {
  bookingId: string;
  bookingDate: string;
  duration: number;
  totalPrice: number;
  expectedEnd: string;
  parking: {
    id: string;
    name: string;
    location: string;
    floor: string;
    slotNumber: string;
    isCovered: boolean;
    securityLevel: string;
  };
}

const THEME_CLASSES = {
  light: {
    bg: "bg-gray-50",
    text: "text-gray-900",
    textSecondary: "text-gray-600",
    textMuted: "text-gray-500",
    border: "border-gray-200",
    cardBg: "bg-white",
    cardBgSecondary: "bg-gray-50",
    cardBorder: "border-gray-200",
    overlay: "bg-black/5",
    chartGrid: "rgba(0, 0, 0, 0.1)",
    chartText: "#4B5563",
    gradient: {
      primary: "from-blue-600 to-blue-500",
      secondary: "from-pink-600 to-pink-500",
      accent: "from-blue-600 to-pink-600",
    },
  },
  dark: {
    bg: "bg-[#191919]",
    text: "text-[#EEECF6]",
    textSecondary: "text-[#EEECF6]/70",
    textMuted: "text-[#EEECF6]/40",
    border: "border-[#1B42CB]/20",
    cardBg: "bg-[#191919]/60",
    cardBgSecondary: "bg-[#191919]/80",
    cardBorder: "border-[#1B42CB]/20",
    overlay: "bg-black/40",
    chartGrid: "rgba(238, 236, 246, 0.1)",
    chartText: "#EEECF6",
    gradient: {
      primary: "from-[#1B42CB] to-[#1B42CB]/80",
      secondary: "from-[#FF2F6C] to-[#FF2F6C]/80",
      accent: "from-[#1B42CB] to-[#FF2F6C]",
    },
  },
} as const;

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeBooking, setActiveBooking] = useState<ActiveBooking[]>([]);
  const [activeBookingIndex, setActiveBookingIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year">(
    "month",
  );
  const [favorites, setFavorites] = useState<FavoriteLocation[]>([]);
  const { token } = useAuth();
  const navigate = useNavigate();

  // Detect system theme
  const { theme } = useTheme();

  // Fetch favorites from API
  const fetchFavorites = async () => {
    try {
      const res = await fetch(`/api/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Handle 304 Not Modified - keep existing data
      if (res.status === 304) {
        console.log("Favorites data is cached (304 Not Modified)");
        return;
      }

      // Check if response is successful
      if (!res.ok) {
        console.error(
          `Failed to fetch favorites: ${res.status} ${res.statusText}`,
        );
        return;
      }

      // Check Content-Type before parsing JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const bodyText = await res.text();
        console.error(
          `Invalid Content-Type: ${contentType}. Response body:`,
          bodyText,
        );
        return;
      }

      // Parse JSON response
      const data = await res.json();
      if (data.success) {
        setFavorites(data.data);
      } else {
        console.warn("Favorites API returned success: false", data.message);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      console.error("Error fetching favorites:", errorMsg);
    }
  };

  // Handle clicking the heart icon to remove from dashboard
  const handleToggleFavorite = async (locationId: string) => {
    try {
      const res = await fetch(`/api/favorites/${locationId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const bodyText = await res.text();
        console.error(
          `Failed to toggle favorite: ${res.status}. Response: ${bodyText.slice(0, 200)}`,
        );
        return;
      }

      // Check Content-Type before parsing JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error(
          `Invalid Content-Type for favorite toggle: ${contentType}`,
        );
        return;
      }

      const data = await res.json();

      if (data.success) {
        // Immediately remove from the UI state
        setFavorites((prev) => prev.filter((fav) => fav._id !== locationId));
      } else {
        console.warn("Toggle favorite returned success: false", data.message);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      console.error("Error toggling favorite:", errorMsg);
    }
  };

  useEffect(() => {
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    setIsAuthenticated(true);
    fetchDashboardData();
    fetchActiveBooking();
    fetchFavorites(); // Fetch favorites alongside stats
  }, [timeframe, token]);

  const fetchActiveBooking = async () => {
    try {
      const res = await fetch(`/api/dashboard/active-booking`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setActiveBooking(data.data ?? []);
        setActiveBookingIndex(0);
      }
    } catch {
      // Non-critical — widget simply won't show if this fails
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/dashboard/user-stats?timeframe=${timeframe}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Handle 304 Not Modified - keep existing data
      if (res.status === 304) {
        console.log("Dashboard data is cached (304 Not Modified)");
        setLoading(false);
        return;
      }

      // Check if response is successful
      if (!res.ok) {
        const bodyText = await res.text();
        const statusError = `Server error: ${res.status} ${res.statusText}. Response: ${bodyText.slice(0, 200)}`;
        setError(`Server error: ${res.status} ${res.statusText}`);
        console.error(statusError);
        setLoading(false);
        return;
      }

      // Check Content-Type before parsing JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const bodyText = await res.text();
        const errorMsg = `Invalid Content-Type: ${contentType}. Expected application/json. Response: ${bodyText.slice(0, 200)}`;
        setError("Server returned invalid response format");
        console.error(errorMsg);
        setLoading(false);
        return;
      }

      // Parse JSON response
      const data = await res.json();

      if (data.success) {
        setStats(data.data);
      } else {
        if (
          data.message?.toLowerCase().includes("token") ||
          data.message?.toLowerCase().includes("unauthorized")
        ) {
          setError("Your session has expired. Please sign in again.");
        } else {
          setError(data.message || "Failed to fetch dashboard data");
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch dashboard data";
      setError("Failed to load dashboard. Please check your connection.");
      console.error("Dashboard fetch error:", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Theme-based classes
  const themeClasses =
    THEME_CLASSES[theme as keyof typeof THEME_CLASSES] || THEME_CLASSES.light;

  // Chart configurations with theme support
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: themeClasses.chartText,
          font: {
            size: 12,
          },
        },
      },
    },
    scales: {
      y: {
        grid: {
          color: themeClasses.chartGrid,
        },
        ticks: {
          color: themeClasses.chartText,
        },
      },
      x: {
        grid: {
          color: themeClasses.chartGrid,
        },
        ticks: {
          color: themeClasses.chartText,
        },
      },
    },
  };

  const pieChartData = {
    labels: ["Active", "Completed", "Cancelled"],
    datasets: [
      {
        data: [
          stats?.activeBookings || 0,
          stats?.completedBookings || 0,
          stats?.cancelledBookings || 0,
        ],
        backgroundColor: [
          "rgba(27, 66, 203, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(255, 47, 108, 0.8)",
        ],
        borderColor: [
          "rgba(27, 66, 203, 1)",
          "rgba(34, 197, 94, 1)",
          "rgba(255, 47, 108, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const barChartData = {
    labels: stats?.bookingTrends?.map((item) => item.month) || [],
    datasets: [
      {
        label: "Bookings",
        data: stats?.bookingTrends?.map((item) => item.bookings) || [],
        backgroundColor: "rgba(27, 66, 203, 0.8)",
        borderColor: "rgba(27, 66, 203, 1)",
        borderWidth: 1,
      },
      {
        label: "Amount Spent (₹)",
        data: stats?.bookingTrends?.map((item) => item.spent) || [],
        backgroundColor: "rgba(255, 47, 108, 0.8)",
        borderColor: "rgba(255, 47, 108, 1)",
        borderWidth: 1,
      },
    ],
  };

  const hourlyChartData = {
    labels: stats?.hourlyDistribution?.map((item) => item.hour) || [],
    datasets: [
      {
        label: "Bookings",
        data: stats?.hourlyDistribution?.map((item) => item.bookings) || [],
        backgroundColor: "rgba(27, 66, 203, 0.6)",
        borderColor: "rgba(27, 66, 203, 1)",
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const durationChartData = {
    labels: stats?.durationAnalysis?.map((item) => item.range) || [],
    datasets: [
      {
        label: "Number of Bookings",
        data: stats?.durationAnalysis?.map((item) => item.count) || [],
        backgroundColor: "rgba(255, 47, 108, 0.6)",
        borderColor: "rgba(255, 47, 108, 1)",
        borderWidth: 2,
      },
    ],
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen ${themeClasses.bg} flex items-center justify-center p-4 transition-colors duration-300`}
      >
        <div className="text-center">
          <div className="relative">
            <div
              className={`w-24 h-24 rounded-full bg-gradient-to-r ${themeClasses.gradient.accent} animate-spin`}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`w-20 h-20 rounded-full ${theme === "light" ? "bg-white" : "bg-[#191919]"}`}
              ></div>
            </div>
          </div>
          <p className={`mt-6 ${themeClasses.text} text-lg font-semibold`}>
            Loading your dashboard...
          </p>
          <p className={themeClasses.textSecondary}>
            Analyzing your parking data
          </p>
        </div>
      </div>
    );
  }

  if (!loading && !isAuthenticated) {
    return (
      <div
        className={`min-h-screen ${themeClasses.bg} flex items-center justify-center p-4 transition-colors duration-300`}
      >
        <div
          className={`backdrop-blur-xl ${themeClasses.cardBgSecondary}
          border ${themeClasses.border}
          rounded-3xl p-8 max-w-md w-full shadow-2xl text-center`}
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#1B42CB]/20 to-[#FF2F6C]/20 flex items-center justify-center">
            <Icons.Lock className="w-8 h-8 text-[#1B42CB]" />
          </div>

          <h2 className={`text-2xl font-bold ${themeClasses.text} mb-3`}>
            Authentication Required
          </h2>

          <p className={`${themeClasses.textSecondary} mb-8`}>
            You are not signed in. Please sign in or create an account to access
            the dashboard.
          </p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => (window.location.href = "/login")}
              className="px-6 py-3 bg-gradient-to-r from-[#1B42CB] to-[#1B42CB]/80 text-white rounded-xl font-semibold hover:opacity-90 transition-all"
            >
              Sign In
            </button>

            <button
              onClick={() => (window.location.href = "/signup")}
              className={`px-6 py-3 border ${themeClasses.border}
              rounded-xl font-semibold ${themeClasses.text}`}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen ${themeClasses.bg} flex items-center justify-center p-4 transition-colors duration-300`}
      >
        <div
          className={`backdrop-blur-xl ${themeClasses.cardBgSecondary} border ${themeClasses.border} rounded-3xl p-8 max-w-md w-full shadow-2xl`}
        >
          <div className="text-center">
            <div
              className={`w-20 h-20 bg-gradient-to-br from-[#FF2F6C]/20 to-[#1B42CB]/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#FF2F6C]/30`}
            >
              <Icons.AlertTriangle className="w-8 h-8 text-[#FF2F6C]" />
            </div>
            <h2 className={`text-2xl font-bold ${themeClasses.text} mb-3`}>
              Dashboard Error
            </h2>
            <p className={themeClasses.textSecondary}>{error}</p>
            <button
              onClick={() => fetchDashboardData()}
              className={`mt-6 px-6 py-3 bg-gradient-to-r from-[#1B42CB] to-[#1B42CB]/80 text-white font-semibold rounded-xl hover:from-[#1B42CB]/90 hover:to-[#1B42CB]/70 transition-all duration-300 hover:shadow-lg hover:shadow-[#1B42CB]/20`}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${themeClasses.bg} p-4 md:p-6 transition-colors duration-300`}
    >
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#1B42CB]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#FF2F6C]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div
            className={`backdrop-blur-xl ${themeClasses.cardBgSecondary} border ${themeClasses.border} rounded-2xl p-6 md:p-8 shadow-2xl`}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${themeClasses.gradient.accent} flex items-center justify-center`}
                  >
                    <Icons.BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1
                      className={`text-3xl md:text-4xl font-bold bg-gradient-to-r from-[${theme === "light" ? "#1B42CB" : "#EEECF6"}] to-[#1B42CB] bg-clip-text text-transparent`}
                    >
                      Analytics Dashboard
                    </h1>
                    <p className={themeClasses.textSecondary}>
                      Track your parking habits and spending
                    </p>
                  </div>
                </div>
              </div>

              {/* Time Filter */}
              <div
                className={`flex gap-2 ${themeClasses.cardBgSecondary} border ${themeClasses.border} rounded-xl p-1`}
              >
                {["week", "month", "year"].map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimeframe(period as "week" | "month" | "year")}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
                      timeframe === period
                        ? `bg-gradient-to-r ${themeClasses.gradient.accent} text-white`
                        : `${themeClasses.textSecondary} hover:${themeClasses.text} hover:bg-white/5`
                    }`}
                  >
                    {period === "week" && (
                      <Icons.CalendarDays className="w-4 h-4" />
                    )}
                    {period === "month" && (
                      <Icons.Calendar className="w-4 h-4" />
                    )}
                    {period === "year" && (
                      <Icons.CalendarRange className="w-4 h-4" />
                    )}
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Parked Vehicle Location Reminder */}
        {activeBooking.length > 0 && (() => {
          const booking = activeBooking[activeBookingIndex];
          return (
          <div className="mb-8">
            <div className={`relative overflow-hidden backdrop-blur-xl border rounded-2xl p-6 shadow-xl
              ${theme === 'light'
                ? 'bg-green-50 border-green-200 shadow-green-100'
                : 'bg-green-500/10 border-green-500/30 shadow-green-500/10'
              }`}>

              {/* Pulse indicator */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className={`text-sm font-semibold ${theme === 'light' ? 'text-green-700' : 'text-green-400'}`}>
                  Active Parking
                </span>
              </div>

              {/* Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <Icons.MapPin className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${themeClasses.text}`}>
                    {activeBooking.length > 1
                      ? `Your Vehicles are Parked (${activeBooking.length} active bookings)`
                      : "Your Vehicle is Parked Here"}
                  </h2>
                  <p className={`text-sm ${themeClasses.textSecondary}`}>
                    Quick location reminder for your active booking
                    {activeBooking.length > 1 && ` — showing ${activeBookingIndex + 1} of ${activeBooking.length}`}
                  </p>
                </div>
              </div>

              {/* Location Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                <div className={`rounded-xl p-4 ${theme === 'light' ? 'bg-white border border-green-200' : 'bg-green-500/10 border border-green-500/20'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icons.Building2 className="w-4 h-4 text-green-500" />
                    <span className={`text-xs font-medium uppercase tracking-wide ${themeClasses.textMuted}`}>Facility</span>
                  </div>
                  <p className={`font-bold ${themeClasses.text} text-sm leading-tight`}>{booking.parking.name}</p>
                </div>

                <div className={`rounded-xl p-4 ${theme === 'light' ? 'bg-white border border-green-200' : 'bg-green-500/10 border border-green-500/20'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icons.Layers className="w-4 h-4 text-green-500" />
                    <span className={`text-xs font-medium uppercase tracking-wide ${themeClasses.textMuted}`}>Floor</span>
                  </div>
                  <p className={`font-bold ${themeClasses.text} text-sm`}>{booking.parking.floor}</p>
                </div>

                <div className={`rounded-xl p-4 ${theme === 'light' ? 'bg-white border border-green-200' : 'bg-green-500/10 border border-green-500/20'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icons.Hash className="w-4 h-4 text-green-500" />
                    <span className={`text-xs font-medium uppercase tracking-wide ${themeClasses.textMuted}`}>Slot No.</span>
                  </div>
                  <p className="font-bold text-green-500 text-lg">{booking.parking.slotNumber}</p>
                </div>

                <div className={`rounded-xl p-4 ${theme === 'light' ? 'bg-white border border-green-200' : 'bg-green-500/10 border border-green-500/20'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icons.Clock className="w-4 h-4 text-green-500" />
                    <span className={`text-xs font-medium uppercase tracking-wide ${themeClasses.textMuted}`}>Until</span>
                  </div>
                  <p className={`font-bold ${themeClasses.text} text-sm`}>
                    {new Date(booking.expectedEnd).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>

              {/* Footer: address, badges, navigation */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className={`flex items-center gap-2 text-sm ${themeClasses.textSecondary}`}>
                  <Icons.Navigation className="w-4 h-4" />
                  <span>{booking.parking.location}</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {booking.parking.isCovered && (
                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
                      ${theme === 'light' ? 'bg-blue-100 text-blue-700' : 'bg-blue-500/20 text-blue-300'}`}>
                      <Icons.Umbrella className="w-3 h-3" />
                      Covered
                    </span>
                  )}
                  <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium capitalize
                    ${booking.parking.securityLevel === 'high'
                      ? (theme === 'light' ? 'bg-green-100 text-green-700' : 'bg-green-500/20 text-green-300')
                      : booking.parking.securityLevel === 'medium'
                      ? (theme === 'light' ? 'bg-yellow-100 text-yellow-700' : 'bg-yellow-500/20 text-yellow-300')
                      : (theme === 'light' ? 'bg-red-100 text-red-700' : 'bg-red-500/20 text-red-300')
                    }`}>
                    <Icons.Shield className="w-3 h-3" />
                    {booking.parking.securityLevel} security
                  </span>

                  {/* Carousel controls — only shown when multiple bookings */}
                  {activeBooking.length > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setActiveBookingIndex(i => Math.max(0, i - 1))}
                        disabled={activeBookingIndex === 0}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        aria-label="Previous booking"
                      >
                        <Icons.ChevronLeft className={`w-4 h-4 ${themeClasses.text}`} />
                      </button>
                      <span className={`text-xs font-medium px-2 ${themeClasses.textSecondary}`}>
                        {activeBookingIndex + 1} / {activeBooking.length}
                      </span>
                      <button
                        onClick={() => setActiveBookingIndex(i => Math.min(activeBooking.length - 1, i + 1))}
                        disabled={activeBookingIndex === activeBooking.length - 1}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        aria-label="Next booking"
                      >
                        <Icons.ChevronRight className={`w-4 h-4 ${themeClasses.text}`} />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => navigate("/bookings")}
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
                      bg-gradient-to-r from-[#1B42CB] to-[#1B42CB]/80 text-white hover:opacity-90 transition-opacity"
                  >
                    <Icons.ExternalLink className="w-3 h-3" />
                    View Booking{activeBooking.length > 1 ? "s" : ""}
                  </button>
                </div>
              </div>
            </div>
          </div>
          );
        })()}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div
            className={`backdrop-blur-xl ${themeClasses.cardBg} border ${themeClasses.border} rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:shadow-[#1B42CB]/10 transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#1B42CB]/20 flex items-center justify-center">
                <Icons.CalendarCheck className="w-6 h-6 text-[#1B42CB]" />
              </div>
              <span className={`text-3xl font-bold ${themeClasses.text}`}>
                {stats?.totalBookings || 0}
              </span>
            </div>
            <h3 className={themeClasses.textSecondary}>Total Bookings</h3>
          </div>

          <div
            className={`backdrop-blur-xl ${themeClasses.cardBg} border ${themeClasses.border} rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:shadow-[#1B42CB]/10 transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Icons.CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <span className={`text-3xl font-bold ${themeClasses.text}`}>
                {stats?.completedBookings || 0}
              </span>
            </div>
            <h3 className={themeClasses.textSecondary}>Completed</h3>
          </div>

          <div
            className={`backdrop-blur-xl ${themeClasses.cardBg} border ${themeClasses.border} rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:shadow-[#1B42CB]/10 transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#FF2F6C]/20 flex items-center justify-center">
                <Icons.IndianRupee className="w-6 h-6 text-[#FF2F6C]" />
              </div>
              <span className={`text-3xl font-bold ${themeClasses.text}`}>
                ₹{stats?.totalSpent || 0}
              </span>
            </div>
            <h3 className={themeClasses.textSecondary}>Total Spent</h3>
          </div>

          <div
            className={`backdrop-blur-xl ${themeClasses.cardBg} border ${themeClasses.border} rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:shadow-[#1B42CB]/10 transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Icons.Clock className="w-6 h-6 text-purple-500" />
              </div>
              <span className={`text-3xl font-bold ${themeClasses.text}`}>
                {stats?.totalParkingHours || 0}h
              </span>
            </div>
            <h3 className={themeClasses.textSecondary}>Total Hours</h3>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Booking Status Distribution */}
          <div
            className={`backdrop-blur-xl ${themeClasses.cardBg} border ${themeClasses.border} rounded-2xl p-6 shadow-xl`}
          >
            <h3 className={`text-xl font-bold ${themeClasses.text} mb-6`}>
              Booking Status Distribution
            </h3>
            <div className="h-64">
              <Pie data={pieChartData} options={chartOptions} />
            </div>
          </div>

          {/* Favorite Parking */}
          <div
            className={`backdrop-blur-xl ${themeClasses.cardBg} border ${themeClasses.border} rounded-2xl p-6 shadow-xl`}
          >
            <h3 className={`text-xl font-bold ${themeClasses.text} mb-6`}>
              Favorite Parking Location
            </h3>
            {stats?.favoriteParking ? (
              <div className="text-center">
                <div
                  className={`w-24 h-24 mx-auto mb-4 rounded-xl bg-gradient-to-br ${themeClasses.gradient.accent} flex items-center justify-center`}
                >
                  <Icons.Trophy className="w-8 h-8 text-white" />
                </div>
                <h4 className={`text-2xl font-bold ${themeClasses.text} mb-2`}>
                  {stats.favoriteParking.name}
                </h4>
                <p className={themeClasses.textSecondary}>
                  Booked {stats.favoriteParking.count} times
                </p>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-[#EEECF6]/40">
                No data available
              </div>
            )}
          </div>

          {/* Booking Trends */}
          <div
            className={`backdrop-blur-xl ${themeClasses.cardBg} border ${themeClasses.border} rounded-2xl p-6 shadow-xl lg:col-span-2`}
          >
            <h3 className={`text-xl font-bold ${themeClasses.text} mb-6`}>
              Booking & Spending Trends
            </h3>
            <div className="h-80">
              {stats?.bookingTrends && stats.bookingTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.bookingTrends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? "rgba(238, 236, 246, 0.1)" : "rgba(0, 0, 0, 0.1)"} />
                    <XAxis dataKey="month" stroke={theme === 'dark' ? "#EEECF6" : "#4B5563"} />
                    <YAxis stroke={theme === 'dark' ? "#EEECF6" : "#4B5563"} />
                    <RechartsTooltip 
                      contentStyle={{ 
                        backgroundColor: theme === 'dark' ? '#191919' : '#ffffff',
                        borderColor: theme === 'dark' ? 'rgba(27, 66, 203, 0.2)' : '#e5e7eb',
                        color: theme === 'dark' ? '#EEECF6' : '#111827'
                      }}
                    />
                    <RechartsLegend />
                    <RechartsBar dataKey="spent" name="Spent (₹)" fill={theme === 'dark' ? "#1B42CB" : "#2563eb"} radius={[4, 4, 0, 0]} />
                    <RechartsBar dataKey="bookings" name="Total Bookings" fill={theme === 'dark' ? "#FF2F6C" : "#db2777"} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className={`h-full flex items-center justify-center ${themeClasses.textMuted}`}>
                  No spending data available yet.
                </div>
              )}
            </div>
          </div>

          {/* Hourly Distribution */}
          <div
            className={`backdrop-blur-xl ${themeClasses.cardBg} border ${themeClasses.border} rounded-2xl p-6 shadow-xl`}
          >
            <h3 className={`text-xl font-bold ${themeClasses.text} mb-6`}>
              Peak Booking Hours
            </h3>
            <div className="h-64">
              <Line data={hourlyChartData} options={chartOptions} />
            </div>
          </div>

          {/* Duration Analysis */}
          <div
            className={`backdrop-blur-xl ${themeClasses.cardBg} border ${themeClasses.border} rounded-2xl p-6 shadow-xl`}
          >
            <h3 className={`text-xl font-bold ${themeClasses.text} mb-6`}>
              Parking Duration Analysis
            </h3>
            <div className="h-64">
              <Bar data={durationChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Additional Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className={`backdrop-blur-xl bg-gradient-to-br from-[#1B42CB]/10 to-transparent border ${themeClasses.border} rounded-2xl p-6`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#1B42CB]/20 flex items-center justify-center">
                <Icons.TrendingUp className="w-5 h-5 text-[#1B42CB]" />
              </div>
              <h4 className={`text-lg font-semibold ${themeClasses.text}`}>
                Average per Booking
              </h4>
            </div>
            <p className={`text-3xl font-bold ${themeClasses.text}`}>
              ₹{stats?.averageSpentPerBooking || 0}
            </p>
            <p className={themeClasses.textMuted}>Per booking average</p>
          </div>

          <div
            className={`backdrop-blur-xl bg-gradient-to-br from-[#FF2F6C]/10 to-transparent border ${themeClasses.border} rounded-2xl p-6`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#FF2F6C]/20 flex items-center justify-center">
                <Icons.Activity className="w-5 h-5 text-[#FF2F6C]" />
              </div>
              <h4 className={`text-lg font-semibold ${themeClasses.text}`}>
                Active Bookings
              </h4>
            </div>
            <p className={`text-3xl font-bold ${themeClasses.text}`}>
              {stats?.activeBookings || 0}
            </p>
            <p className={themeClasses.textMuted}>Currently active</p>
          </div>

          <div
            className={`backdrop-blur-xl bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 rounded-2xl p-6`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Icons.Percent className="w-5 h-5 text-green-500" />
              </div>
              <h4 className={`text-lg font-semibold ${themeClasses.text}`}>
                Completion Rate
              </h4>
            </div>
            <p className={`text-3xl font-bold ${themeClasses.text}`}>
              {stats?.totalBookings
                ? Math.round(
                    (stats.completedBookings / stats.totalBookings) * 100,
                  )
                : 0}
              %
            </p>
            <p className={themeClasses.textMuted}>Of total bookings</p>
          </div>
        </div>

        {/* My Saved Locations Section */}
        <div className="mt-8 mb-8">
          <h2
            className={`text-2xl font-bold ${themeClasses.text} mb-6 flex items-center gap-2`}
          >
            <Icons.Heart className="w-6 h-6 text-[#FF2F6C] fill-current" />
            My Saved Locations
          </h2>

          {favorites.length === 0 ? (
            <div
              className={`backdrop-blur-xl ${themeClasses.cardBgSecondary} border ${themeClasses.border} rounded-2xl p-8 text-center shadow-xl`}
            >
              <Icons.MapPin
                className={`w-12 h-12 mx-auto mb-3 ${themeClasses.textMuted}`}
              />
              <p className={themeClasses.textSecondary}>
                You haven't saved any favorite parking spots yet.
              </p>
              <button
                onClick={() => (window.location.href = "/")} // Adjust to your search/map route
                className="mt-4 px-6 py-2 bg-[#1B42CB] text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Find Parking
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((location) => (
                <div
                  key={location._id}
                  className={`backdrop-blur-xl ${themeClasses.cardBg} border ${themeClasses.border} rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className={`text-lg font-bold ${themeClasses.text}`}>
                        {location.name || "Parking Location"}
                      </h3>
                      <p
                        className={`${themeClasses.textSecondary} text-sm mt-1`}
                      >
                        {location.address || "Location Address"}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleFavorite(location._id)}
                      className="text-[#FF2F6C] hover:scale-110 transition-transform focus:outline-none"
                      aria-label="Remove from favorites"
                    >
                      <Icons.Heart className="w-6 h-6 fill-current" />
                    </button>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-md ${themeClasses.cardBgSecondary} ${themeClasses.textSecondary}`}
                    >
                      ₹{location.price}/hr
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded-md ${themeClasses.cardBgSecondary} ${themeClasses.textSecondary}`}
                    >
                      {location.totalSlots} Slots
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      (window.location.href = `/parking/${location._id}`)
                    } // Adjust to your booking route
                    className={`w-full py-2 bg-gradient-to-r ${themeClasses.gradient.primary} text-white rounded-lg font-medium hover:opacity-90 transition-opacity`}
                  >
                    Book Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
