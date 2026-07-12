import eventBus from '../eventBus.js';
import { EVENTS } from '../constants.js';

// Setup logging listeners
export const setupLoggingListeners = () => {
  eventBus.on(EVENTS.USER_REGISTERED, ({ user } = {}) => {
    console.log(`[Audit Log] New user registered: ${user?._id || 'unknown'} (${user?.email || 'unknown'})`);
  });

  eventBus.on(EVENTS.BOOKING_CREATED, ({ booking } = {}) => {
    console.log(`[Audit Log] Booking created: ${booking?._id || 'unknown'} by user ${booking?.userId || 'unknown'}`);
  });

  eventBus.on(EVENTS.BOOKING_CANCELLED, ({ booking } = {}) => {
    console.log(`[Audit Log] Booking cancelled: ${booking?._id || 'unknown'}`);
  });

  eventBus.on(EVENTS.BOOKING_EXTENDED, ({ booking, additionalHours } = {}) => {
    console.log(`[Audit Log] Booking extended: ${booking?._id || 'unknown'} by ${additionalHours || 0} hours`);
  });

  eventBus.on(EVENTS.PARKING_LOT_ADDED, ({ parking } = {}) => {
    console.log(`[Audit Log] Parking lot added: ${parking?._id || 'unknown'}`);
  });
};
