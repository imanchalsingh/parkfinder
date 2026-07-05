import cron from "node-cron";
import Booking from "../models/Booking.js";
import Parking from "../models/Parking.js";

// Export the function so it can be manually run in tests
export const expireBookingsTask = async () => {
  try {
    console.log("⏰ Running cron job: Check for expired bookings...");
    
    // Find active bookings whose expiry time has passed
    const now = new Date();
    const expiredBookings = await Booking.find({
      bookingStatus: "active",
      expiresAt: { $lt: now }
    });
    
    if (expiredBookings.length === 0) {
      console.log("⏰ No expired bookings found.");
      return;
    }
    
    console.log(`⏰ Found ${expiredBookings.length} expired bookings to process.`);
    
    for (const booking of expiredBookings) {
      // Atomically update status to 'expired' only if it's still 'active'.
      // This prevents race conditions with concurrent cancellations or status updates.
      const updatedBooking = await Booking.findOneAndUpdate(
        { _id: booking._id, bookingStatus: "active" },
        { bookingStatus: "expired" },
        { new: true }
      );
      
      if (updatedBooking) {
        // Increment the availableSlots on the parking lot
        await Parking.findOneAndUpdate(
          { _id: booking.parkingId },
          { $inc: { availableSlots: 1 } }
        );
        console.log(`✅ Expired booking: ${booking._id}, restored parking slot for parking: ${booking.parkingId}`);
      }
    }
  } catch (error) {
    console.error("❌ Error in expireBookingsTask cron job:", error);
  }
};

// Only run the cron schedule if we're not running in a test environment
if (process.env.NODE_ENV !== "test") {
  // Schedule to run every 5 minutes
  cron.schedule("*/5 * * * *", expireBookingsTask);
  console.log("⏰ Booking expiry cron scheduler started (runs every 5 minutes).");
}
