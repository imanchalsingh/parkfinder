import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BookingModal from './BookingModal';
import { ThemeProvider } from '../context/ThemeContext';

// Mock contexts and hooks
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ token: 'mock-token' }),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock fetch
global.fetch = vi.fn();

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe('BookingModal', () => {
  const mockSlot = {
    _id: 'slot-1',
    name: 'VIP Spot',
    location: 'Sector 4',
    pricePerHour: 50,
    status: 'available',
    availableSlots: 10,
    capacity: 20,
    rating: 4.5,
    distance: '2km',
  };

  const defaultProps = {
    selectedSlot: mockSlot,
    onClose: vi.fn(),
    onBookingSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing if selectedSlot is null', () => {
    const { container } = renderWithTheme(
      <BookingModal {...defaultProps} selectedSlot={null} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the modal with slot details', () => {
    renderWithTheme(<BookingModal {...defaultProps} />);
    expect(screen.getByText('Confirm Booking')).toBeInTheDocument();
    expect(screen.getByText('VIP Spot')).toBeInTheDocument();
    expect(screen.getByText('Sector 4')).toBeInTheDocument();
    expect(screen.getAllByText('₹50').length).toBeGreaterThan(0); // price per hour
  });

  it('calculates the total price correctly based on duration', () => {
    renderWithTheme(<BookingModal {...defaultProps} />);
    
    // Default duration is 1 hour
    expect(screen.getByText('₹50', { selector: '.text-2xl' })).toBeInTheDocument();

    // Click on 3h
    fireEvent.click(screen.getByRole('button', { name: '3h' }));
    
    // Price should now be 150
    expect(screen.getByText('₹150', { selector: '.text-2xl' })).toBeInTheDocument();
  });

  it('calls onClose when close button or cancel is clicked', () => {
    renderWithTheme(<BookingModal {...defaultProps} />);
    
    const closeButtons = screen.getAllByRole('button', { name: /(close|cancel)/i });
    fireEvent.click(closeButtons[0]);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('handles booking submission', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({ success: true }),
    });

    renderWithTheme(<BookingModal {...defaultProps} />);
    
    // Change duration to 2h
    fireEvent.click(screen.getByRole('button', { name: '2h' }));

    const payButton = screen.getByRole('button', { name: /Pay ₹100/i });
    fireEvent.click(payButton);

    expect(global.fetch).toHaveBeenCalledWith('/api/bookings/book', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        parkingId: mockSlot._id,
        duration: 2,
        totalPrice: 100,
      }),
    }));
  });
});
