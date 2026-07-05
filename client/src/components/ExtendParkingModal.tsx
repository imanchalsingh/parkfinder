import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

interface ExtendParkingModalProps {
  bookingId: string;
  parkingName: string;
  currentDuration: number;
  bookingDate: string;
  pricePerHour: number;
  extensionsUsed: number;
  onClose: () => void;
  onSuccess: (data: ExtendSuccessData) => void;
}

interface ExtendSuccessData {
  newDuration: number;
  newTotalPrice: number;
  newExpiry: string;
  additionalCost: number;
  extensionsUsed: number;
  extensionsRemaining: number;
}

const ExtendParkingModal: React.FC<ExtendParkingModalProps> = ({
  bookingId,
  parkingName,
  currentDuration,
  bookingDate,
  pricePerHour,
  extensionsUsed,
  onClose,
  onSuccess,
}) => {
  const [additionalHours, setAdditionalHours] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const { token } = useAuth();
  const { theme } = useTheme();

  const MAX_EXTENSIONS = 3;
  const extensionsRemaining = MAX_EXTENSIONS - extensionsUsed;

  // Derived values
  const additionalCost = pricePerHour * additionalHours;
  const newDurationTotal = currentDuration + additionalHours;
  const bookingStart = new Date(bookingDate);
  const currentExpiry = new Date(
    bookingStart.getTime() + currentDuration * 60 * 60 * 1000
  );
  const newExpiry = new Date(
    bookingStart.getTime() + newDurationTotal * 60 * 60 * 1000
  );

  // Warn if booking is approaching expiry
  const minutesUntilExpiry = Math.round(
    (currentExpiry.getTime() - Date.now()) / 1000 / 60
  );
  const isExpiringSoon = minutesUntilExpiry <= 30 && minutesUntilExpiry > 0;
  const isExpired = minutesUntilExpiry <= 0;

  const tc = {
    cardBg: theme === "light" ? "bg-white" : "bg-[#1a1a1a]",
    cardBorder: theme === "light" ? "border-gray-200" : "border-[#1B42CB]/20",
    text: theme === "light" ? "text-gray-900" : "text-[#EEECF6]",
    textSecondary: theme === "light" ? "text-gray-600" : "text-[#EEECF6]/70",
    textMuted: theme === "light" ? "text-gray-400" : "text-[#EEECF6]/40",
    inputBg: theme === "light" ? "bg-gray-50 border-gray-300" : "bg-white/5 border-white/10",
    rowBg: theme === "light" ? "bg-gray-50" : "bg-white/5",
  };

  const handleExtend = async () => {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/bookings/${bookingId}/extend`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ additionalHours }),
      });

      const data = await res.json();

      if (data.success) {
        onSuccess(data.data);
      } else {
        setError(data.message || "Failed to extend booking");
        setConfirmed(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setConfirmed(false);
    } finally {
      setLoading(false);
    }
  };

  if (extensionsRemaining <= 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <div
          className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 ${tc.cardBg} ${tc.cardBorder}`}
        >
          <div className="text-center">
            <Icons.AlertTriangle className="w-12 h-12 text-[#FF2F6C] mx-auto mb-4" />
            <h2 className={`text-xl font-bold ${tc.text} mb-2`}>
              Extension Limit Reached
            </h2>
            <p className={`text-sm ${tc.textSecondary} mb-6`}>
              You have used all 3 extensions for this booking. Please make a new
              booking if you need more parking time.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#1B42CB] text-white rounded-xl font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div
        className={`w-full max-w-md max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${tc.cardBg} ${tc.cardBorder}`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#1B42CB]/20 bg-gradient-to-r from-[#1B42CB]/10 to-[#FF2F6C]/10 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1B42CB] to-[#FF2F6C] flex items-center justify-center">
                <Icons.TimerReset className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className={`text-lg font-bold ${tc.text}`}>
                  Extend Parking
                </h2>
                <p className={`text-sm ${tc.textSecondary}`}>{parkingName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${tc.text}`}
            >
              <Icons.X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Expiry warning */}
          {isExpired && (
            <div
              className={`flex items-start gap-3 p-3 rounded-xl border ${
                theme === "light"
                  ? "bg-red-50 border-red-200 text-red-800"
                  : "bg-red-500/10 border-red-500/30 text-red-300"
              }`}
            >
              <Icons.AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="text-xs">
                Your booking has expired. You may still extend it, but please
                ensure you are still parked.
              </p>
            </div>
          )}

          {isExpiringSoon && !isExpired && (
            <div
              className={`flex items-start gap-3 p-3 rounded-xl border ${
                theme === "light"
                  ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                  : "bg-yellow-500/10 border-yellow-500/30 text-yellow-300"
              }`}
            >
              <Icons.Clock className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="text-xs">
                Your booking expires in {minutesUntilExpiry} minutes. Extend
                now to avoid issues.
              </p>
            </div>
          )}

          {/* Current booking info */}
          <div
            className={`rounded-xl p-4 border ${tc.cardBorder} ${tc.rowBg}`}
          >
            <div className="flex justify-between text-sm mb-2">
              <span className={tc.textSecondary}>Current duration</span>
              <span className={`font-semibold ${tc.text}`}>
                {currentDuration}h
              </span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className={tc.textSecondary}>Current expiry</span>
              <span className={`font-semibold ${tc.text}`}>
                {currentExpiry.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className={tc.textSecondary}>Rate</span>
              <span className={`font-semibold ${tc.text}`}>
                ₹{pricePerHour}/hr
              </span>
            </div>
          </div>

          {/* Extensions remaining */}
          <div className="flex items-center gap-2">
            {Array.from({ length: MAX_EXTENSIONS }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full ${
                  i < extensionsUsed
                    ? "bg-[#FF2F6C]"
                    : theme === "light"
                    ? "bg-gray-200"
                    : "bg-white/10"
                }`}
              />
            ))}
            <span className={`text-xs ml-2 ${tc.textMuted}`}>
              {extensionsRemaining} extension{extensionsRemaining !== 1 ? "s" : ""} left
            </span>
          </div>

          {/* Hours selector */}
          <div>
            <label className={`block text-sm font-medium ${tc.text} mb-3`}>
              Additional hours
            </label>
            <div className="flex items-center gap-3 justify-center">
              <button
                onClick={() => setAdditionalHours((h) => Math.max(1, h - 1))}
                disabled={additionalHours <= 1}
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${tc.cardBorder} ${tc.rowBg} disabled:opacity-40`}
              >
                <Icons.Minus className={`w-4 h-4 ${tc.text}`} />
              </button>
              <span className={`text-3xl font-bold w-16 text-center ${tc.text}`}>
                {additionalHours}h
              </span>
              <button
                onClick={() => setAdditionalHours((h) => Math.min(12, h + 1))}
                disabled={additionalHours >= 12}
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${tc.cardBorder} ${tc.rowBg} disabled:opacity-40`}
              >
                <Icons.Plus className={`w-4 h-4 ${tc.text}`} />
              </button>
            </div>
            <div className="flex gap-2 mt-3 justify-center">
              {[1, 2, 3, 4].map((h) => (
                <button
                  key={h}
                  onClick={() => setAdditionalHours(h)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    additionalHours === h
                      ? "bg-[#1B42CB] text-white"
                      : `${tc.rowBg} ${tc.textSecondary} hover:bg-[#1B42CB]/10`
                  }`}
                >
                  +{h}h
                </button>
              ))}
            </div>
          </div>

          {/* New expiry preview */}
          <div
            className={`rounded-xl p-4 border ${
              theme === "light"
                ? "bg-blue-50 border-blue-200"
                : "bg-[#1B42CB]/10 border-[#1B42CB]/30"
            }`}
          >
            <div className="flex justify-between text-sm mb-2">
              <span className={tc.textSecondary}>New total duration</span>
              <span className={`font-bold ${tc.text}`}>
                {newDurationTotal}h
              </span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className={tc.textSecondary}>New expiry</span>
              <span className="font-bold text-[#1B42CB]">
                {newExpiry.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                {newExpiry.toLocaleDateString([], {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
            <div
              className={`border-t ${
                theme === "light" ? "border-blue-200" : "border-[#1B42CB]/20"
              } pt-2 mt-2 flex justify-between text-sm`}
            >
              <span className={`font-semibold ${tc.textSecondary}`}>
                Additional charge
              </span>
              <span className="font-bold text-[#FF2F6C]">
                ₹{additionalCost}
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className={`flex items-center gap-2 p-3 rounded-xl border ${
                theme === "light"
                  ? "bg-red-50 border-red-200 text-red-700"
                  : "bg-red-500/10 border-red-500/30 text-red-300"
              }`}
            >
              <Icons.AlertTriangle className="w-4 h-4 shrink-0" />
              <p className="text-xs">{error}</p>
            </div>
          )}

          {/* Confirm / Extend button */}
          <button
            onClick={handleExtend}
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
              confirmed
                ? "bg-gradient-to-r from-green-600 to-green-500 hover:opacity-90"
                : "bg-gradient-to-r from-[#1B42CB] to-[#FF2F6C] hover:opacity-90"
            } disabled:opacity-50`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing…
              </>
            ) : confirmed ? (
              <>
                <Icons.Check className="w-5 h-5" />
                Confirm — Pay ₹{additionalCost}
              </>
            ) : (
              <>
                <Icons.TimerReset className="w-5 h-5" />
                Extend by {additionalHours}h 
              </>
            )}
          </button>

          {confirmed && !loading && (
            <p className={`text-center text-xs ${tc.textMuted}`}>
              Click again to confirm the extension charge of ₹{additionalCost}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExtendParkingModal;