// @vitest-environment jsdom
import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CookieConsent from './CookieConsent';

describe('CookieConsent Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <CookieConsent />
      </BrowserRouter>
    );
  };

  test('does not show immediately (waits for timeout)', () => {
    renderComponent();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  test('shows after timeout if no consent is in localStorage', async () => {
    renderComponent();
    
    vi.advanceTimersByTime(1100);

    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    expect(screen.getByText('Cookie Preferences')).toBeInTheDocument();
  });

  test('does not show if consent is already in localStorage', async () => {
    localStorage.setItem('cookieConsent', 'accepted');
    renderComponent();

    vi.advanceTimersByTime(1100);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  test('clicking Accept All sets localStorage and hides banner', async () => {
    renderComponent();

    vi.advanceTimersByTime(1100);

    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    const acceptButton = screen.getByRole('button', { name: /Accept All/i });
    fireEvent.click(acceptButton);

    expect(localStorage.getItem('cookieConsent')).toBe('accepted');
    
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
  });

  test('clicking Decline Optional sets localStorage and hides banner', async () => {
    renderComponent();

    vi.advanceTimersByTime(1100);

    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    const declineButton = screen.getByRole('button', { name: /Decline Optional/i });
    fireEvent.click(declineButton);

    expect(localStorage.getItem('cookieConsent')).toBe('declined');
    
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
  });
});
