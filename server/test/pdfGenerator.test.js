import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateBookingReceiptPDF } from '../utils/pdfGenerator';
import PDFDocument from 'pdfkit';

const mockPipe = vi.fn();
const mockFillColor = vi.fn().mockReturnThis();
const mockFontSize = vi.fn().mockReturnThis();
const mockText = vi.fn().mockReturnThis();
const mockMoveDown = vi.fn().mockReturnThis();
const mockStrokeColor = vi.fn().mockReturnThis();
const mockLineWidth = vi.fn().mockReturnThis();
const mockMoveTo = vi.fn().mockReturnThis();
const mockLineTo = vi.fn().mockReturnThis();
const mockStroke = vi.fn().mockReturnThis();
const mockFont = vi.fn().mockReturnThis();
const mockEnd = vi.fn();

vi.mock('pdfkit', () => {
  return {
    default: vi.fn(function() {
      this.pipe = mockPipe;
      this.fillColor = mockFillColor;
      this.fontSize = mockFontSize;
      this.text = mockText;
      this.moveDown = mockMoveDown;
      this.strokeColor = mockStrokeColor;
      this.lineWidth = mockLineWidth;
      this.moveTo = mockMoveTo;
      this.lineTo = mockLineTo;
      this.stroke = mockStroke;
      this.font = mockFont;
      this.end = mockEnd;
      return this;
    }),
  };
});

describe('PDF Generator Utility', () => {
  let mockRes;
  let mockBooking;
  let mockUser;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRes = {
      setHeader: vi.fn(),
    };

    mockBooking = {
      _id: 'booking123',
      bookingDate: new Date('2026-01-01T10:00:00Z'),
      duration: 2,
      bookingStatus: 'completed',
      totalPrice: 100,
      parkingId: {
        name: 'Central Park Spot',
        location: 'Downtown',
        pricePerHour: 50,
      },
    };

    mockUser = {
      name: 'Jane Doe',
      email: 'jane@example.com',
    };
  });

  it('generates a PDF successfully and pipes to response', async () => {
    await expect(generateBookingReceiptPDF(mockBooking, mockUser, mockRes)).resolves.toBeUndefined();

    expect(PDFDocument).toHaveBeenCalledWith({ margin: 50 });
    expect(mockPipe).toHaveBeenCalledWith(mockRes);
    expect(mockText).toHaveBeenCalledWith('booking123', expect.any(Number), expect.any(Number));
    expect(mockText).toHaveBeenCalledWith('Jane Doe', expect.any(Number), expect.any(Number));
    expect(mockEnd).toHaveBeenCalled();
  });

  it('handles missing booking fields gracefully', async () => {
    const incompleteBooking = { _id: 'booking456' };
    const incompleteUser = {};

    await expect(generateBookingReceiptPDF(incompleteBooking, incompleteUser, mockRes)).resolves.toBeUndefined();
    
    expect(mockText).toHaveBeenCalledWith('N/A', expect.any(Number), expect.any(Number));
    expect(mockEnd).toHaveBeenCalled();
  });

  it('rejects if an error is thrown during PDF generation', async () => {
    mockEnd.mockImplementationOnce(() => {
      throw new Error('PDF Generation failed');
    });

    await expect(generateBookingReceiptPDF(mockBooking, mockUser, mockRes)).rejects.toThrow('PDF Generation failed');
  });
});
