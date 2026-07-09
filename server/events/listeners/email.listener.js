import eventBus from '../eventBus.js';
import { EVENTS } from '../constants.js';
import { sendPasswordResetEmail, send2FAEmail } from '../../utils/email.js';

// Setup email listeners
export const setupEmailListeners = () => {
  eventBus.on(EVENTS.PASSWORD_RESET_REQUESTED, async ({ email, resetToken } = {}) => {
    try {
      await sendPasswordResetEmail({ to: email, resetToken });
      console.log(`[Email Listener] Sent password reset email to ${email}`);
    } catch (error) {
      console.error('[Email Listener] Failed to send password reset email:', error);
    }
  });

  eventBus.on(EVENTS.TWO_FACTOR_REQUESTED, async ({ email, otp } = {}) => {
    try {
      await send2FAEmail({ to: email, otp });
      console.log(`[Email Listener] Sent 2FA email to ${email}`);
    } catch (error) {
      console.error('[Email Listener] Failed to send 2FA email:', error);
    }
  });

  eventBus.on(EVENTS.USER_REGISTERED, async ({ user } = {}) => {
    try {
      // In the future: await sendWelcomeEmail({ to: user?.email, name: user?.name });
      console.log(`[Email Listener] Welcome email would be sent to ${user?.email || 'unknown'}`);
    } catch (error) {
      console.error('[Email Listener] Failed to send welcome email:', error);
    }
  });

  eventBus.on(EVENTS.BOOKING_CREATED, async ({ booking, user } = {}) => {
    try {
      // In the future: await sendBookingConfirmationEmail({ to: user?.email, booking });
      console.log(`[Email Listener] Booking confirmation email would be sent for booking ${booking?._id || 'unknown'}`);
    } catch (error) {
      console.error('[Email Listener] Failed to send booking confirmation email:', error);
    }
  });
};
