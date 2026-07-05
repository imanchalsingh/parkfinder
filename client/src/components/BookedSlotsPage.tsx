import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import * as Icons from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import ExtendParkingModal from "./ExtendParkingModal";
import { toast } from "react-hot-toast";

interface ParkingSlot {
  _id: string;
  name?: string;
  location?: string;
  pricePerHour?: number;
  status?: string;
  availableSlots?: number;
  capacity?: number;
  distance?: string;
  rating?: number;
}

interface Booking {
  _id: string;
  userId?: string;
  parkingId: ParkingSlot;
  bookingDate?: string;
  duration?: number;
  totalPrice?: number;
  bookingStatus?: "active" | "cancelled" | "completed";
  extensions?: any[]; // Added to track extensions used
}

const THEME_CLASSES = {
  light: {
    bg: "bg-gray-50",
    text: "text-gray-900",
    textSecondary: "text-gray-600",
    border: "border-gray-200",
    cardBg: "bg-white",
    cardBorder: "border-gray-200",
    overlay: "bg-black/5",
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
    border: "border-[#1B42CB]/20",
    cardBg: "bg-[#191919]/40",
    cardBorder: "border-[#1B42CB]/20",
    overlay: "bg-black/40",
    gradient: {
      primary: "from-[#1B42CB] to-[#1B42CB]/80",
      secondary: "from-[#FF2F6C] to-[#FF2F6C]/80",
      accent: "from-[#1B42CB] to-[#FF2F6C]",
    },
  },
} as const;

const isBookingExpired = (dateString?: string, duration?: number): boolean => {
  if (!dateString || !duration) return false;
  const expiryTime = new Date(dateString).getTime() + duration * 60 * 60 * 1000;
  return Date.now() > expiryTime;
};

const BookedSlotsPage: React.FC = () => {
  const [bookedSlots, setBookedSlots] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // State for Extend Parking Modal
  const [extendBooking, setExtendBooking] = useState<Booking | null>(null);

  // Detect system theme
  const { theme } = useTheme();
  const { token, user } = useAuth();
  const receiptRef = useRef<HTMLDivElement>(null);

  const fetchBookedSlots = async () => {
    try {
      const res = await fetch(`/api/bookings/my-bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setBookedSlots(data.data);
      } else {
        if (
          data.message?.toLowerCase().includes("token") ||
          data.message?.toLowerCase().includes("unauthorized")
        ) {
          setError("Your session has expired. Please sign in again.");
        } else {
          setError(data.message);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    setIsAuthenticated(true);
    fetchBookedSlots();
  }, [token]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const res = await fetch(`/api/bookings/cancel/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setBookedSlots((prev) =>
          prev.map((booking) =>
            booking._id === id
              ? { ...booking, bookingStatus: "cancelled" }
              : booking,
          ),
        );
        toast.success("Booking cancelled successfully!");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel booking. Please try again.");
    }
  };

  const handleVehicleEntry = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/enter/${bookingId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Vehicle entry recorded successfully!");
        fetchBookedSlots();
      } else {
        toast.error(data.message || "Failed to record vehicle entry");
      }
    } catch (err) {
      console.error("Entry error:", err);
      toast.error("Error recording vehicle entry");
    }
  };

  const handleVehicleExit = async (bookingId: string) => {
    if (!confirm("Are you sure you want to mark vehicle exit?")) return;

    try {
      const res = await fetch(`/api/exit/${bookingId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (data.success) {
        toast.success(
          `Vehicle exited successfully!\nDuration: ${data.duration.toFixed(2)} minutes`,
        );
        fetchBookedSlots();
      } else {
        toast.error(data.message || "Failed to record vehicle exit");
      }
    } catch (err) {
      console.error("Exit error:", err);
      toast.error("Error recording vehicle exit");
    }
  };

  const handleDownloadReceipt = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowReceiptModal(true);
  };

  const generateReceipt = async () => {
    if (!selectedBooking) return;

    setDownloading(true);
    try {
      const response = await fetch(`/api/bookings/${selectedBooking._id}/receipt`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let errorMsg = "Failed to generate receipt.";
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch (e) {
          // Response was not JSON, use default error message
        }
        throw new Error(errorMsg);
      }

      // Convert response to blob and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Receipt_${selectedBooking._id.substring(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setShowReceiptModal(false);
    } catch (error) {
      console.error("Error generating receipt:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate receipt. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  // Theme-based classes
  const themeClasses =
    THEME_CLASSES[theme as keyof typeof THEME_CLASSES] || THEME_CLASSES.light;

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-500/20 text-green-700 dark:text-green-300 border-l-4 border-green-500";
      case "cancelled":
        return "bg-red-500/20 text-red-700 dark:text-red-300 border-l-4 border-red-500";
      case "completed":
        return "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-l-4 border-blue-500";
      default:
        return "bg-gray-500/20 text-gray-700 dark:text-gray-300 border-l-4 border-gray-500";
    }
  };

  const getStatusText = (status: string): string => {
    switch (status?.toLowerCase()) {
      case "active":
        return "Active";
      case "cancelled":
        return "Cancelled";
      case "completed":
        return "Completed";
      default:
        return "Unknown";
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateEndTime = (dateString?: string, duration?: number): string => {
    if (!dateString || !duration) return "N/A";
    const startDate = new Date(dateString);
    const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000);
    return endDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateForReceipt = (dateString?: string): string => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const filteredBookings = bookedSlots.filter((booking: Booking) => {
    if (filter !== "all" && booking.bookingStatus !== filter) {
      return false;
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        booking.parkingId?.name?.toLowerCase().includes(term) ||
        booking.parkingId?.location?.toLowerCase().includes(term) ||
        booking._id.toLowerCase().includes(term)
      );
    }

    return true;
  });

  if (loading) {
    return (
      <div
        className={`min-h-screen ${themeClasses.bg} flex items-center justify-center p-4`}
      >
        <div className="text-center">
          <div className="relative">
            <div
              className={`w-24 h-24 rounded-full bg-gradient-to-r ${themeClasses.gradient.accent} animate-spin`}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`w-20 h-20 rounded-full ${themeClasses.bg}`}
              ></div>
            </div>
          </div>
          <p className={`mt-6 ${themeClasses.text} text-lg font-semibold`}>
            Loading your bookings...
          </p>
          <p className={themeClasses.textSecondary}>Fetching booking details</p>
        </div>
      </div>
    );
  }

  if (!loading && !isAuthenticated) {
    return (
      <div
        className={`min-h-screen ${themeClasses.bg} flex items-center justify-center p-4`}
      >
        <div
          className={`backdrop-blur-xl ${themeClasses.cardBg}
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
            your bookings.
          </p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => (window.location.href = "/login")}
              className={`px-6 py-3 bg-gradient-to-r ${themeClasses.gradient.primary}
              text-white rounded-xl font-semibold`}
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
        className={`min-h-screen ${themeClasses.bg} flex items-center justify-center p-4`}
      >
        <div
          className={`backdrop-blur-xl bg-[#1B42CB]/10 border ${themeClasses.border} rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-[#1B42CB]/10`}
        >
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#FF2F6C]/20 to-[#1B42CB]/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#FF2F6C]/30">
              <Icons.AlertCircle className="w-10 h-10 text-[#FF2F6C]" />
            </div>
            <h2 className={`text-2xl font-bold ${themeClasses.text} mb-3`}>
              Loading Error
            </h2>
            <p className={themeClasses.textSecondary}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className={`mt-6 px-6 py-3 bg-gradient-to-r ${themeClasses.gradient.primary} text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#1B42CB]/20 transition-all duration-300`}
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

      {/* Receipt Modal */}
      {showReceiptModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-4xl">
            <div
              className={`backdrop-blur-xl ${themeClasses.cardBg} ${themeClasses.cardBorder} border rounded-2xl shadow-2xl overflow-hidden`}
            >
              {/* Modal Header */}
              <div
                className={`px-6 py-4 bg-gradient-to-r from-[#1B42CB]/20 to-[#FF2F6C]/20 border-b ${themeClasses.border}`}
              >
                <div className="flex justify-between items-center">
                  <h2
                    className={`text-2xl font-bold bg-gradient-to-r ${themeClasses.gradient.accent} bg-clip-text text-transparent`}
                  >
                    Booking Receipt
                  </h2>
                  <button
                    onClick={() => setShowReceiptModal(false)}
                    className={`p-2 hover:${themeClasses.overlay} rounded-lg transition-colors`}
                  >
                    <Icons.X className={`w-6 h-6 ${themeClasses.text}`} />
                  </button>
                </div>
              </div>

              {/* Receipt Content */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div
                  ref={receiptRef}
                  className={`receipt-content ${themeClasses.cardBg} ${themeClasses.cardBorder} border rounded-xl p-8`}
                >
                  {/* Receipt Header */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                      <div
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${themeClasses.gradient.accent} flex items-center justify-center`}
                      >
                        <Icons.Car className="w-7 h-7 text-white" />
                      </div>
                      <h1
                        className={`text-3xl font-bold bg-gradient-to-r ${themeClasses.gradient.accent} bg-clip-text text-transparent`}
                      >
                        PARKING RECEIPT
                      </h1>
                    </div>
                    <p className={themeClasses.textSecondary}>
                      Official Booking Confirmation
                    </p>
                  </div>

                  {/* Receipt Details */}
                  <div className="space-y-6">
                    {/* Booking Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-2">
                        <div
                          className={`text-sm ${themeClasses.textSecondary}`}
                        >
                          Receipt Number
                        </div>
                        <div
                          className={`text-xl font-mono font-bold ${themeClasses.text}`}
                        >
                          {selectedBooking._id}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div
                          className={`text-sm ${themeClasses.textSecondary}`}
                        >
                          Booking Date
                        </div>
                        <div
                          className={`text-lg font-semibold ${themeClasses.text}`}
                        >
                          {formatDateForReceipt(selectedBooking.bookingDate)}
                        </div>
                      </div>
                    </div>

                    {/* User Info */}
                    <div
                      className={`bg-black/5 dark:bg-[#191919]/50 border ${themeClasses.border} rounded-xl p-4 mb-6`}
                    >
                      <h3
                        className={`text-lg font-bold ${themeClasses.text} mb-4`}
                      >
                        Customer Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div
                            className={`text-sm ${themeClasses.textSecondary} mb-1`}
                          >
                            Name
                          </div>
                          <div className={themeClasses.text}>
                            {user?.name || "N/A"}
                          </div>
                        </div>
                        <div>
                          <div
                            className={`text-sm ${themeClasses.textSecondary} mb-1`}
                          >
                            Email
                          </div>
                          <div className={themeClasses.text}>
                            {user?.email || "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Parking Details */}
                    <div
                      className={`bg-black/5 dark:bg-[#191919]/50 border ${themeClasses.border} rounded-xl p-6 mb-6`}
                    >
                      <h3
                        className={`text-lg font-bold ${themeClasses.text} mb-4`}
                      >
                        Parking Details
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <div
                            className={`text-2xl font-bold ${themeClasses.text} mb-1`}
                          >
                            {selectedBooking.parkingId?.name ||
                              "Unknown Parking"}
                          </div>
                          <div
                            className={`flex items-center gap-2 ${themeClasses.textSecondary}`}
                          >
                            <Icons.MapPin className="w-4 h-4" />
                            {selectedBooking.parkingId?.location ||
                              "Location not specified"}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div
                              className={`text-sm ${themeClasses.textSecondary} mb-1`}
                            >
                              Duration
                            </div>
                            <div
                              className={`text-xl font-bold ${themeClasses.text}`}
                            >
                              {selectedBooking.duration || 1} hr
                            </div>
                          </div>
                          <div className="text-center">
                            <div
                              className={`text-sm ${themeClasses.textSecondary} mb-1`}
                            >
                              Rate/Hour
                            </div>
                            <div className="text-xl font-bold text-[#1B42CB]">
                              ₹{selectedBooking.parkingId?.pricePerHour || 0}
                            </div>
                          </div>
                          <div className="text-center">
                            <div
                              className={`text-sm ${themeClasses.textSecondary} mb-1`}
                            >
                              Start Time
                            </div>
                            <div
                              className={`text-lg font-semibold ${themeClasses.text}`}
                            >
                              {selectedBooking.bookingDate
                                ? new Date(
                                    selectedBooking.bookingDate,
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "N/A"}
                            </div>
                          </div>
                          <div className="text-center">
                            <div
                              className={`text-sm ${themeClasses.textSecondary} mb-1`}
                            >
                              End Time
                            </div>
                            <div
                              className={`text-lg font-semibold ${themeClasses.text}`}
                            >
                              {calculateEndTime(
                                selectedBooking.bookingDate,
                                selectedBooking.duration,
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Summary */}
                    <div
                      className={`bg-black/5 dark:bg-[#191919]/50 border ${themeClasses.border} rounded-xl p-6`}
                    >
                      <h3
                        className={`text-lg font-bold ${themeClasses.text} mb-4`}
                      >
                        Payment Summary
                      </h3>
                      <div className="space-y-3">
                        <div
                          className={`flex justify-between items-center py-2 border-b ${themeClasses.border}`}
                        >
                          <div className={themeClasses.textSecondary}>
                            Hourly Rate
                          </div>
                          <div className={themeClasses.text}>
                            ₹{selectedBooking.parkingId?.pricePerHour || 0} ×{" "}
                            {selectedBooking.duration || 1} hours
                          </div>
                        </div>
                        <div
                          className={`flex justify-between items-center py-2 border-b ${themeClasses.border}`}
                        >
                          <div className={themeClasses.textSecondary}>
                            Subtotal
                          </div>
                          <div className={themeClasses.text}>
                            ₹
                            {(selectedBooking.parkingId?.pricePerHour || 0) *
                              (selectedBooking.duration || 1)}
                          </div>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <div
                            className={`text-lg font-bold ${themeClasses.text}`}
                          >
                            Total Amount
                          </div>
                          <div
                            className={`text-2xl font-bold bg-gradient-to-r ${themeClasses.gradient.accent} bg-clip-text text-transparent`}
                          >
                            ₹
                            {selectedBooking.totalPrice ||
                              selectedBooking.parkingId?.pricePerHour ||
                              0}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status and Footer */}
                    <div className="mt-8 pt-6 border-t border-[#1B42CB]/20">
                      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`px-4 py-2 rounded-lg ${getStatusColor(
                              selectedBooking.bookingStatus || "",
                            )}`}
                          >
                            <span className="font-bold">
                              Status:{" "}
                              {getStatusText(
                                selectedBooking.bookingStatus || "",
                              )}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`text-center ${themeClasses.textSecondary} text-sm`}
                        >
                          <p>Thank you for choosing our parking service!</p>
                          <p>For any queries, contact support@parking.com</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer with Download Button */}
              <div
                className={`px-6 py-4 ${themeClasses.cardBg} border-t ${themeClasses.border}`}
              >
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowReceiptModal(false)}
                    className={`px-6 py-3 ${themeClasses.cardBg} border ${themeClasses.border} ${themeClasses.text} font-semibold rounded-xl hover:bg-[#1B42CB]/10 transition-all duration-300`}
                  >
                    Close
                  </button>
                  <button
                    onClick={() => window.print()}
                    className={`px-6 py-3 bg-[#191919] dark:bg-white dark:text-black text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2`}
                  >
                    <Icons.Printer className="w-5 h-5" />
                    Print
                  </button>
                  <button
                    onClick={generateReceipt}
                    disabled={downloading}
                    className={`px-6 py-3 bg-gradient-to-r ${themeClasses.gradient.accent} text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#FF2F6C]/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                  >
                    {downloading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Icons.Download className="w-5 h-5" />
                        Download Receipt
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 md:mb-12">
          <div
            className={`backdrop-blur-xl bg-[#1B42CB]/10 border ${themeClasses.border} rounded-2xl p-6 md:p-8 shadow-2xl shadow-[#1B42CB]/10`}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${themeClasses.gradient.accent} flex items-center justify-center`}
                  >
                    <Icons.Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1
                      className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${themeClasses.gradient.accent} bg-clip-text text-transparent`}
                    >
                      My Bookings
                    </h1>
                    <p className={themeClasses.textSecondary}>
                      Manage your parking reservations
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`backdrop-blur-xl ${themeClasses.cardBg} border ${themeClasses.border} rounded-xl p-4`}
              >
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div
                      className={`text-2xl font-bold ${themeClasses.text} mb-1`}
                    >
                      {bookedSlots.length}
                    </div>
                    <div className={`text-sm ${themeClasses.textSecondary}`}>
                      Total Bookings
                    </div>
                  </div>
                  <div className="text-center">
                    <div
                      className={`text-2xl font-bold ${themeClasses.text} mb-1`}
                    >
                      {
                        bookedSlots.filter((b) => b.bookingStatus === "active")
                          .length
                      }
                    </div>
                    <div className={`text-sm ${themeClasses.textSecondary}`}>
                      Active
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Controls */}
        <div
          className={`mb-8 backdrop-blur-xl ${themeClasses.cardBg} border ${themeClasses.border} rounded-2xl p-6 shadow-xl`}
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <Icons.Search className="w-5 h-5 text-[#1B42CB]" />
              </div>
              <input
                type="text"
                placeholder="Search bookings by name, location, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 bg-black/5 dark:bg-[#191919]/50 border ${themeClasses.border} rounded-xl ${themeClasses.text} placeholder-gray-400 focus:outline-none focus:border-[#1B42CB] focus:ring-2 focus:ring-[#1B42CB]/20 transition-all duration-300`}
              />
            </div>
            <div className="flex gap-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className={`px-4 py-3 bg-black/5 dark:bg-[#191919]/50 border ${themeClasses.border} rounded-xl ${themeClasses.text} focus:outline-none focus:border-[#1B42CB] focus:ring-2 focus:ring-[#1B42CB]/20 transition-all duration-300`}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilter("all");
                }}
                className={`px-6 py-3 ${themeClasses.cardBg} border ${themeClasses.border} ${themeClasses.text} font-semibold rounded-xl hover:bg-[#1B42CB]/10 transition-all duration-300`}
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div
            className={`backdrop-blur-xl ${themeClasses.cardBg} border ${themeClasses.border} rounded-2xl p-12 text-center`}
          >
            <div
              className={`w-24 h-24 bg-gradient-to-br from-[#1B42CB]/20 to-[#FF2F6C]/20 rounded-full flex items-center justify-center mx-auto mb-6 border ${themeClasses.border}`}
            >
              <Icons.Inbox className="w-10 h-10 text-[#1B42CB]" />
            </div>
            <h3 className={`text-2xl font-bold ${themeClasses.text} mb-3`}>
              {bookedSlots.length === 0
                ? "No Bookings Yet"
                : "No Matching Bookings"}
            </h3>
            <p className={themeClasses.textSecondary}>
              {bookedSlots.length === 0
                ? "You haven't made any parking bookings yet. Start by booking a slot!"
                : "Try adjusting your search or filter criteria."}
            </p>
            {bookedSlots.length === 0 && (
              <a
                href="/"
                className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${themeClasses.gradient.accent} text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#FF2F6C]/20 transition-all duration-300 mt-6`}
              >
                Book Your First Slot
                <Icons.ArrowRight className="w-4 h-4" />
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <div
                key={booking._id}
                className={`group backdrop-blur-xl ${themeClasses.cardBg} border ${themeClasses.border} rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-[#1B42CB]/10 hover:border-[#1B42CB]/40 transition-all duration-500`}
              >
                {/* Status Header */}
                <div
                  className={`px-6 py-4 ${getStatusColor(
                    booking.bookingStatus || "",
                  )}`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-current"></div>
                      <span className="font-bold text-sm">
                        {getStatusText(booking.bookingStatus || "")}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 bg-black/20 rounded-full ${themeClasses.text}`}
                      >
                        Booking ID: {booking._id.substring(0, 8)}...
                      </span>
                    </div>
                    <div className="text-sm font-medium">
                      {formatDate(booking.bookingDate)}
                    </div>
                  </div>
                </div>

                {/* Booking Content */}
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Parking Slot Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <h3
                            className={`text-xl font-bold ${themeClasses.text} mb-2`}
                          >
                            {booking.parkingId?.name || "Unknown Parking"}
                          </h3>
                          <div
                            className={`flex items-center gap-4 ${themeClasses.textSecondary}`}
                          >
                            <div className="flex items-center gap-2">
                              <Icons.MapPin className="w-4 h-4" />
                              <span>
                                {booking.parkingId?.location || "N/A"}
                              </span>
                            </div>
                            {booking.parkingId?.distance && (
                              <div className="flex items-center gap-2">
                                <Icons.Gauge className="w-4 h-4" />
                                <span>{booking.parkingId.distance}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-2xl font-bold bg-gradient-to-r ${themeClasses.gradient.accent} bg-clip-text text-transparent`}
                          >
                            ₹{booking.parkingId?.pricePerHour || 0}
                          </div>
                          <div
                            className={`text-sm ${themeClasses.textSecondary}`}
                          >
                            per hour
                          </div>
                        </div>
                      </div>

                      {/* Booking Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        <div
                          className={`bg-black/5 dark:bg-[#191919]/50 border ${themeClasses.border} rounded-xl p-4`}
                        >
                          <div
                            className={`text-sm ${themeClasses.textSecondary} mb-2`}
                          >
                            Duration
                          </div>
                          <div
                            className={`text-lg font-bold ${themeClasses.text}`}
                          >
                            {booking.duration || 1} hour
                            {booking.duration !== 1 ? "s" : ""}
                          </div>
                        </div>
                        <div
                          className={`bg-black/5 dark:bg-[#191919]/50 border ${themeClasses.border} rounded-xl p-4`}
                        >
                          <div
                            className={`text-sm ${themeClasses.textSecondary} mb-2`}
                          >
                            Total Price
                          </div>
                          <div
                            className={`text-lg font-bold ${themeClasses.text}`}
                          >
                            ₹
                            {booking.totalPrice ||
                              booking.parkingId?.pricePerHour ||
                              0}
                          </div>
                        </div>
                        <div
                          className={`bg-black/5 dark:bg-[#191919]/50 border ${themeClasses.border} rounded-xl p-4`}
                        >
                          <div
                            className={`text-sm ${themeClasses.textSecondary} mb-2`}
                          >
                            Parking End
                          </div>
                          <div
                            className={`text-lg font-bold ${themeClasses.text}`}
                          >
                            {calculateEndTime(
                              booking.bookingDate,
                              booking.duration,
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Slot Availability */}
                      <div
                        className={`bg-black/5 dark:bg-[#191919]/50 border ${themeClasses.border} rounded-xl p-4`}
                      >
                        <div className="flex justify-between items-center mb-3">
                          <div
                            className={`text-sm font-medium ${themeClasses.text}`}
                          >
                            Slot Availability
                          </div>
                          <div
                            className={`text-sm ${themeClasses.textSecondary}`}
                          >
                            {booking.parkingId?.availableSlots || 0}/
                            {booking.parkingId?.capacity || 0} available
                          </div>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-[#191919] rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${themeClasses.gradient.accent}`}
                            style={{
                              width: `${Math.round(
                                ((booking.parkingId?.availableSlots || 0) /
                                  (booking.parkingId?.capacity || 1)) *
                                  100,
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Action Panel */}
                    <div
                      className={`lg:w-64 border-l lg:border-l-0 lg:border-t ${themeClasses.border} lg:pl-6 lg:pt-0 pt-6`}
                    >
                      <div className="space-y-4">
                        <div
                          className={`bg-gradient-to-br from-[#1B42CB]/10 to-[#FF2F6C]/10 rounded-xl p-4`}
                        >
                          <div
                            className={`text-sm font-medium ${themeClasses.text} mb-2`}
                          >
                            Quick Actions
                          </div>
                          <div className="space-y-2">
                            {/* Entry Button */}
                            {booking.bookingStatus === "active" && (
                              <button
                                className="w-full px-4 py-2 bg-green-600/20 border border-green-500/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-600/30 transition-colors text-sm flex items-center justify-center gap-2"
                                onClick={() => handleVehicleEntry(booking._id)}
                              >
                                <Icons.LogIn className="w-4 h-4" />
                                Enter Vehicle
                              </button>
                            )}

                            {/* Exit Button */}
                            {booking.bookingStatus === "active" && (
                              <button
                                className="w-full px-4 py-2 bg-orange-600/20 border border-orange-500/30 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-600/30 transition-colors text-sm flex items-center justify-center gap-2"
                                onClick={() => handleVehicleExit(booking._id)}
                              >
                                <Icons.LogOut className="w-4 h-4" />
                                Exit Vehicle
                              </button>
                            )}
                            
                            {/* Extend Parking Button */}
                            {booking.bookingStatus === "active" && (
                              <button
                                disabled={isBookingExpired(booking.bookingDate, booking.duration)}
                                className={`w-full px-4 py-2 ${themeClasses.cardBg} border ${themeClasses.border} rounded-lg transition-colors text-sm flex items-center justify-center gap-2 ${
                                  isBookingExpired(booking.bookingDate, booking.duration)
                                    ? "opacity-50 cursor-not-allowed text-gray-500" // Disabled styling
                                    : `${themeClasses.text} hover:bg-[#1B42CB]/10` // Active styling
                                }`}
                                onClick={() => setExtendBooking(booking)}
                              >
                                <Icons.TimerReset className="w-4 h-4" />
                                {isBookingExpired(booking.bookingDate, booking.duration) 
                                  ? "Cannot Extend (Expired)" 
                                  : "Extend Parking"}
                              </button>
                            )}

                            {/* Download Receipt button */}
                            <button
                              className={`w-full px-4 py-2 ${themeClasses.cardBg} border ${themeClasses.border} ${themeClasses.text} rounded-lg hover:bg-[#1B42CB]/10 transition-colors text-sm flex items-center justify-center gap-2`}
                              onClick={() => handleDownloadReceipt(booking)}
                            >
                              <Icons.Download className="w-4 h-4" />
                              Download Receipt
                            </button>

                            {/* Get Directions button */}
                            <button
                              className={`w-full px-4 py-2 ${themeClasses.cardBg} border ${themeClasses.border} ${themeClasses.text} rounded-lg hover:bg-[#1B42CB]/10 transition-colors text-sm flex items-center justify-center gap-2`}
                              onClick={() =>
                                toast.info("Directions feature coming soon!")
                              }
                            >
                              <Icons.MapPin className="w-4 h-4" />
                              Get Directions
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDelete(booking._id)}
                          disabled={
                            booking.bookingStatus === "cancelled" ||
                            booking.bookingStatus === "completed"
                          }
                          className={`
                            w-full py-3 rounded-xl font-semibold text-lg
                            transition-all duration-300 flex items-center justify-center gap-2
                            ${
                              booking.bookingStatus === "active"
                                ? `bg-gradient-to-r ${themeClasses.gradient.secondary} text-white hover:shadow-lg hover:shadow-[#FF2F6C]/20`
                                : `${themeClasses.cardBg} ${themeClasses.textSecondary} border ${themeClasses.border} cursor-not-allowed`
                            }
                          `}
                        >
                          {booking.bookingStatus === "active" ? (
                            <>
                              <Icons.X className="w-5 h-5" />
                              Cancel Booking
                            </>
                          ) : (
                            "Booking " +
                            getStatusText(booking.bookingStatus || "")
                          )}
                        </button>

                        <div
                          className={`text-xs ${themeClasses.textSecondary} text-center pt-2`}
                        >
                          {booking.bookingStatus === "active" && (
                            <p>You can cancel up to 1 hour before start time</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Footer */}
        {bookedSlots.length > 0 && (
          <div
            className={`mt-8 backdrop-blur-xl bg-gradient-to-r from-[#1B42CB]/10 to-[#FF2F6C]/10 border ${themeClasses.border} rounded-2xl p-6`}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className={`text-2xl font-bold ${themeClasses.text} mb-2`}>
                  {
                    bookedSlots.filter((b) => b.bookingStatus === "active")
                      .length
                  }
                </div>
                <div className={themeClasses.textSecondary}>
                  Active Bookings
                </div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${themeClasses.text} mb-2`}>
                  {
                    bookedSlots.filter((b) => b.bookingStatus === "completed")
                      .length
                  }
                </div>
                <div className={themeClasses.textSecondary}>Completed</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${themeClasses.text} mb-2`}>
                  {
                    bookedSlots.filter((b) => b.bookingStatus === "cancelled")
                      .length
                  }
                </div>
                <div className={themeClasses.textSecondary}>Cancelled</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${themeClasses.text} mb-2`}>
                  ₹
                  {bookedSlots
                    .filter((b) => b.bookingStatus === "active")
                    .reduce(
                      (sum, b) =>
                        sum + (b.totalPrice || b.parkingId?.pricePerHour || 0),
                      0,
                    )}
                </div>
                <div className={themeClasses.textSecondary}>Active Total</div>
              </div>
            </div>
          </div>
        )}

        {/* Extend Parking Modal */}
        {extendBooking && (
          <ExtendParkingModal
            bookingId={extendBooking._id}
            parkingName={extendBooking.parkingId?.name || "Unknown Parking"}
            currentDuration={extendBooking.duration || 1}
            bookingDate={extendBooking.bookingDate || new Date().toISOString()}
            pricePerHour={extendBooking.parkingId?.pricePerHour || 0}
            extensionsUsed={extendBooking.extensions?.length || 0}
            onClose={() => setExtendBooking(null)}
            onSuccess={() => {
              setExtendBooking(null);
              fetchBookedSlots();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default BookedSlotsPage;