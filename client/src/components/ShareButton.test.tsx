import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ShareButton from './ShareButton';
import { toast } from 'react-hot-toast';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  }
}));

describe('ShareButton', () => {
  const defaultProps = {
    title: 'Test Title',
    text: 'Test Text',
    url: 'https://example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset navigator mocks
    Object.assign(navigator, {
      share: undefined,
      canShare: undefined,
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('renders correctly', () => {
    render(<ShareButton {...defaultProps} />);
    const button = screen.getByRole('button', { name: /share/i });
    expect(button).toBeInTheDocument();
  });

  it('uses navigator.share if available and supported', async () => {
    const mockShare = vi.fn().mockResolvedValue(undefined);
    const mockCanShare = vi.fn().mockReturnValue(true);
    
    Object.assign(navigator, {
      share: mockShare,
      canShare: mockCanShare,
    });

    render(<ShareButton {...defaultProps} />);
    const button = screen.getByRole('button', { name: /share/i });
    
    fireEvent.click(button);
    
    expect(mockCanShare).toHaveBeenCalledWith({
      title: defaultProps.title,
      text: defaultProps.text,
      url: defaultProps.url,
    });
    expect(mockShare).toHaveBeenCalled();
    
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Shared successfully!');
    });
  });

  it('falls back to clipboard if navigator.share is unavailable', async () => {
    render(<ShareButton {...defaultProps} />);
    const button = screen.getByRole('button', { name: /share/i });
    
    fireEvent.click(button);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(defaultProps.url);
    
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Link copied to clipboard!');
    });
  });

  it('shows error toast if fallback clipboard fails', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error('Clipboard error')),
      },
    });

    render(<ShareButton {...defaultProps} />);
    const button = screen.getByRole('button', { name: /share/i });
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to copy link.');
    });
  });
});
