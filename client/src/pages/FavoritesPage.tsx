import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useParkingSlots } from "../hooks/useParkingSlots";
import { useFavorites } from "../hooks/useFavorites";
import { useThemeClasses } from "../hooks/useThemeClasses";
import ParkingCard from "../components/ParkingCard";
import ParkingCardSkeleton from "../components/ParkingCardSkeleton";
import BookingModal from "../components/BookingModal";
import type { ParkingSlot } from "../hooks/useParkingSlots";
import PeakHoursIndicator from "../components/PeakHoursIndicator";
import FloorVisualization from "../components/FloorVisualization";
import { toast } from "react-hot-toast";

const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const themeClasses = useThemeClasses();

  const { parkingSlots, loading, error, userLocation, refetch } = useParkingSlots();
  const { favorites, toggleFavorite } = useFavorites();

  const [selectedSlot, setSelectedSlot] = React.useState<ParkingSlot | null>(null);
  const [predictionSlot, setPredictionSlot] = React.useState<ParkingSlot | null>(null);
  const [floorSlot, setFloorSlot] = React.useState<ParkingSlot | null>(null);

  const favoriteSlots = useMemo(() => {
    return parkingSlots.filter((slot) => favorites.includes(slot._id));
  }, [parkingSlots, favorites]);

  const handleBookNow = (slot: ParkingSlot) => {
    if (!token || !user) {
      toast.error("Please login to book a parking slot");
      navigate("/login");
      return;
    }
    setSelectedSlot(slot);
  };

  if (!token) {
    return (
      <div className={`min-h-screen ${themeClasses.bg} flex items-center justify-center p-4 transition-colors duration-300`}>
        <div className={`backdrop-blur-xl ${themeClasses.cardBg} border ${themeClasses.border} rounded-3xl p-8 max-w-md w-full shadow-2xl text-center`}>
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#1B42CB]/20 to-[#FF2F6C]/20 flex items-center justify-center">
            <Icons.Heart className="w-8 h-8 text-[#FF2F6C]" />
          </div>
          <h2 className={`text-2xl font-bold ${themeClasses.text} mb-3`}>Authentication Required</h2>
          <p className={`${themeClasses.textSecondary} mb-8`}>
            You are not signed in. Please sign in to view your favorite parking locations.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate("/login")} className={`px-6 py-3 bg-gradient-to-r ${themeClasses.gradient.primary} text-white rounded-xl font-semibold`}>
              Sign In
            </button>
            <button onClick={() => navigate("/signup")} className={`px-6 py-3 border ${themeClasses.border} rounded-xl font-semibold ${themeClasses.text}`}>
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }



  if (error) {
    return (
      <div className={`min-h-screen ${themeClasses.bg} transition-colors duration-300 flex items-center justify-center p-4`}>
        <div className={`backdrop-blur-xl ${themeClasses.cardBg} ${themeClasses.cardBorder} border rounded-3xl p-8 max-w-md w-full shadow-2xl`}>
          <div className="text-center">
            <div className={`w-20 h-20 bg-gradient-to-br ${themeClasses.gradient.accent}/20 rounded-full flex items-center justify-center mx-auto mb-6 border ${themeClasses.border}`}>
              <Icons.AlertCircle className="w-8 h-8 text-[#FF2F6C]" />
            </div>
            <h2 className={`text-2xl font-bold ${themeClasses.text} mb-3`}>Error Loading Favorites</h2>
            <p className={`${themeClasses.textSecondary} mb-6`}>{error}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-3 bg-gradient-to-r from-[#1B42CB] to-[#FF2F6C] text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`min-h-screen ${themeClasses.bg} transition-colors duration-300 p-4 md:p-6`}>
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#1B42CB]/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#FF2F6C]/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <header className="mb-8 md:mb-12">
            <div className={`backdrop-blur-xl ${themeClasses.cardBg} ${themeClasses.cardBorder} border rounded-2xl p-6 md:p-8 shadow-xl flex items-center gap-4`}>
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${themeClasses.gradient.accent} flex items-center justify-center`}>
                <Icons.Heart className="w-7 h-7 text-white fill-current" />
              </div>
              <div>
                <h1 className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${themeClasses.gradient.accent} bg-clip-text text-transparent`}>
                  Your Favorites
                </h1>
                <p className={themeClasses.textSecondary}>Quick access to your saved parking locations.</p>
              </div>
            </div>
          </header>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <ParkingCardSkeleton key={index} />
              ))}
            </div>
          ) : favoriteSlots.length === 0 ? (
            <div className={`backdrop-blur-xl ${themeClasses.cardBg} ${themeClasses.cardBorder} border rounded-2xl p-12 text-center`}>
              <div className={`w-24 h-24 bg-gradient-to-br ${themeClasses.gradient.accent}/20 rounded-full flex items-center justify-center mx-auto mb-6 border ${themeClasses.border}`}>
                <Icons.Heart className="w-8 h-8 text-[#FF2F6C] fill-current opacity-50" />
              </div>
              <h3 className={`text-2xl font-bold ${themeClasses.text} mb-3`}>No Favorites Yet</h3>
              <p className={`${themeClasses.textSecondary} mb-6`}>
                You haven't saved any parking locations to your favorites. Explore available slots and click the heart icon to save them for later!
              </p>
              <button onClick={() => navigate("/parkingslots")} className="px-6 py-3 bg-gradient-to-r from-[#1B42CB] to-[#FF2F6C] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300">
                Explore Parking Slots
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteSlots.map((slot) => (
                <ParkingCard
                  key={slot._id}
                  slot={slot}
                  userLocation={userLocation}
                  isFavorite={true}
                  onToggleFavorite={toggleFavorite}
                  onBookNow={handleBookNow}
                  onShowPrediction={setPredictionSlot}
                  onShowFloors={setFloorSlot}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {predictionSlot && (
        <PeakHoursIndicator
          parkingId={predictionSlot._id}
          parkingName={predictionSlot.name}
          onClose={() => setPredictionSlot(null)}
        />
      )}

      {floorSlot && (
        <FloorVisualization
          parkingId={floorSlot._id}
          parkingName={floorSlot.name}
          onClose={() => setFloorSlot(null)}
        />
      )}

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

export default FavoritesPage;
