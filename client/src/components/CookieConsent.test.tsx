// @vitest-environment jsdom
import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
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

  test('shows after timeout if no consent is in localStorage', () => {
    renderComponent();
    
    act(() => {
      vi.advanceTimersByTime(1100);
    });

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText('Cookie Preferences')).toBeInTheDocument();
  });

  test('does not show if consent is already in localStorage', async () => {
    localStorage.setItem('cookieConsent', 'accepted');
    renderComponent();

    act(() => {
      vi.advanceTimersByTime(1100);
    });
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  test('clicking Accept All sets localStorage and hides banner', () => {
    renderComponent();

    act(() => {
      vi.advanceTimersByTime(1100);
    });

    const acceptButton = screen.getByRole('button', { name: /Accept All/i });
    
    act(() => {
      fireEvent.click(acceptButton);
    });

    expect(localStorage.getItem('cookieConsent')).toBe('accepted');
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  test('clicking Decline Optional sets localStorage and hides banner', () => {
    renderComponent();

    act(() => {
      vi.advanceTimersByTime(1100);
    });

    const declineButton = screen.getByRole('button', { name: /Decline Optional/i });
    
    act(() => {
      fireEvent.click(declineButton);
    });

    expect(localStorage.getItem('cookieConsent')).toBe('declined');
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
});
