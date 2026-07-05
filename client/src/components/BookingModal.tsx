import * as React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import type { ParkingSlot } from "../hooks/useParkingSlots";
import { useAuth } from "../context/AuthContext";
import { useThemeClasses } from "../hooks/useThemeClasses";
import { toast } from "react-hot-toast";

interface BookingModalProps {
  selectedSlot: ParkingSlot | null;
  onClose: () => void;
  onBookingSuccess: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  selectedSlot,
  onClose,
  onBookingSuccess,
}) => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const themeClasses = useThemeClasses();
  const [duration, setDuration] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!selectedSlot) return null;

  const paymentAmount = selectedSlot.pricePerHour * duration;

  const handleConfirmBooking = async () => {
    if (!token) return;
    setIsSubmitting(true);
    try {
      const totalPrice = selectedSlot.pricePerHour * duration;
      const res = await fetch(`/api/bookings/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          parkingId: selectedSlot._id,
          duration: duration,
          totalPrice: totalPrice,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Booking successful!");
        onBookingSuccess();
        onClose();
        navigate("/bookings");
      } else {
        toast.error(`${data.message || "Booking failed"}`);
      }
    } catch (err) {
      console.error("Booking error:", err);
      toast.error("Failed to book slot. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDurationChange = (hours: number) => {
    setDuration(hours);
  };

  return (
    <div
      id="booking-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div
        className={`backdrop-blur-xl ${themeClasses.cardBgSecondary} ${themeClasses.cardBorder} border rounded-2xl w-full max-w-md shadow-2xl shadow-[#1B42CB]/10 animate-scale-in`}
      >
        {/* Modal Header */}
        <div className={`p-6 border-b ${themeClasses.border}`}>
          <div className="flex items-center justify-between">
            <h2
              id="modal-title"
              className={`text-2xl font-bold bg-gradient-to-r ${themeClasses.gradient.accent} bg-clip-text text-transparent`}
            >
              Confirm Booking
            </h2>
            <button
              onClick={onClose}
              aria-label="Close modal"
              disabled={isSubmitting}
              className={`w-8 h-8 rounded-lg ${themeClasses.cardBg} border ${themeClasses.border} flex items-center justify-center ${themeClasses.text} ${themeClasses.hover} transition-colors`}
            >
              <Icons.X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className={`flex items-center justify-between p-4 bg-[#1B42CB]/10 rounded-xl`}>
              <div>
                <div className={`text-sm ${themeClasses.textSecondary}`}>Parking Slot</div>
                <div className={`font-bold ${themeClasses.text}`}>{selectedSlot.name}</div>
              </div>
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${themeClasses.gradient.accent} flex items-center justify-center`}
              >
                <Icons.Car className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-3 ${themeClasses.cardBg} rounded-lg`}>
                <div className={`text-sm ${themeClasses.textSecondary}`}>Location</div>
                <div className={`font-medium ${themeClasses.text} truncate`}>
                  {selectedSlot.location}
                </div>
              </div>
              <div className={`p-3 ${themeClasses.cardBg} rounded-lg`}>
                <div className={`text-sm ${themeClasses.textSecondary}`}>Price/Hour</div>
                <div className={`font-medium ${themeClasses.text}`}>₹{selectedSlot.pricePerHour}</div>
              </div>
            </div>
          </div>

          {/* Select Duration */}
          <div>
            <h3 className={`text-lg font-semibold ${themeClasses.text} mb-3`}>Select Duration</h3>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4, 6, 8, 12, 24].map((hour) => (
                <button
                  key={hour}
                  onClick={() => handleDurationChange(hour)}
                  disabled={isSubmitting}
                  className={`py-2 rounded-lg font-medium transition-all ${
                    duration === hour
                      ? "bg-gradient-to-r from-[#1B42CB] to-[#FF2F6C] text-white shadow-md shadow-pink-500/20"
                      : `${themeClasses.cardBg} ${themeClasses.text} ${themeClasses.hover}`
                  }`}
                >
                  {hour}h
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Calculation Sheet */}
          <div className={`${themeClasses.cardBg} rounded-xl p-4`}>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className={themeClasses.textSecondary}>Price per hour</span>
                <span className={themeClasses.text}>₹{selectedSlot.pricePerHour}</span>
              </div>
              <div className="flex justify-between">
                <span className={themeClasses.textSecondary}>Duration</span>
                <span className={themeClasses.text}>
                  {duration} hour{duration !== 1 ? "s" : ""}
                </span>
              </div>
              <div className={`border-t ${themeClasses.border} pt-3 flex justify-between`}>
                <span className={`text-lg font-semibold ${themeClasses.text}`}>Total Amount</span>
                <span className={`text-2xl font-bold ${themeClasses.text}`}>
                  ₹{selectedSlot.pricePerHour * duration}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method Option */}
          <div className="space-y-2">
            <h3 className={`text-lg font-semibold ${themeClasses.text}`}>Payment Method</h3>
            <div className="space-y-2">
              <div className={`flex items-center gap-3 p-3 ${themeClasses.cardBg} rounded-lg`}>
                <input
                  type="radio"
                  id="upi"
                  name="payment"
                  defaultChecked
                  disabled={isSubmitting}
                  className="w-5 h-5 cursor-pointer accent-[#1B42CB]"
                />
                <label htmlFor="upi" className={`flex-1 ${themeClasses.text} cursor-pointer`}>
                  UPI / QR Code
                </label>
              </div>
              <div className={`flex items-center gap-3 p-3 ${themeClasses.cardBg} rounded-lg`}>
                <input
                  type="radio"
                  id="card"
                  name="payment"
                  disabled={isSubmitting}
                  className="w-5 h-5 cursor-pointer accent-[#1B42CB]"
                />
                <label htmlFor="card" className={`flex-1 ${themeClasses.text} cursor-pointer`}>
                  Credit/Debit Card
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className={`flex-1 px-6 py-3 ${themeClasses.cardBg} ${themeClasses.text} font-semibold rounded-lg ${themeClasses.hover} transition-colors disabled:opacity-50`}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmBooking}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#1B42CB] to-[#FF2F6C] text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-[#FF2F6C]/20 flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  <span>Pay ₹{paymentAmount}</span>
                  <Icons.ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className={`text-center pt-4 border-t ${themeClasses.border}`}>
            <div className={`flex items-center justify-center gap-2 text-sm ${themeClasses.textSecondary}`}>
              <Icons.Lock className="w-4 h-4" />
              <span>Secure payment • Instant confirmation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
