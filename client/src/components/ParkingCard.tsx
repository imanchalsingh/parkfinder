import * as React from "react";
import * as Icons from "lucide-react";
import type { ParkingSlot } from "../hooks/useParkingSlots";
import { useThemeClasses } from "../hooks/useThemeClasses";
import ImageCarousel from "./ImageCarousel";
import ShareButton from "./ShareButton";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { calculateDistance, getDirectionsUrl } from "../utils/distance";
import {
  getAvailabilityColor,
  getAvailabilityPercentage,
  getAvailabilityText,
  getRatingColor,
  getStatusBadge,
} from "../utils/parkingHelpers";

interface ParkingCardProps {
  slot: ParkingSlot;
  userLocation: { lat: number; lng: number } | null;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent, locationId: string) => void;
  onBookNow: (slot: ParkingSlot) => void;
  onShowPrediction: (slot: ParkingSlot) => void;
  onShowFloors: (slot: ParkingSlot) => void;
}

export const ParkingCard: React.FC<ParkingCardProps> = ({
  slot,
  userLocation,
  isFavorite,
  onToggleFavorite,
  onBookNow,
  onShowPrediction,
  onShowFloors,
}) => {
  const themeClasses = useThemeClasses();

  const availabilityPercentage = getAvailabilityPercentage(
    slot.availableSlots,
    slot.capacity
  );
  const availabilityText = getAvailabilityText(availabilityPercentage);
  const availabilityColor = getAvailabilityColor(availabilityPercentage);

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case "available":
        return themeClasses.status.available;
      case "occupied":
        return themeClasses.status.occupied;
      case "maintenance":
        return themeClasses.status.maintenance;
      default:
        return themeClasses.status.default;
    }
  };

  const isAvailable = slot.status?.toLowerCase() === "available" && slot.availableSlots > 0;

  return (
    <div
      className={`group backdrop-blur-xl ${themeClasses.cardBg} ${themeClasses.cardBorder} border rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-[#1B42CB]/10 hover:border-[#1B42CB]/40 transition-all duration-500 transform hover:-translate-y-1`}
    >
      {/* Status Header */}
      <div className={`px-6 py-4 ${getStatusColor(slot.status)} border-b ${themeClasses.border}`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-current"></div>
            <span className="font-bold text-sm">{getStatusBadge(slot.status)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${availabilityColor} bg-black/20`}>
              {availabilityText}
            </span>
            <ShareButton
              title={slot.name}
              text={`Check out ${slot.name} at ${slot.location}!`}
              url={`${window.location.origin}/parkingslots`}
              className="p-1.5 rounded-full transition-all duration-300 bg-black/20 text-white/70 hover:text-white hover:bg-black/40"
              iconClassName="w-4 h-4"
            />
            <button
              onClick={(e) => onToggleFavorite(e, slot._id)}
              className={`p-1.5 rounded-full transition-all duration-300 ${
                isFavorite
                  ? "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                  : "bg-black/20 text-white/70 hover:text-white hover:bg-black/40"
              }`}
              title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            >
              <Icons.Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      <ImageCarousel images={slot.images ?? []} name={slot.name} />

      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className={`text-xl font-bold ${themeClasses.text} mb-1`}>{slot.name}</h3>
            <div className="flex items-center gap-2">
              <div className={`text-lg font-bold ${getRatingColor(slot.rating)}`}>
                {slot?.rating ? slot.rating.toFixed(1) : "0.0"}
              </div>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Icons.Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(slot.rating)
                        ? "text-[#FF2F6C] fill-current"
                        : themeClasses.textMuted
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div
              className={`text-2xl font-bold bg-gradient-to-r ${themeClasses.gradient.accent} bg-clip-text text-transparent`}
            >
              ₹{Number(slot.pricePerHour || 0).toFixed(2)}
            </div>
            <div className={`text-sm ${themeClasses.textSecondary}`}>per hour</div>
          </div>
        </div>

        {/* Location */}
        <div className="mb-6 p-4 bg-[#1B42CB]/10 rounded-xl border border-[#1B42CB]/20">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-lg bg-gradient-to-br ${themeClasses.gradient.primary} flex items-center justify-center`}
            >
              <Icons.MapPin className="w-4 h-4 text-white" />
            </div>
            <span className={`${themeClasses.text} font-medium truncate`}>{slot.location}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className={`${themeClasses.cardBgSecondary} border ${themeClasses.border} rounded-xl p-3 text-center`}>
            <div className={`text-sm ${themeClasses.textSecondary} mb-1`}>Distance</div>
            <div className={`text-lg font-bold ${themeClasses.text}`}>
              {userLocation && slot.coordinates
                ? calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    slot.coordinates.lat,
                    slot.coordinates.lng
                  )
                : slot.distance}
            </div>
          </div>
          <div className={`${themeClasses.cardBgSecondary} border ${themeClasses.border} rounded-xl p-3 text-center`}>
            <div className={`text-sm ${themeClasses.textSecondary} mb-1`}>Available</div>
            <div className={`text-lg font-bold ${themeClasses.text}`}>
              {slot.availableSlots}
              <span className={`text-sm ${themeClasses.textSecondary} ml-1`}>/{slot.capacity}</span>
            </div>
          </div>
          <div className={`${themeClasses.cardBgSecondary} border ${themeClasses.border} rounded-xl p-3 text-center`}>
            <div className={`text-sm ${themeClasses.textSecondary} mb-1`}>Fill %</div>
            <div className={`text-lg font-bold ${availabilityColor}`}>{availabilityPercentage}%</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className={themeClasses.textSecondary}>Capacity Usage</span>
            <span className={`font-semibold ${themeClasses.text}`}>
              {availabilityPercentage}% available
            </span>
          </div>
          <div className="h-2 bg-[#191919] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#1B42CB] via-[#FF2F6C] to-[#1B42CB]"
              style={{ width: `${availabilityPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Description */}
        {slot.description && (
          <div className={`mb-6 p-4 ${themeClasses.cardBgSecondary} border ${themeClasses.border} rounded-xl`}>
            <div className={`prose prose-sm dark:prose-invert max-w-none max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-[#1B42CB]/50 scrollbar-track-transparent pr-2`}>
              <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                {slot.description}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* Emergency Contact */}
        {slot.emergencyContact?.phone && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Icons.AlertTriangle className="w-4 h-4 text-red-500" />
              <span className={`text-sm font-semibold ${themeClasses.text}`}>Emergency Assistance</span>
            </div>
            <div className="flex gap-2">
              <a
                href={`tel:${slot.emergencyContact.phone}`}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <Icons.PhoneCall className="w-4 h-4" />
                Call
              </a>
              {slot.emergencyContact.supportEmail && (
                <a
                  href={`mailto:${slot.emergencyContact.supportEmail}`}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 ${themeClasses.cardBgSecondary} border ${themeClasses.border} ${themeClasses.text} rounded-lg ${themeClasses.hover} transition-colors text-sm font-medium`}
                >
                  <Icons.Mail className="w-4 h-4" />
                  Email
                </a>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {/* Row 1: Utility Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => onShowPrediction(slot)}
              title="View availability forecast"
              className={`flex-1 py-2.5 rounded-lg border ${themeClasses.cardBgSecondary} ${themeClasses.border} ${themeClasses.textSecondary} ${themeClasses.hover} transition-colors flex items-center justify-center gap-1.5 text-xs font-medium`}
            >
              <Icons.TrendingUp className="w-3.5 h-3.5" />
              Forecast
            </button>

            <button
              onClick={() => onShowFloors(slot)}
              title="View floor-wise slot layout"
              className={`flex-1 py-2.5 rounded-lg border ${themeClasses.cardBgSecondary} ${themeClasses.border} ${themeClasses.textSecondary} ${themeClasses.hover} transition-colors flex items-center justify-center gap-1.5 text-xs font-medium`}
            >
              <Icons.Layers className="w-3.5 h-3.5" />
              Floors
            </button>

            <a
              href={getDirectionsUrl(slot)}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 py-2.5 ${themeClasses.cardBgSecondary} border ${themeClasses.border} ${themeClasses.text} rounded-lg ${themeClasses.hover} transition-colors flex items-center justify-center gap-1.5 text-xs font-medium`}
            >
              <Icons.Navigation className="w-3.5 h-3.5" />
              Directions
            </a>
          </div>

          {/* Row 2: Book Now Button */}
          <button
            onClick={() => onBookNow(slot)}
            disabled={!isAvailable}
            className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              isAvailable
                ? "bg-gradient-to-r from-[#1B42CB] to-[#FF2F6C] text-white hover:shadow-lg hover:shadow-[#FF2F6C]/20"
                : `${themeClasses.cardBgSecondary} ${themeClasses.textSecondary} border ${themeClasses.border} cursor-not-allowed`
            }`}
          >
            <Icons.MapPin className="w-4 h-4" />
            {isAvailable
              ? "Book Now"
              : slot.availableSlots === 0
              ? "Fully Booked"
              : getStatusBadge(slot.status)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParkingCard;
