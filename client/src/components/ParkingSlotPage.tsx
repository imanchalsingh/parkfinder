import * as React from "react";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PeakHoursIndicator from "./PeakHoursIndicator";
import FloorVisualization from "./FloorVisualization";

// Hooks
import { useParkingSlots } from "../hooks/useParkingSlots";
import type { ParkingSlot } from "../hooks/useParkingSlots";
import { useFavorites } from "../hooks/useFavorites";
import { useThemeClasses } from "../hooks/useThemeClasses";

// Components
import FilterBar from "./FilterBar";
import ParkingCard from "./ParkingCard";
import ParkingCardSkeleton from "./ParkingCardSkeleton";
import MapView from "./MapView";
import BookingModal from "./BookingModal";
import PullToRefresh from "./PullToRefresh";
import { toast } from "react-hot-toast";

const ParkingSlotPage: React.FC = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const themeClasses = useThemeClasses();

  // Custom Hooks
  const {
    parkingSlots,
    loading,
    error,
    evFilter,
    setEvFilter,
    userLocation,
    refetch,
  } = useParkingSlots();

  const { favorites, toggleFavorite } = useFavorites();

  // Local UI States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  // Selection States for Modals
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [selectedMapSlot, setSelectedMapSlot] = useState<ParkingSlot | null>(null);
  const [predictionSlot, setPredictionSlot] = useState<ParkingSlot | null>(null);
  const [floorSlot, setFloorSlot] = useState<ParkingSlot | null>(null);

  // Filtered and Sorted Parking Slots
  const filteredAndSortedSlots = useMemo(() => {
    let filtered = [...parkingSlots];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (slot) =>
          slot.name.toLowerCase().includes(lowerSearch) ||
          slot.location.toLowerCase().includes(lowerSearch)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(
        (slot) => slot.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (sortBy) {
      switch (sortBy) {
        case "price":
          filtered.sort((a, b) => a.pricePerHour - b.pricePerHour);
          break;
        case "distance":
          if (userLocation) {
            filtered.sort((a, b) => {
              if (!a.coordinates || !b.coordinates) return 0;
              const distA = Math.sqrt(
                Math.pow(a.coordinates.lat - userLocation.lat, 2) +
                  Math.pow(a.coordinates.lng - userLocation.lng, 2)
              );
              const distB = Math.sqrt(
                Math.pow(b.coordinates.lat - userLocation.lat, 2) +
                  Math.pow(b.coordinates.lng - userLocation.lng, 2)
              );
              return distA - distB;
            });
          }
          break;
        case "rating":
          filtered.sort((a, b) => b.rating - a.rating);
          break;
      }
    }

    return filtered;
  }, [parkingSlots, searchTerm, statusFilter, sortBy, userLocation]);

  const handleBookNow = (slot: ParkingSlot) => {
    if (!token || !user) {
      toast.error("Please login to book a parking slot");
      navigate("/login");
      return;
    }
    setSelectedSlot(slot);
  };



  if (error) {
    return (
      <div
        className={`min-h-screen ${themeClasses.bg} transition-colors duration-300 flex items-center justify-center p-4`}
      >
        <div
          className={`backdrop-blur-xl ${themeClasses.cardBg} ${themeClasses.cardBorder} border rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-[#1B42CB]/10`}
        >
          <div className="text-center">
            <div
              className={`w-20 h-20 bg-gradient-to-br ${themeClasses.gradient.accent}/20 rounded-full flex items-center justify-center mx-auto mb-6 border ${themeClasses.border}`}
            >
              <Icons.AlertCircle className="w-8 h-8 text-[#FF2F6C]" />
            </div>
            <h2 className={`text-2xl font-bold ${themeClasses.text} mb-3`}>Connection Error</h2>
            <p className={`${themeClasses.textSecondary} mb-6`}>{error}</p>
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#1B42CB] to-[#1B42CB]/80 text-white font-semibold rounded-xl hover:from-[#1B42CB]/90 hover:to-[#1B42CB]/70 transition-all duration-300 hover:shadow-lg hover:shadow-[#1B42CB]/20"
              >
                Retry
              </button>
              <button
                onClick={() => navigate(-1)}
                className={`px-6 py-3 ${themeClasses.cardBgSecondary} border ${themeClasses.border} ${themeClasses.text} font-semibold rounded-xl ${themeClasses.hover} transition-all duration-300`}
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PullToRefresh onRefresh={async () => { await refetch(); }}>
        <div className={`min-h-screen ${themeClasses.bg} transition-colors duration-300 p-4 md:p-6`}>
          {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#1B42CB]/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#FF2F6C]/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#1B42CB]/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Header */}
          <header className="mb-8 md:mb-12">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div
                className={`backdrop-blur-xl ${themeClasses.cardBg} ${themeClasses.cardBorder} border rounded-2xl p-6 md:p-8 shadow-2xl shadow-[#1B42CB]/10`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${themeClasses.gradient.accent} flex items-center justify-center`}
                  >
                    <Icons.Car className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1
                      className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${themeClasses.gradient.accent} bg-clip-text text-transparent`}
                    >
                      SmartPark
                    </h1>
                    <p className={themeClasses.textSecondary}>Parking Solutions</p>
                  </div>
                </div>
                <p className={`${themeClasses.textSecondary} max-w-2xl`}>
                  Find, book, and manage parking slots with real-time availability and smart
                  recommendations.
                </p>
              </div>

              {/* Top Stats Dashboard */}
              <div
                className={`backdrop-blur-xl ${themeClasses.cardBgSecondary} border ${themeClasses.border} rounded-2xl p-6 shadow-xl`}
              >
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${themeClasses.text} mb-1`}>
                      {parkingSlots.reduce((sum, slot) => sum + slot.availableSlots, 0)}
                    </div>
                    <div className={`text-sm ${themeClasses.textSecondary}`}>Available Slots</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${themeClasses.text} mb-1`}>
                      {parkingSlots.length}
                    </div>
                    <div className={`text-sm ${themeClasses.textSecondary}`}>Locations</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${themeClasses.text} mb-1`}>
                      ₹
                      {parkingSlots.length > 0
                        ? Math.min(...parkingSlots.map((s) => s.pricePerHour))
                        : 0}
                    </div>
                    <div className={`text-sm ${themeClasses.textSecondary}`}>Starting Price</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${themeClasses.text} mb-1`}>
                      {parkingSlots.reduce((sum, slot) => sum + slot.capacity, 0)}
                    </div>
                    <div className={`text-sm ${themeClasses.textSecondary}`}>Total Capacity</div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Filter Bar */}
          <FilterBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            viewMode={viewMode}
            setViewMode={setViewMode}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            evFilter={evFilter}
            setEvFilter={setEvFilter}
          />

          {/* Slots Rendering Area */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <ParkingCardSkeleton key={index} />
              ))}
            </div>
          ) : filteredAndSortedSlots.length === 0 ? (
            <div
              className={`backdrop-blur-xl ${themeClasses.cardBg} ${themeClasses.cardBorder} border rounded-2xl p-12 text-center`}
            >
              <div
                className={`w-24 h-24 bg-gradient-to-br ${themeClasses.gradient.accent}/20 rounded-full flex items-center justify-center mx-auto mb-6 border ${themeClasses.border}`}
              >
                <Icons.Car className="w-8 h-8 text-[#1B42CB]" />
              </div>
              <h3 className={`text-2xl font-bold ${themeClasses.text} mb-3`}>
                No Parking Slots Found
              </h3>
              <p className={`${themeClasses.textSecondary} mb-6`}>
                {searchTerm || statusFilter || evFilter
                  ? "Try adjusting your filters"
                  : "Check back later for available spots"}
              </p>
              {(searchTerm || statusFilter || evFilter) && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("");
                    setSortBy("");
                    setEvFilter(false);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-[#1B42CB] to-[#1B42CB]/80 text-white font-semibold rounded-xl hover:from-[#1B42CB]/90 hover:to-[#1B42CB]/70 transition-all duration-300"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : viewMode === "map" ? (
            <MapView
              filteredAndSortedSlots={filteredAndSortedSlots}
              userLocation={userLocation}
              selectedMapSlot={selectedMapSlot}
              setSelectedMapSlot={setSelectedMapSlot}
              onBookNow={handleBookNow}
              setFloorSlot={setFloorSlot}
              setPredictionSlot={setPredictionSlot}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedSlots.map((slot) => (
                <ParkingCard
                  key={slot._id}
                  slot={slot}
                  userLocation={userLocation}
                  isFavorite={favorites.includes(slot._id)}
                  onToggleFavorite={toggleFavorite}
                  onBookNow={handleBookNow}
                  onShowPrediction={setPredictionSlot}
                  onShowFloors={setFloorSlot}
                />
              ))}
            </div>
          )}

          {/* Bottom Summary Stats Cards */}
          {parkingSlots.length > 0 && (
            <div
              className={`mt-8 backdrop-blur-xl bg-gradient-to-r ${themeClasses.gradient.accent}/10 border ${themeClasses.border} rounded-2xl p-8`}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${themeClasses.text} mb-2`}>
                    {filteredAndSortedSlots.filter((s) => s.status === "available").length}
                  </div>
                  <div className={themeClasses.textSecondary}>Available Now</div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${themeClasses.text} mb-2`}>
                    {filteredAndSortedSlots.length > 0
                      ? Math.round(
                          (filteredAndSortedSlots.reduce(
                            (sum, s) => sum + (s.capacity ? s.availableSlots / s.capacity : 0),
                            0
                          ) /
                            filteredAndSortedSlots.length) *
                            100
                        )
                      : 0}
                    %
                  </div>
                  <div className={themeClasses.textSecondary}>Average Availability</div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${themeClasses.text} mb-2`}>
                    ₹
                    {filteredAndSortedSlots.length > 0
                      ? Math.round(
                          filteredAndSortedSlots.reduce((sum, s) => sum + s.pricePerHour, 0) /
                            filteredAndSortedSlots.length
                        )
                      : 0}
                  </div>
                  <div className={themeClasses.textSecondary}>Avg. Price/Hour</div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${themeClasses.text} mb-2`}>
                    {filteredAndSortedSlots.length}
                  </div>
                  <div className={themeClasses.textSecondary}>Showing Slots</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </PullToRefresh>

      {/* Prediction Panel Modal */}
      {predictionSlot && (
        <PeakHoursIndicator
          parkingId={predictionSlot._id}
          parkingName={predictionSlot.name}
          onClose={() => setPredictionSlot(null)}
        />
      )}

      {/* Floor Visualization Modal */}
      {floorSlot && (
        <FloorVisualization
          parkingId={floorSlot._id}
          parkingName={floorSlot.name}
          onClose={() => setFloorSlot(null)}
        />
      )}

      {/* Booking Modal */}
      {selectedSlot && (
        <BookingModal
          selectedSlot={selectedSlot}
          onClose={() => setSelectedSlot(null)}
          onBookingSuccess={refetch}
        />
      )}
    </>
  );
};

export default ParkingSlotPage;