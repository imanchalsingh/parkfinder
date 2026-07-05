import Booking from "../models/Booking.js";
import Parking from "../models/Parking.js";

// Get current user's bookings

export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user._id;

    const bookings = await Booking.find({ userId })
      .populate("parkingId")
      .sort({ bookingDate: -1 });

    res.json({
      success: true,
      data: bookings,
    });
  } catch (err) {
    console.error("Error fetching user bookings:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

import { generateBookingReceiptPDF } from "../utils/pdfGenerator.js";
import User from "../models/User.js";

// Download PDF receipt
export const downloadReceipt = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user._id;

    const booking = await Booking.findById(bookingId).populate("parkingId");
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Restrict receipt generation so users can only access their own
    if (booking.userId.toString() !== userId.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to download this receipt" });
    }

    const user = await User.findById(booking.userId);

    // Set headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=Receipt_${booking._id.toString().substring(0, 8)}.pdf`);

    await generateBookingReceiptPDF(booking, user || {}, res);
  } catch (error) {
    console.error("PDF Generation Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Failed to generate PDF receipt" });
    }
  }
};
// Create new booking
export const createBooking = async (req, res) => {
  try {
    const { parkingId, duration } = req.body;
    const userId = req.user._id;

    console.log("📌 Booking request:", { parkingId, duration, userId });

    // Verify parking exists first (for 404 error)
    const parkingExists = await Parking.findById(parkingId);
    if (!parkingExists) {
      return res.status(404).json({
        success: false,
        message: "Parking slot not found",
      });
    }

    // Calculate total price
    const totalPrice = parkingExists.pricePerHour * (duration || 1);

    // Create booking document
    const booking = new Booking({
      userId,
      parkingId,
      duration: duration || 1,
      totalPrice,
      bookingDate: new Date(),
      bookingStatus: "active",
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    });

    // Save booking first
    await booking.save();

    // Atomically decrement parking slots - ensures no race condition
    // Query condition: availableSlots > 0 (only update if slots available)
    // If the parking has no slots, this returns null
    const updatedParking = await Parking.findOneAndUpdate(
      { _id: parkingId, availableSlots: { $gt: 0 } },
      { $inc: { availableSlots: -1 } },
      { new: true },
    );

    // If update failed (no slots available), delete the booking and return error
    if (!updatedParking) {
      await booking.deleteOne();
      console.log("⚠️ Booking rejected - no available slots");
      return res.status(409).json({
        success: false,
        message: "No available slots in this parking",
      });
    }

    // Populate and return booking
    const populatedBooking = await Booking.findById(booking._id).populate(
      "parkingId",
    );

    console.log("✅ Booking created successfully:", booking._id);

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: populatedBooking,
    });
  } catch (err) {
    console.error("❌ Booking creation error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Cancel booking
export const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user._id;

    console.log("📌 Cancel booking:", { bookingId, userId });

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if user owns this booking
    if (booking.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this booking",
      });
    }

    // Update booking status and restore parking slot atomically
    if (booking.bookingStatus === "active") {
      // Atomically increment parking slots
      const updatedParking = await Parking.findOneAndUpdate(
        { _id: booking.parkingId },
        { $inc: { availableSlots: 1 } },
        { new: true },
      );

      if (!updatedParking) {
        return res.status(404).json({
          success: false,
          message: "Parking slot not found",
        });
      }

      console.log("✅ Parking slot restored:", updatedParking._id);
    }

    // Update booking status
    booking.bookingStatus = "cancelled";
    await booking.save();

    console.log("✅ Booking cancelled:", bookingId);

    res.json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (err) {
    console.error("❌ Cancel booking error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ================== ADMIN BOOKINGS ==================

// Get all bookings
export const getAllBookings = async (req, res) => {
  try {
    console.log("📌 Fetching all bookings for admin...");

    // Check if user is admin
    if (req.user.role !== "admin") {
      console.log("❌ Non-admin user trying to access all bookings");
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const bookings = await Booking.find()
      .populate("parkingId")
      .populate("userId", "name email")
      .sort({ bookingDate: -1 });

    console.log(`✅ Found ${bookings.length} bookings`);

    res.json({
      success: true,
      data: bookings,
    });
  } catch (err) {
    console.error("❌ Error fetching all bookings:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Update booking status
export const updateBookingStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // If changing from active to cancelled, atomically restore parking slot
    if (booking.bookingStatus === "active" && status === "cancelled") {
      const updatedParking = await Parking.findOneAndUpdate(
        { _id: booking.parkingId },
        { $inc: { availableSlots: 1 } },
        { new: true },
      );

      if (!updatedParking) {
        return res.status(404).json({
          success: false,
          message: "Parking slot not found",
        });
      }
    }

    booking.bookingStatus = status;
    await booking.save();

    res.json({
      success: true,
      message: "Booking status updated",
    });
  } catch (err) {
    console.error("Error updating booking status:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Delete booking
export const deleteBooking = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Restore parking slot atomically if booking was active
    if (booking.bookingStatus === "active") {
      const updatedParking = await Parking.findOneAndUpdate(
        { _id: booking.parkingId },
        { $inc: { availableSlots: 1 } },
        { new: true },
      );

      if (!updatedParking) {
        return res.status(404).json({
          success: false,
          message: "Parking slot not found",
        });
      }
    }

    await booking.deleteOne();

    res.json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting booking:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Extend booking duration
export const extendBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user._id;
    const { additionalHours } = req.body;

    // Validate input
    if (!additionalHours || additionalHours < 1 || additionalHours > 12) {
      return res.status(400).json({
        success: false,
        message: "Additional hours must be between 1 and 12",
      });
    }

    const booking = await Booking.findById(bookingId).populate("parkingId");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Ownership check
    if (booking.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to extend this booking",
      });
    }

    // Only active bookings can be extended
    if (booking.bookingStatus !== "active") {
      return res.status(400).json({
        success: false,
        message: "Only active bookings can be extended",
      });
    }

    // Limit to max 3 extensions
    if (booking.extensions && booking.extensions.length >= 3) {
      return res.status(400).json({
        success: false,
        message:
          "Maximum of 3 extensions allowed per booking. Please make a new booking.",
      });
    }

    const parking = booking.parkingId;
    const pricePerHour = parking.pricePerHour || 0;
    const additionalCost = pricePerHour * additionalHours;

    // Calculate new expiry from original booking date + total duration
    const totalDurationAfterExtension =
      booking.duration + Number(additionalHours);
    const bookingStart = new Date(booking.bookingDate);
    const newExpiry = new Date(
      bookingStart.getTime() + totalDurationAfterExtension * 60 * 60 * 1000
    );

    // Store original duration on first extension
    if (!booking.originalDuration) {
      booking.originalDuration = booking.duration;
    }

    booking.duration = totalDurationAfterExtension;
    booking.totalPrice = booking.totalPrice + additionalCost;
    booking.expiresAt = newExpiry;
    booking.extensions.push({
      extendedAt: new Date(),
      additionalHours: Number(additionalHours),
      additionalCost,
      newExpiry,
    });

    await booking.save();

    const updated = await Booking.findById(bookingId).populate("parkingId");

    res.json({
      success: true,
      message: `Booking extended by ${additionalHours} hour${additionalHours > 1 ? "s" : ""} successfully`,
      data: {
        bookingId: updated._id,
        newDuration: updated.duration,
        newTotalPrice: updated.totalPrice,
        newExpiry,
        additionalCost,
        extensionsUsed: updated.extensions.length,
        extensionsRemaining: 3 - updated.extensions.length,
      },
    });
  } catch (err) {
    console.error("Extend booking error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};