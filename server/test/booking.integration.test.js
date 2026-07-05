import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../server.js';
import Parking from '../models/Parking.js';
import Booking from '../models/Booking.js';

describe('Booking Endpoints Integration Tests', () => {
  let userToken;
  let adminToken;
  let parkingId;
  let bookingId;

  beforeEach(async () => {
    // Register user and admin
    const userRes = await request(app).post('/api/auth/signup').send({
      name: 'Booking User', email: 'bookinguser@example.com', password: 'password123', role: 'user'
    });
    userToken = userRes.body.token;

    const adminRes = await request(app).post('/api/auth/signup').send({
      name: 'Booking Admin', email: 'bookingadmin@example.com', password: 'password123', role: 'admin', adminSecret: 'test_admin_secret'
    });
    adminToken = adminRes.body.token;

    // Create a parking slot as admin
    const slotRes = await request(app)
      .post('/api/admin/slots')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Parking',
        location: 'Downtown',
        pricePerHour: 10,
        capacity: 50,
        availableSlots: 5
      });
    
    parkingId = slotRes.body.data._id;
  });

  describe('POST /api/bookings/book', () => {
    it('should successfully create a new booking', async () => {
      const response = await request(app)
        .post('/api/bookings/book')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          parkingId: parkingId,
          duration: 2
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalPrice).toBe(20);
      expect(response.body.data.bookingStatus).toBe('active');
      bookingId = response.body.data._id;
    });

    it('should fail booking for non-existent parking', async () => {
      const response = await request(app)
        .post('/api/bookings/book')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          parkingId: '000000000000000000000000',
          duration: 2
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Parking slot not found');
    });

    it('should fail validation with invalid parking ID format', async () => {
      const response = await request(app)
        .post('/api/bookings/book')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          parkingId: 'invalid-id',
          duration: 2
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('GET /api/bookings/my-bookings', () => {
    it('should fetch current user bookings', async () => {
      // Create a booking first
      const bookRes = await request(app)
        .post('/api/bookings/book')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ parkingId: parkingId, duration: 1 });
      const newBookingId = bookRes.body.data._id;

      const response = await request(app)
        .get('/api/bookings/my-bookings')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]._id).toBe(newBookingId);
    });
  });

  describe('GET /api/bookings/all', () => {
    it('should fetch all bookings as admin', async () => {
      // Create a booking first
      await request(app)
        .post('/api/bookings/book')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ parkingId: parkingId, duration: 1 });

      const response = await request(app)
        .get('/api/bookings/all')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should deny non-admin access to all bookings', async () => {
      const response = await request(app)
        .get('/api/bookings/all')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/bookings/:id/status', () => {
    it('should update booking status as admin', async () => {
      // Create a booking first
      const bookRes = await request(app)
        .post('/api/bookings/book')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ parkingId: parkingId, duration: 1 });
      const newBookingId = bookRes.body.data._id;

      const response = await request(app)
        .put(`/api/bookings/${newBookingId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'completed' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      const updatedBooking = await Booking.findById(newBookingId);
      expect(updatedBooking.bookingStatus).toBe('completed');
    });

    it('should fail with invalid status value', async () => {
      // Create a booking first
      const bookRes = await request(app)
        .post('/api/bookings/book')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ parkingId: parkingId, duration: 1 });
      const newBookingId = bookRes.body.data._id;

      const response = await request(app)
        .put(`/api/bookings/${newBookingId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'invalid-status' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('DELETE /api/bookings/cancel/:id', () => {
    it('should allow user to cancel their own active booking', async () => {
      // First create a new active booking
      const bookRes = await request(app)
        .post('/api/bookings/book')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ parkingId: parkingId, duration: 1 });
      const newBookingId = bookRes.body.data._id;

      const response = await request(app)
        .delete(`/api/bookings/cancel/${newBookingId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      const updatedBooking = await Booking.findById(newBookingId);
      expect(updatedBooking.bookingStatus).toBe('cancelled');
    });

    it('should deny user cancelling someone else\'s booking', async () => {
      // Create a booking first for User 1
      const bookRes = await request(app)
        .post('/api/bookings/book')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ parkingId: parkingId, duration: 1 });
      const user1BookingId = bookRes.body.data._id;

      // Create second user
      const user2Res = await request(app).post('/api/auth/signup').send({
        name: 'User 2', email: 'user2@example.com', password: 'password123'
      });
      const user2Token = user2Res.body.token;

      // User 2 tries to cancel User 1's booking
      const response = await request(app)
        .delete(`/api/bookings/cancel/${user1BookingId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Not authorized to cancel this booking');
    });
  });

  describe('Booking Expiry Cron Job', () => {
    it('should automatically expire active bookings in the past and restore parking slot', async () => {
      // Create a booking
      const bookRes = await request(app)
        .post('/api/bookings/book')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ parkingId: parkingId, duration: 1 });
      
      expect(bookRes.status).toBe(201);
      const newBookingId = bookRes.body.data._id;
      
      // Get the initial available slots
      const initialParking = await Parking.findById(parkingId);
      const initialSlots = initialParking.availableSlots;

      // Manipulate expiresAt to be in the past
      await Booking.findByIdAndUpdate(newBookingId, {
        expiresAt: new Date(Date.now() - 1000) // 1 second ago
      });

      // Manually trigger the cron task function
      const { expireBookingsTask } = await import('../jobs/bookingExpiry.js');
      await expireBookingsTask();

      // Check if booking status is updated to expired
      const updatedBooking = await Booking.findById(newBookingId);
      expect(updatedBooking.bookingStatus).toBe('expired');

      // Check if parking slots are restored
      const updatedParking = await Parking.findById(parkingId);
      expect(updatedParking.availableSlots).toBe(initialSlots + 1);
    });
  });
});
