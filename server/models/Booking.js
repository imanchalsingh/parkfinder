import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  parkingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Parking",
    required: true,
  },
  bookingDate: {
    type: Date,
    default: Date.now,
  },
  duration: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  bookingStatus: {
    type: String,
    enum: ["active", "cancelled", "completed", "expired"],
    default: "active",
  },
  expiresAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Booking", bookingSchema);