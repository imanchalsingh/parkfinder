import * as React from "react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import AnalyticsPanel from "./AnalyticsPanel";
import AdminSecurityTab from "./AdminSecurityTab";
import {
  Search,
  Edit,
  Trash2,
  User,
  ParkingSquare,
  Users,
  Plus,
  X,
  Check,
  AlertCircle,
  Calendar,
  Settings,
  MapPin,
  Clock,
  Star,
  Building2,
  Car,
  Shield,
  Zap,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import LocationAutocomplete from "./LocationAutocomplete";

interface ParkingSlot {
  _id: string;
  name: string;
  location: string;
  pricePerHour: number;
  status: "available" | "occupied" | "maintenance" | string;
  capacity: number;
  availableSlots: number;
  description?: string;
  distance?: string;
  rating?: number;
  images?: string[];
}

interface User {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
  createdAt?: string;
}

interface Booking {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  parkingId: {
    _id: string;
    name: string;
    location: string;
    pricePerHour: number;
  };
  bookingDate: string;
  duration: number;
  totalPrice: number;
  bookingStatus: "active" | "cancelled" | "completed";
}

type TabType = "parking" | "users" | "bookings" | "analytics" | "security";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<TabType>("parking");
  const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [slotForm, setSlotForm] = useState<Partial<ParkingSlot>>({});
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [loading, setLoading] = useState({
    parking: true,
    users: true,
    bookings: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState({
    parking: "",
    users: "",
    bookings: "",
  });
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
    type: "parking" | "user" | "booking";
    id: string;
    name: string;
  } | null>(null);

  const { token } = useAuth();

  // Detect system theme
  const { theme } = useTheme();

  // Theme-based classes
  const themeClasses = {
    light: {
      bg: "bg-gray-50",
      cardBg: "bg-white",
      cardBgSecondary: "bg-gray-100",
      text: "text-gray-900",
      textSecondary: "text-gray-600",
      textMuted: "text-gray-500",
      border: "border-gray-200",
      borderAccent: "border-blue-200",
      inputBg: "bg-white",
      inputBorder: "border-gray-300",
      hover: "hover:bg-gray-100",
      gradient: {
        primary: "from-blue-600 to-blue-500",
        secondary: "from-pink-600 to-pink-500",
        accent: "from-blue-600 to-pink-600",
      },
      shadow: "shadow-lg shadow-blue-500/10",
      overlay: "bg-white/80",
      tableHeader: "bg-gray-100",
      tableRow: "hover:bg-gray-50",
      modalBg: "bg-white",
    },
    dark: {
      bg: "bg-[#191919]",
      cardBg: "bg-[#191919]/80",
      cardBgSecondary: "bg-[#191919]/60",
      text: "text-[#EEECF6]",
      textSecondary: "text-[#EEECF6]/80",
      textMuted: "text-[#EEECF6]/60",
      border: "border-[#1B42CB]/20",
      borderAccent: "border-[#1B42CB]/30",
      inputBg: "bg-[#191919]/50",
      inputBorder: "border-[#1B42CB]/30",
      hover: "hover:bg-[#1B42CB]/10",
      gradient: {
        primary: "from-[#1B42CB] to-[#1B42CB]/80",
        secondary: "from-[#FF2F6C] to-[#FF2F6C]/80",
        accent: "from-[#1B42CB] to-[#FF2F6C]",
      },
      shadow: "shadow-2xl shadow-[#1B42CB]/10",
      overlay: "bg-black/80",
      tableHeader: "bg-[#191919]/80",
      tableRow: "hover:bg-[#1B42CB]/5",
      modalBg: "bg-[#191919]/90",
    },
  };

  const currentTheme = themeClasses[theme];

  // Fetch data based on active tab
  useEffect(() => {
    if (!token) return;

    switch (activeTab) {
      case "parking":
        fetchParkingSlots();
        break;
      case "users":
        fetchUsers();
        break;
      case "bookings":
        fetchBookings();
        break;
    }
  }, [activeTab, token]);

  const fetchParkingSlots = async () => {
    try {
      setLoading((prev) => ({ ...prev, parking: true }));
      const res = await fetch(`/api/admin/slots`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setParkingSlots(data.data);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error(error);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading((prev) => ({ ...prev, parking: false }));
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading((prev) => ({ ...prev, users: true }));
      const res = await fetch(`/api/admin/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        const validatedUsers = data.data.map((user: User) => ({
          _id: user._id || "",
          name: user.name || "Unknown",
          email: user.email || "No email",
          role: user.role || "user",
          createdAt: user.createdAt || "",
        }));
        setUsers(validatedUsers);
      } else {
        setError(data.message || "Failed to fetch users");
        setUsers([]);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading((prev) => ({ ...prev, users: false }));
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading((prev) => ({ ...prev, bookings: true }));
      console.log(
        "📌 Fetching bookings with token:",
        token?.substring(0, 20) + "...",
      );

      const res = await fetch(`/api/bookings/all`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("📌 Bookings API response status:", res.status);

      if (!res.ok) {
        const text = await res.text();
        console.error("❌ Bookings API error response:", text);
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      const data = await res.json();
      console.log("📌 Bookings API data:", data);

      if (data.success) {
        setBookings(data.data);
      } else {
        setError(data.message || "Failed to fetch bookings");
      }
    } catch (err) {
      console.error("❌ Error fetching bookings:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch bookings");
    } finally {
      setLoading((prev) => ({ ...prev, bookings: false }));
    }
  };

  // Handle Slot Operations
  const handleDeleteSlot = async (id: string) => {
    try {
      await fetch(`/api/admin/slots/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchParkingSlots();
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      setError("Failed to delete parking slot");
    }
  };

  const handleEditSlot = (slot: ParkingSlot) => {
    setEditingSlotId(slot._id);
    setSlotForm(slot);
    setShowSlotForm(true);
  };

  const handleAddOrUpdateSlot = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!slotForm.name?.trim() || !slotForm.location?.trim()) {
      setError("Name and location are required");
      return;
    }
    if (!slotForm.pricePerHour || slotForm.pricePerHour <= 0) {
      setError("Price per hour must be greater than 0");
      return;
    }
    if (!slotForm.capacity || slotForm.capacity <= 0) {
      setError("Capacity must be greater than 0");
      return;
    }
    if (!slotForm.availableSlots || slotForm.availableSlots < 0) {
      setError("Available slots must be 0 or greater");
      return;
    }
    if (slotForm.availableSlots > slotForm.capacity!) {
      setError("Available slots cannot exceed capacity");
      return;
    }

    try {
      const method = editingSlotId ? "PUT" : "POST";
      const url = editingSlotId
        ? `/api/admin/slots/${editingSlotId}`
        : `/api/admin/slots`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...slotForm,
          pricePerHour: Number(slotForm.pricePerHour),
          capacity: Number(slotForm.capacity),
          availableSlots: Number(slotForm.availableSlots),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSlotForm({});
        setEditingSlotId(null);
        setShowSlotForm(false);
        fetchParkingSlots();
      } else {
        setError(data.message || "Operation failed");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    }
  };

  // Handle User Operations
  const handleDeleteUser = async (id: string) => {
    try {
      await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      setError("Failed to delete user");
    }
  };

  const handleRoleChange = async (id: string, role: string) => {
    try {
      await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
      setError("Failed to update user role");
    }
  };

  // Handle Booking Operations
  const handleUpdateBookingStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (data.success) {
        fetchBookings();
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to update booking status");
    }
  };

  const handleDeleteBooking = async (id: string) => {
    try {
      console.log("📌 Deleting booking:", id);

      const res = await fetch(`/api/bookings/admin-delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      const data = await res.json();

      if (data.success) {
        console.log("✅ Booking deleted successfully");
        fetchBookings();
        setShowDeleteConfirm(null);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error("❌ Error deleting booking:", err);
      setError("Failed to delete booking");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error(error);
      return "Invalid Date";
    }
  };

  // Filter data based on search
  const filteredSlots = parkingSlots.filter(
    (slot) =>
      slot.name.toLowerCase().includes(searchTerm.parking.toLowerCase()) ||
      slot.location.toLowerCase().includes(searchTerm.parking.toLowerCase()),
  );

  const filteredUsers = (users || []).filter((user) => {
    const name = user?.name || "";
    const email = user?.email || "";
    const role = user?.role || "";
    const search = searchTerm.users.toLowerCase();

    return (
      name.toLowerCase().includes(search) ||
      email.toLowerCase().includes(search) ||
      role.toLowerCase().includes(search)
    );
  });

  const filteredBookings = (bookings || []).filter((booking) => {
    const userName = booking.userId?.name || "";
    const userEmail = booking.userId?.email || "";
    const parkingName = booking.parkingId?.name || "";
    const status = booking.bookingStatus || "";
    const search = searchTerm.bookings.toLowerCase();

    return (
      userName.toLowerCase().includes(search) ||
      userEmail.toLowerCase().includes(search) ||
      parkingName.toLowerCase().includes(search) ||
      status.toLowerCase().includes(search)
    );
  });

  const getStatusColor = (status?: string): string => {
    switch ((status || "").toLowerCase()) {
      case "available":
        return theme === "light"
          ? "bg-green-500 text-white"
          : "bg-linear-to-r from-green-500 to-green-600 text-white";
      case "occupied":
        return theme === "light"
          ? "bg-red-500 text-white"
          : "bg-linear-to-r from-red-500 to-red-600 text-white";
      case "maintenance":
        return theme === "light"
          ? "bg-yellow-500 text-white"
          : "bg-linear-to-r from-yellow-500 to-yellow-600 text-black";
      default:
        return theme === "light"
          ? "bg-gray-500 text-white"
          : "bg-linear-to-r from-gray-500 to-gray-600 text-white";
    }
  };

  const getBookingStatusColor = (status?: string): string => {
    switch ((status || "").toLowerCase()) {
      case "active":
        return theme === "light"
          ? "bg-green-100 text-green-800 border-green-200"
          : "bg-green-500/20 text-green-300 border-green-500/30";
      case "cancelled":
        return theme === "light"
          ? "bg-red-100 text-red-800 border-red-200"
          : "bg-red-500/20 text-red-300 border-red-500/30";
      case "completed":
        return theme === "light"
          ? "bg-blue-100 text-blue-800 border-blue-200"
          : "bg-blue-500/20 text-blue-300 border-blue-500/30";
      default:
        return theme === "light"
          ? "bg-gray-100 text-gray-800 border-gray-200"
          : "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const getRoleColor = (role?: string): string => {
    const roleLower = (role || "user").toLowerCase();
    switch (roleLower) {
      case "admin":
        return theme === "light"
          ? "bg-purple-100 text-purple-800 border-purple-200"
          : "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "user":
        return theme === "light"
          ? "bg-blue-100 text-blue-800 border-blue-200"
          : "bg-blue-500/20 text-blue-300 border-blue-500/30";
      default:
        return theme === "light"
          ? "bg-gray-100 text-gray-800 border-gray-200"
          : "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  return (
    <div
      className={`min-h-screen ${currentTheme.bg} transition-colors duration-300 p-4 md:p-6`}
    >
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#1B42CB]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#FF2F6C]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-r from-[#1B42CB]/5 to-[#FF2F6C]/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header with Premium Styling */}
        <header className="mb-8">
          <div
            className={`backdrop-blur-xl ${currentTheme.cardBg} border ${currentTheme.border} rounded-2xl p-6 md:p-8 ${currentTheme.shadow}`}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1B42CB] to-[#FF2F6C] flex items-center justify-center shadow-lg shadow-[#FF2F6C]/20">
                    <Settings className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold">
                      <span
                        className={`bg-gradient-to-r from-[#1B42CB] to-[#FF2F6C] bg-clip-text text-transparent`}
                      >
                        Admin Panel
                      </span>
                    </h1>
                    <p
                      className={`${currentTheme.textMuted} flex items-center gap-2`}
                    >
                      <Shield className="w-4 h-4" />
                      Manage parking slots, users, and bookings
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div
                  className={`backdrop-blur-xl ${currentTheme.cardBgSecondary} border ${currentTheme.border} rounded-xl p-4 text-center group hover:border-[#FF2F6C]/30 transition-all duration-300`}
                >
                  <ParkingSquare className="w-5 h-5 text-[#1B42CB] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div
                    className={`text-2xl font-bold ${currentTheme.text} mb-1`}
                  >
                    {parkingSlots.length}
                  </div>
                  <div className={`text-xs ${currentTheme.textMuted}`}>
                    Parking Slots
                  </div>
                </div>
                <div
                  className={`backdrop-blur-xl ${currentTheme.cardBgSecondary} border ${currentTheme.border} rounded-xl p-4 text-center group hover:border-[#FF2F6C]/30 transition-all duration-300`}
                >
                  <Users className="w-5 h-5 text-[#FF2F6C] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div
                    className={`text-2xl font-bold ${currentTheme.text} mb-1`}
                  >
                    {users.length}
                  </div>
                  <div className={`text-xs ${currentTheme.textMuted}`}>
                    Users
                  </div>
                </div>
                <div
                  className={`backdrop-blur-xl ${currentTheme.cardBgSecondary} border ${currentTheme.border} rounded-xl p-4 text-center group hover:border-[#FF2F6C]/30 transition-all duration-300`}
                >
                  <Calendar className="w-5 h-5 text-green-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div
                    className={`text-2xl font-bold ${currentTheme.text} mb-1`}
                  >
                    {bookings.length}
                  </div>
                  <div className={`text-xs ${currentTheme.textMuted}`}>
                    Bookings
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Premium Tabs */}
        <div
          className={`mb-8 backdrop-blur-xl ${currentTheme.cardBgSecondary} border ${currentTheme.border} rounded-2xl p-2 shadow-xl`}
        >
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab("parking")}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group ${
                activeTab === "parking"
                  ? "text-white"
                  : `${currentTheme.textSecondary} hover:${currentTheme.text}`
              }`}
            >
              {activeTab === "parking" && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#1B42CB] to-[#FF2F6C] animate-gradient"></div>
              )}
              <ParkingSquare
                className={`w-5 h-5 relative z-10 ${activeTab === "parking" ? "animate-pulse" : ""}`}
              />
              <span className="relative z-10">Parking Slots</span>
              {loading.parking && (
                <RefreshCw className="w-4 h-4 relative z-10 animate-spin" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group ${
                activeTab === "users"
                  ? "text-white"
                  : `${currentTheme.textSecondary} hover:${currentTheme.text}`
              }`}
            >
              {activeTab === "users" && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#1B42CB] to-[#FF2F6C] animate-gradient"></div>
              )}
              <Users
                className={`w-5 h-5 relative z-10 ${activeTab === "users" ? "animate-pulse" : ""}`}
              />
              <span className="relative z-10">Users</span>
              {loading.users && (
                <RefreshCw className="w-4 h-4 relative z-10 animate-spin" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group ${
                activeTab === "bookings"
                  ? "text-white"
                  : `${currentTheme.textSecondary} hover:${currentTheme.text}`
              }`}
            >
              {activeTab === "bookings" && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#1B42CB] to-[#FF2F6C] animate-gradient"></div>
              )}
              <Calendar
                className={`w-5 h-5 relative z-10 ${activeTab === "bookings" ? "animate-pulse" : ""}`}
              />
              <span className="relative z-10">Bookings</span>
              {loading.bookings && (
                <RefreshCw className="w-4 h-4 relative z-10 animate-spin" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group ${
                activeTab === "analytics"
                  ? "text-white"
                  : `${currentTheme.textSecondary} hover:${currentTheme.text}`
              }`}
            >
              {activeTab === "analytics" && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#1B42CB] to-[#FF2F6C] animate-gradient"></div>
              )}
              <BarChart3
                className={`w-5 h-5 relative z-10 ${activeTab === "analytics" ? "animate-pulse" : ""}`}
              />
              <span className="relative z-10">Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group ${
                activeTab === "security"
                  ? "text-white"
                  : `${currentTheme.textSecondary} hover:${currentTheme.text}`
              }`}
            >
              {activeTab === "security" && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#1B42CB] to-[#FF2F6C] animate-gradient"></div>
              )}
              <Shield
                className={`w-5 h-5 relative z-10 ${activeTab === "security" ? "animate-pulse" : ""}`}
              />
              <span className="relative z-10">Security</span>
            </button>
          </div>
        </div>

        {/* Premium Error Message */}
        {error && (
          <div className="mb-6 backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-2xl p-4 animate-shake">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto p-2 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Parking Slots Tab */}
        {activeTab === "parking" && (
          <div className="space-y-6">
            {/* Search and Add Button */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Search className="w-5 h-5 text-[#1B42CB] group-focus-within:text-[#FF2F6C] transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search parking slots by name or location..."
                  value={searchTerm.parking}
                  onChange={(e) =>
                    setSearchTerm((prev) => ({
                      ...prev,
                      parking: e.target.value,
                    }))
                  }
                  className={`w-full pl-12 pr-4 py-3 ${currentTheme.inputBg} border ${currentTheme.inputBorder} rounded-xl ${currentTheme.text} placeholder-${currentTheme.textMuted} focus:outline-none focus:border-[#FF2F6C] focus:ring-2 focus:ring-[#FF2F6C]/20 transition-all duration-300`}
                />
              </div>
              <button
                onClick={() => {
                  setSlotForm({});
                  setEditingSlotId(null);
                  setShowSlotForm(true);
                }}
                className="px-6 py-3 bg-gradient-to-r from-[#1B42CB] to-[#FF2F6C] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#FF2F6C]/20 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                Add New Slot
              </button>
            </div>

            {/* Parking Slots Grid */}
            {loading.parking ? (
              <div className="text-center py-12">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-[#1B42CB]/20 border-t-[#FF2F6C] rounded-full animate-spin mx-auto mb-4"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Car className="w-8 h-8 text-[#FF2F6C] animate-pulse" />
                  </div>
                </div>
                <p className={currentTheme.textMuted}>
                  Loading parking slots...
                </p>
              </div>
            ) : filteredSlots.length === 0 ? (
              <div
                className={`backdrop-blur-xl ${currentTheme.cardBgSecondary} border ${currentTheme.border} rounded-2xl p-12 text-center group`}
              >
                <div className="relative inline-block">
                  <ParkingSquare
                    className={`w-20 h-20 ${currentTheme.textMuted} mx-auto mb-4 group-hover:scale-110 transition-transform`}
                  />
                  <Zap className="w-6 h-6 text-[#FF2F6C] absolute -top-2 -right-2 animate-pulse" />
                </div>
                <h3 className={`text-2xl font-bold ${currentTheme.text} mb-2`}>
                  No Parking Slots Found
                </h3>
                <p className={currentTheme.textMuted}>
                  {searchTerm.parking
                    ? "Try adjusting your search"
                    : "Add your first parking slot to get started"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSlots.map((slot) => (
                  <div
                    key={slot._id}
                    className={`group backdrop-blur-xl ${currentTheme.cardBgSecondary} border ${currentTheme.border} rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-[#1B42CB]/20 transition-all duration-500 transform hover:-translate-y-2`}
                  >
                    {/* Status Badge */}
                    <div
                      className={`px-4 py-3 ${getStatusColor(slot.status)} flex justify-between items-center`}
                    >
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        <span className="text-sm font-medium uppercase">
                          {slot.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded-lg">
                        <Car className="w-3 h-3" />
                        <span className="text-sm font-medium">
                          {slot.availableSlots}/{slot.capacity}
                        </span>
                      </div>
                    </div>

                    {/* Slot Content */}
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3
                            className={`text-xl font-bold ${currentTheme.text} mb-1 flex items-center gap-2`}
                          >
                            <Building2 className="w-4 h-4 text-[#1B42CB]" />
                            {slot.name}
                          </h3>
                          <p
                            className={`${currentTheme.textMuted} text-sm flex items-center gap-1`}
                          >
                            <MapPin className="w-3 h-3" />
                            {slot.location}
                          </p>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-2xl font-bold ${currentTheme.text} flex items-start`}
                          >
                            ₹{slot.pricePerHour}
                            <span
                              className={`text-sm ${currentTheme.textMuted} ml-1`}
                            >
                              /hr
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-6">
                        <div className="flex justify-between text-sm mb-2">
                          <span
                            className={`${currentTheme.textMuted} flex items-center gap-1`}
                          >
                            <Clock className="w-3 h-3" />
                            Availability
                          </span>
                          <span className={`${currentTheme.text} font-medium`}>
                            {Math.round(
                              (slot.availableSlots / slot.capacity) * 100,
                            )}
                            %
                          </span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#1B42CB] to-[#FF2F6C] rounded-full transition-all duration-500 group-hover:from-[#FF2F6C] group-hover:to-[#1B42CB]"
                            style={{
                              width: `${(slot.availableSlots / slot.capacity) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Rating (if available) */}
                      {slot.rating && (
                        <div className="flex items-center gap-1 mb-4">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className={`text-sm ${currentTheme.text}`}>
                            {slot.rating}
                          </span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditSlot(slot)}
                          className={`flex-1 py-2.5 ${currentTheme.cardBg} border ${currentTheme.border} ${currentTheme.text} rounded-xl hover:bg-gradient-to-r hover:from-[#1B42CB] hover:to-[#FF2F6C] hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group`}
                        >
                          <Edit className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            setShowDeleteConfirm({
                              type: "parking",
                              id: slot._id,
                              name: slot.name,
                            })
                          }
                          className="flex-1 py-2.5 bg-[#191919] border border-red-500/30 text-red-400 rounded-xl hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group"
                        >
                          <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            {/* Search */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <Search className="w-5 h-5 text-[#1B42CB] group-focus-within:text-[#FF2F6C] transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search users by name, email, or role..."
                value={searchTerm.users}
                onChange={(e) =>
                  setSearchTerm((prev) => ({ ...prev, users: e.target.value }))
                }
                className={`w-full pl-12 pr-4 py-3 ${currentTheme.inputBg} border ${currentTheme.inputBorder} rounded-xl ${currentTheme.text} placeholder-${currentTheme.textMuted} focus:outline-none focus:border-[#FF2F6C] focus:ring-2 focus:ring-[#FF2F6C]/20 transition-all duration-300`}
              />
            </div>

            {/* Users Table */}
            {loading.users ? (
              <div className="text-center py-12">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-[#1B42CB]/20 border-t-[#FF2F6C] rounded-full animate-spin mx-auto mb-4"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Users className="w-8 h-8 text-[#FF2F6C] animate-pulse" />
                  </div>
                </div>
                <p className={currentTheme.textMuted}>Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div
                className={`backdrop-blur-xl ${currentTheme.cardBgSecondary} border ${currentTheme.border} rounded-2xl p-12 text-center group`}
              >
                <div className="relative inline-block">
                  <Users
                    className={`w-20 h-20 ${currentTheme.textMuted} mx-auto mb-4 group-hover:scale-110 transition-transform`}
                  />
                  <Zap className="w-6 h-6 text-[#FF2F6C] absolute -top-2 -right-2 animate-pulse" />
                </div>
                <h3 className={`text-2xl font-bold ${currentTheme.text} mb-2`}>
                  No Users Found
                </h3>
                <p className={currentTheme.textMuted}>
                  {searchTerm.users
                    ? "Try adjusting your search"
                    : "No users registered yet"}
                </p>
              </div>
            ) : (
              <div
                className={`backdrop-blur-xl ${currentTheme.cardBgSecondary} border ${currentTheme.border} rounded-2xl overflow-hidden`}
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr
                        className={`border-b ${currentTheme.border} ${currentTheme.tableHeader}`}
                      >
                        <th
                          className={`text-left py-4 px-6 ${currentTheme.text} font-semibold`}
                        >
                          User
                        </th>
                        <th
                          className={`text-left py-4 px-6 ${currentTheme.text} font-semibold`}
                        >
                          Email
                        </th>
                        <th
                          className={`text-left py-4 px-6 ${currentTheme.text} font-semibold`}
                        >
                          Role
                        </th>
                        <th
                          className={`text-left py-4 px-6 ${currentTheme.text} font-semibold`}
                        >
                          Joined
                        </th>
                        <th
                          className={`text-left py-4 px-6 ${currentTheme.text} font-semibold`}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => {
                        const {
                          _id = "",
                          name = "Unknown",
                          email = "No email",
                          role = "user",
                          createdAt = "",
                        } = user || {};

                        return (
                          <tr
                            key={_id}
                            className={`border-b ${currentTheme.border} ${currentTheme.tableRow} transition-all duration-300`}
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1B42CB] to-[#FF2F6C] flex items-center justify-center shadow-lg shadow-[#FF2F6C]/20">
                                  <User className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <div
                                    className={`font-medium ${currentTheme.text}`}
                                  >
                                    {name}
                                  </div>
                                  <div
                                    className={`text-xs ${currentTheme.textMuted}`}
                                  >
                                    ID: {_id.substring(0, 8)}...
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td
                              className={`py-4 px-6 ${currentTheme.textSecondary}`}
                            >
                              {email}
                            </td>
                            <td className="py-4 px-6">
                              <select
                                value={role}
                                onChange={(e) =>
                                  handleRoleChange(_id, e.target.value)
                                }
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${getRoleColor(
                                  role,
                                )} ${currentTheme.inputBg} focus:ring-2 focus:ring-[#FF2F6C]/20 focus:outline-none cursor-pointer transition-all duration-300`}
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                            <td
                              className={`py-4 px-6 ${currentTheme.textMuted}`}
                            >
                              {formatDate(createdAt)}
                            </td>
                            <td className="py-4 px-6">
                              <button
                                onClick={() =>
                                  setShowDeleteConfirm({
                                    type: "user",
                                    id: _id,
                                    name: name,
                                  })
                                }
                                className="px-4 py-2 bg-[#191919] border border-red-500/30 text-red-400 rounded-xl hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 hover:text-white transition-all duration-300 flex items-center gap-2 group"
                              >
                                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="space-y-6">
            {/* Search */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <Search className="w-5 h-5 text-[#1B42CB] group-focus-within:text-[#FF2F6C] transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search bookings by user name, email, parking name, or status..."
                value={searchTerm.bookings}
                onChange={(e) =>
                  setSearchTerm((prev) => ({
                    ...prev,
                    bookings: e.target.value,
                  }))
                }
                className={`w-full pl-12 pr-4 py-3 ${currentTheme.inputBg} border ${currentTheme.inputBorder} rounded-xl ${currentTheme.text} placeholder-${currentTheme.textMuted} focus:outline-none focus:border-[#FF2F6C] focus:ring-2 focus:ring-[#FF2F6C]/20 transition-all duration-300`}
              />
            </div>

            {/* Bookings Table */}
            {loading.bookings ? (
              <div className="text-center py-12">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-[#1B42CB]/20 border-t-[#FF2F6C] rounded-full animate-spin mx-auto mb-4"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-[#FF2F6C] animate-pulse" />
                  </div>
                </div>
                <p className={currentTheme.textMuted}>Loading bookings...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div
                className={`backdrop-blur-xl ${currentTheme.cardBgSecondary} border ${currentTheme.border} rounded-2xl p-12 text-center group`}
              >
                <div className="relative inline-block">
                  <Calendar
                    className={`w-20 h-20 ${currentTheme.textMuted} mx-auto mb-4 group-hover:scale-110 transition-transform`}
                  />
                  <Zap className="w-6 h-6 text-[#FF2F6C] absolute -top-2 -right-2 animate-pulse" />
                </div>
                <h3 className={`text-2xl font-bold ${currentTheme.text} mb-2`}>
                  No Bookings Found
                </h3>
                <p className={currentTheme.textMuted}>
                  {searchTerm.bookings
                    ? "Try adjusting your search"
                    : "No bookings have been made yet"}
                </p>
              </div>
            ) : (
              <div
                className={`backdrop-blur-xl ${currentTheme.cardBgSecondary} border ${currentTheme.border} rounded-2xl overflow-hidden`}
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr
                        className={`border-b ${currentTheme.border} ${currentTheme.tableHeader}`}
                      >
                        <th
                          className={`text-left py-4 px-6 ${currentTheme.text} font-semibold`}
                        >
                          User
                        </th>
                        <th
                          className={`text-left py-4 px-6 ${currentTheme.text} font-semibold`}
                        >
                          Parking Slot
                        </th>
                        <th
                          className={`text-left py-4 px-6 ${currentTheme.text} font-semibold`}
                        >
                          Date & Time
                        </th>
                        <th
                          className={`text-left py-4 px-6 ${currentTheme.text} font-semibold`}
                        >
                          Duration
                        </th>
                        <th
                          className={`text-left py-4 px-6 ${currentTheme.text} font-semibold`}
                        >
                          Amount
                        </th>
                        <th
                          className={`text-left py-4 px-6 ${currentTheme.text} font-semibold`}
                        >
                          Status
                        </th>
                        <th
                          className={`text-left py-4 px-6 ${currentTheme.text} font-semibold`}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((booking) => (
                        <tr
                          key={booking._id}
                          className={`border-b ${currentTheme.border} ${currentTheme.tableRow} transition-all duration-300`}
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1B42CB] to-[#FF2F6C] flex items-center justify-center shadow-lg shadow-[#FF2F6C]/20">
                                <User className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <div
                                  className={`font-medium ${currentTheme.text}`}
                                >
                                  {booking.userId?.name || "Unknown"}
                                </div>
                                <div
                                  className={`text-xs ${currentTheme.textMuted}`}
                                >
                                  {booking.userId?.email || "No email"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div>
                              <div
                                className={`font-medium ${currentTheme.text} flex items-center gap-1`}
                              >
                                <Building2 className="w-3 h-3 text-[#1B42CB]" />
                                {booking.parkingId?.name || "Unknown"}
                              </div>
                              <div
                                className={`text-xs ${currentTheme.textMuted} flex items-center gap-1`}
                              >
                                <MapPin className="w-3 h-3" />
                                {booking.parkingId?.location || "N/A"}
                              </div>
                            </div>
                          </td>
                          <td className={`py-4 px-6 ${currentTheme.textMuted}`}>
                            {formatDate(booking.bookingDate)}
                          </td>
                          <td className="py-4 px-6">
                            <div
                              className={`flex items-center gap-1 ${currentTheme.text}`}
                            >
                              <Clock className="w-3 h-3" />
                              {booking.duration}h
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`font-bold ${currentTheme.text}`}>
                              ₹{booking.totalPrice}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <select
                              value={booking.bookingStatus}
                              onChange={(e) =>
                                handleUpdateBookingStatus(
                                  booking._id,
                                  e.target.value,
                                )
                              }
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${getBookingStatusColor(
                                booking.bookingStatus,
                              )} ${currentTheme.inputBg} focus:ring-2 focus:ring-[#FF2F6C]/20 focus:outline-none cursor-pointer transition-all duration-300`}
                            >
                              <option value="active">Active</option>
                              <option value="cancelled">Cancelled</option>
                              <option value="completed">Completed</option>
                            </select>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  setShowDeleteConfirm({
                                    type: "booking",
                                    id: booking._id,
                                    name: `Booking by ${booking.userId?.name}`,
                                  })
                                }
                                className="px-4 py-2 bg-[#191919] border border-red-500/30 text-red-400 rounded-xl hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 hover:text-white transition-all duration-300 flex items-center gap-2 group"
                              >
                                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <AnalyticsPanel />
        )}
      </div>

      {/* Slot Form Modal - Premium Styling */}
      {showSlotForm && (
        <div
          className={`fixed inset-0 ${currentTheme.overlay} backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn`}
        >
          <div
            className={`backdrop-blur-xl ${currentTheme.modalBg} border ${currentTheme.border} rounded-2xl w-full max-w-2xl shadow-2xl shadow-[#1B42CB]/20 transform animate-slideUp`}
          >
            <div className={`p-6 border-b ${currentTheme.border}`}>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  <span
                    className={`bg-gradient-to-r from-[#1B42CB] to-[#FF2F6C] bg-clip-text text-transparent`}
                  >
                    {editingSlotId
                      ? "Edit Parking Slot"
                      : "Add New Parking Slot"}
                  </span>
                </h2>
                <button
                  onClick={() => {
                    setShowSlotForm(false);
                    setSlotForm({});
                    setEditingSlotId(null);
                  }}
                  className={`w-10 h-10 rounded-xl ${currentTheme.cardBg} border ${currentTheme.border} flex items-center justify-center ${currentTheme.text} hover:bg-gradient-to-r hover:from-[#FF2F6C] hover:to-[#1B42CB] hover:text-white transition-all duration-300 group`}
                >
                  <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddOrUpdateSlot} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="group">
                  <label
                    className={`block text-sm font-medium ${currentTheme.text} mb-2 items-center gap-2`}
                  >
                    <Building2 className="w-4 h-4 text-[#1B42CB]" />
                    Slot Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={slotForm.name || ""}
                    onChange={(e) =>
                      setSlotForm({ ...slotForm, name: e.target.value })
                    }
                    className={`w-full px-4 py-3 ${currentTheme.inputBg} border ${currentTheme.inputBorder} rounded-xl ${currentTheme.text} focus:outline-none focus:border-[#FF2F6C] focus:ring-2 focus:ring-[#FF2F6C]/20 transition-all duration-300`}
                    placeholder="Enter slot name"
                  />
                </div>
                <div className="group">
                  <label
                    className={`block text-sm font-medium ${currentTheme.text} mb-2 items-center gap-2`}
                  >
                    <MapPin className="w-4 h-4 text-[#FF2F6C]" />
                    Location *
                  </label>
                  <LocationAutocomplete
                    value={slotForm.location || ""}
                    onChange={(val) =>
                      setSlotForm({
                        ...slotForm,
                        location: val,
                      })
                    }
                    placeholder="Enter location"
                    className={`w-full pl-12 pr-4 py-3 ${currentTheme.inputBg} border ${currentTheme.inputBorder} rounded-xl ${currentTheme.text} focus:outline-none focus:border-[#FF2F6C] focus:ring-2 focus:ring-[#FF2F6C]/20 transition-all duration-300`}
                    icon={<MapPin className="w-5 h-5 text-[#FF2F6C]" />}
                  />
                </div>
                <div className="group md:col-span-2">
                  <label
                    className={`block text-sm font-medium ${currentTheme.text} mb-2`}
                  >
                    Description (Markdown supported)
                  </label>
                  <textarea
                    value={slotForm.description || ""}
                    onChange={(e) =>
                      setSlotForm({
                        ...slotForm,
                        description: e.target.value,
                      })
                    }
                    rows={4}
                    className={`w-full px-4 py-3 ${currentTheme.inputBg} border ${currentTheme.inputBorder} rounded-xl ${currentTheme.text} focus:outline-none focus:border-[#FF2F6C] focus:ring-2 focus:ring-[#FF2F6C]/20 transition-all duration-300 font-mono text-sm`}
                    placeholder="Enter description using Markdown (e.g. **bold**, - list items)"
                  />
                </div>
                <div className="group">
                  <label
                    className={`block text-sm font-medium ${currentTheme.text} mb-2`}
                  >
                    Price per Hour (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={slotForm.pricePerHour || ""}
                    onChange={(e) =>
                      setSlotForm({
                        ...slotForm,
                        pricePerHour: Number(e.target.value),
                      })
                    }
                    className={`w-full px-4 py-3 ${currentTheme.inputBg} border ${currentTheme.inputBorder} rounded-xl ${currentTheme.text} focus:outline-none focus:border-[#FF2F6C] focus:ring-2 focus:ring-[#FF2F6C]/20 transition-all duration-300`}
                    placeholder="Enter price"
                  />
                </div>
                <div className="group">
                  <label
                    className={`block text-sm font-medium ${currentTheme.text} mb-2`}
                  >
                    Status
                  </label>
                  <select
                    value={slotForm.status || "available"}
                    onChange={(e) =>
                      setSlotForm({ ...slotForm, status: e.target.value })
                    }
                    className={`w-full px-4 py-3 ${currentTheme.inputBg} border ${currentTheme.inputBorder} rounded-xl ${currentTheme.text} focus:outline-none focus:border-[#FF2F6C] focus:ring-2 focus:ring-[#FF2F6C]/20 transition-all duration-300`}
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div className="group">
                  <label
                    className={`block text-sm font-medium ${currentTheme.text} mb-2`}
                  >
                    Total Capacity *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={slotForm.capacity || ""}
                    onChange={(e) =>
                      setSlotForm({
                        ...slotForm,
                        capacity: Number(e.target.value),
                      })
                    }
                    className={`w-full px-4 py-3 ${currentTheme.inputBg} border ${currentTheme.inputBorder} rounded-xl ${currentTheme.text} focus:outline-none focus:border-[#FF2F6C] focus:ring-2 focus:ring-[#FF2F6C]/20 transition-all duration-300`}
                    placeholder="Enter total capacity"
                  />
                </div>
                <div className="group">
                  <label
                    className={`block text-sm font-medium ${currentTheme.text} mb-2`}
                  >
                    Available Slots *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={slotForm.availableSlots || ""}
                    onChange={(e) =>
                      setSlotForm({
                        ...slotForm,
                        availableSlots: Number(e.target.value),
                      })
                    }
                    className={`w-full px-4 py-3 ${currentTheme.inputBg} border ${currentTheme.inputBorder} rounded-xl ${currentTheme.text} focus:outline-none focus:border-[#FF2F6C] focus:ring-2 focus:ring-[#FF2F6C]/20 transition-all duration-300`}
                    placeholder="Enter available slots"
                  />
                </div>
              </div>

              {/* Image URLs */}
              <div className="mb-6">
                <label className={`block text-sm font-medium ${currentTheme.text} mb-2`}>
                  Photo URLs (one per line)
                </label>
                <textarea
                  rows={3}
                  value={(slotForm.images ?? []).join("\n")}
                  onChange={(e) =>
                    setSlotForm({
                      ...slotForm,
                      images: e.target.value.split("\n").map((u) => u.trim()).filter(Boolean),
                    })
                  }
                  className={`w-full px-4 py-3 ${currentTheme.inputBg} border ${currentTheme.inputBorder} rounded-xl ${currentTheme.text} focus:outline-none focus:border-[#FF2F6C] focus:ring-2 focus:ring-[#FF2F6C]/20 transition-all duration-300 resize-none`}
                  placeholder={"https://example.com/photo1.jpg\nhttps://example.com/photo2.jpg"}
                />
                <p className={`text-xs ${currentTheme.textMuted} mt-1`}>Paste one image URL per line. Supports any public image link.</p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowSlotForm(false);
                    setSlotForm({});
                    setEditingSlotId(null);
                  }}
                  className={`px-6 py-3 ${currentTheme.cardBg} border ${currentTheme.border} ${currentTheme.text} font-semibold rounded-xl ${currentTheme.hover} transition-all duration-300`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-[#1B42CB] to-[#FF2F6C] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#FF2F6C]/20 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2 group"
                >
                  <Check className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  {editingSlotId ? "Update Slot" : "Add Slot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - Premium Styling */}
      {showDeleteConfirm && (
        <div
          className={`fixed inset-0 ${currentTheme.overlay} backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn`}
        >
          <div
            className={`backdrop-blur-xl ${currentTheme.modalBg} border border-red-500/30 rounded-2xl w-full max-w-md shadow-2xl shadow-red-500/10 transform animate-slideUp`}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">
                  <AlertCircle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${currentTheme.text}`}>
                    Confirm Delete
                  </h2>
                  <p className={currentTheme.textMuted}>
                    Are you sure you want to delete this{" "}
                    {showDeleteConfirm.type}?
                  </p>
                </div>
              </div>

              <div
                className={`mb-6 p-4 ${currentTheme.cardBg} rounded-xl border border-red-500/20`}
              >
                <div
                  className={`font-medium ${currentTheme.text} flex items-center gap-2`}
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                  {showDeleteConfirm.name}
                </div>
                <div
                  className={`text-sm ${currentTheme.textMuted} mt-2 flex items-center gap-1`}
                >
                  <AlertCircle className="w-3 h-3" />
                  This action cannot be undone
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className={`flex-1 px-6 py-3 ${currentTheme.cardBg} border ${currentTheme.border} ${currentTheme.text} font-semibold rounded-xl ${currentTheme.hover} transition-all duration-300`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (showDeleteConfirm.type === "parking") {
                      handleDeleteSlot(showDeleteConfirm.id);
                    } else if (showDeleteConfirm.type === "user") {
                      handleDeleteUser(showDeleteConfirm.id);
                    } else if (showDeleteConfirm.type === "booking") {
                      handleDeleteBooking(showDeleteConfirm.id);
                    }
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
                >
                  <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && <AdminSecurityTab />}

      {/* Custom Animations */}
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}

