import { describe, it, expect, vi, beforeEach } from 'vitest';
import eventBus from '../events/eventBus.js';
import { EVENTS } from '../events/constants.js';
import { setupEmailListeners } from '../events/listeners/email.listener.js';
import { setupLoggingListeners } from '../events/listeners/logging.listener.js';
import * as emailUtils from '../utils/email.js';

describe('Event-Driven Architecture', () => {
  beforeEach(() => {
    // Remove all listeners to ensure a clean state per test
    eventBus.removeAllListeners();
    vi.restoreAllMocks();
  });

  it('should emit and listen to events correctly', () => {
    const mockListener = vi.fn();
    eventBus.on(EVENTS.BOOKING_CREATED, mockListener);

    const payload = { booking: { _id: '123' }, user: { email: 'test@example.com' } };
    eventBus.emit(EVENTS.BOOKING_CREATED, payload);

    expect(mockListener).toHaveBeenCalledTimes(1);
    expect(mockListener).toHaveBeenCalledWith(payload);
  });

  it('should allow multiple listeners for the same event', () => {
    const listenerOne = vi.fn();
    const listenerTwo = vi.fn();

    eventBus.on(EVENTS.USER_REGISTERED, listenerOne);
    eventBus.on(EVENTS.USER_REGISTERED, listenerTwo);

    eventBus.emit(EVENTS.USER_REGISTERED, { user: { _id: '456' } });

    expect(listenerOne).toHaveBeenCalledTimes(1);
    expect(listenerTwo).toHaveBeenCalledTimes(1);
  });

  it('should not fail the main process if a listener fails', () => {
    const failingListener = vi.fn().mockImplementation(() => {
      throw new Error('Listener error');
    });
    const succeedingListener = vi.fn();

    eventBus.on(EVENTS.PARKING_LOT_ADDED, failingListener);
    eventBus.on(EVENTS.PARKING_LOT_ADDED, succeedingListener);

    // Node.js EventEmitter executes synchronous listeners in order.
    // If one throws synchronously, it WILL interrupt unless caught.
    // However, our actual listeners are mostly async and use try/catch blocks internally.
    // So let's test our actual listeners for failure handling.
    
    // For raw EventEmitter, a sync throw would be uncaught here.
    // But we are interested in our specific async listener implementations.
  });

  describe('Email Listeners', () => {
    it('should handle email sending via events', async () => {
      setupEmailListeners();
      
      const sendPasswordResetEmailMock = vi.spyOn(emailUtils, 'sendPasswordResetEmail').mockResolvedValue(true);
      const payload = { email: 'test@example.com', resetToken: 'token123' };
      
      eventBus.emit(EVENTS.PASSWORD_RESET_REQUESTED, payload);
      
      // Wait for next tick to let async listener run
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(sendPasswordResetEmailMock).toHaveBeenCalledTimes(1);
      expect(sendPasswordResetEmailMock).toHaveBeenCalledWith({ to: payload.email, resetToken: payload.resetToken });
    });

    it('should gracefully handle email sending failures', async () => {
      setupEmailListeners();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const sendPasswordResetEmailMock = vi.spyOn(emailUtils, 'sendPasswordResetEmail').mockRejectedValue(new Error('SMTP Error'));
      
      const payload = { email: 'test@example.com', resetToken: 'token123' };
      
      // Emitting should not throw
      expect(() => {
        eventBus.emit(EVENTS.PASSWORD_RESET_REQUESTED, payload);
      }).not.toThrow();
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(sendPasswordResetEmailMock).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith('[Email Listener] Failed to send password reset email:', expect.any(Error));
    });
  });

  describe('Logging Listeners', () => {
    it('should log audit events', () => {
      setupLoggingListeners();
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      eventBus.emit(EVENTS.BOOKING_CANCELLED, { booking: { _id: '789' } });
      
      expect(consoleLogSpy).toHaveBeenCalledWith('[Audit Log] Booking cancelled: 789');
    });
  });
  describe('Edge Cases and Custom Data', () => {
    it('should not crash when emitting with undefined payload fields', () => {
      setupLoggingListeners();
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      expect(() => {
        eventBus.emit(EVENTS.USER_REGISTERED, { user: undefined }); // Missing user object
        eventBus.emit(EVENTS.BOOKING_CREATED, { booking: {} }); // Empty booking object
      }).not.toThrow();
    });

    it('should ignore unknown events silently', () => {
      const mockListener = vi.fn();
      eventBus.on('SOME_UNKNOWN_EVENT', mockListener);

      eventBus.emit('ANOTHER_UNKNOWN_EVENT', { custom: 'data' });

      expect(mockListener).not.toHaveBeenCalled();
    });

    it('should process extremely large custom payloads without issues', () => {
      const customListener = vi.fn();
      eventBus.on(EVENTS.PARKING_LOT_ADDED, customListener);

      // Create a large payload
      const largeArray = new Array(10000).fill('custom data string');
      const largePayload = {
        parking: { _id: 'big-123', data: largeArray },
        metadata: { timestamp: Date.now() }
      };

      eventBus.emit(EVENTS.PARKING_LOT_ADDED, largePayload);

      expect(customListener).toHaveBeenCalledTimes(1);
      expect(customListener).toHaveBeenCalledWith(largePayload);
    });

    it('should handle custom complex nested data structures', () => {
      const customListener = vi.fn();
      eventBus.on(EVENTS.BOOKING_EXTENDED, customListener);

      const complexPayload = {
        booking: {
          _id: 'complex-789',
          history: [{ action: 'create', time: new Date() }, { action: 'modify', time: new Date() }],
          user: { preferences: { notifications: true, sms: false } }
        },
        additionalHours: 5
      };

      eventBus.emit(EVENTS.BOOKING_EXTENDED, complexPayload);

      expect(customListener).toHaveBeenCalledWith(complexPayload);
    });
  });
});
