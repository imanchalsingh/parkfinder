import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    parkingId: z.string().min(24).max(24, 'Invalid parking ID format'),
    duration: z.number().min(1, 'Duration must be at least 1 hour').optional(),
  }),
});

export const updateBookingStatusSchema = z.object({
  body: z.object({
    status: z.enum(['active', 'cancelled', 'completed', 'expired'], {
      errorMap: () => ({ message: 'Status must be active, cancelled, completed, or expired' })
    }),
  }),
  params: z.object({
    id: z.string().min(24).max(24, 'Invalid booking ID format'),
  }),
});

export const cancelBookingSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24, 'Invalid booking ID format'),
  }),
});
