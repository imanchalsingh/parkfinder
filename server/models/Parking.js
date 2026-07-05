import mongoose from "mongoose";
const parkingSchema = new mongoose.Schema(
  {
    name: String,
    description: { type: String, default: "" },
    location: String,
    description: { type: String, default: "" },
    pricePerHour: Number,
    status: String,
    distance: String,
    capacity: Number,
    availableSlots: Number,
    isCovered: Boolean,
    securityLevel: String,
    rating: Number,
    openingTime: String,
    closingTime: String,
    images: { type: [String], default: [] },
    emergencyContact: {
      phone: String,
      supportEmail: String,
      managerName: String,
    },
    isEVChargingStation: {
      type: Boolean,
      default: false,
      index: true, // Adding an index improves query performance when filtering
    },
    chargerType: {
      type: String,
      enum: ["Type 1", "Type 2", "CCS", "CHAdeMO", "None"],
      default: "None",
    },
    floors: [
      {
        floorNumber: { type: Number, required: true },
        floorName: { type: String, default: "" },
        totalSlots: { type: Number, default: 0 },
        availableSlots: { type: Number, default: 0 },
        isCovered: { type: Boolean, default: false },
        slotRows: [
          {
            row: { type: String },
            slots: [
              {
                slotId: { type: String },
                isOccupied: { type: Boolean, default: false },
                isReserved: { type: Boolean, default: false },
                vehicleType: {
                  type: String,
                  enum: ["car", "bike", "ev", "disabled", "any"],
                  default: "any",
                },
              },
            ],
          },
        ],
      },
    ],
  },
);
export default mongoose.model("Parking", parkingSchema);
