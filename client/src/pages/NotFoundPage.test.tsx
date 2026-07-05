// @vitest-environment jsdom
import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NotFoundPage from './NotFoundPage';

describe('NotFoundPage Component', () => {
  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <NotFoundPage />
      </BrowserRouter>
    );
  };

  test('renders the 404 text and message', () => {
    renderComponent();
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Oops! You seem to be lost.')).toBeInTheDocument();
    expect(
      screen.getByText("We've searched everywhere, but the page you're looking for doesn't exist or has been moved.")
    ).toBeInTheDocument();
  });

  test('renders Go Back and Return Home buttons', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: /Go Back/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Return Home/i })).toBeInTheDocument();
  });

  test('renders helpful links', () => {
    renderComponent();
    expect(screen.getByText('Helpful Links')).toBeInTheDocument();
    
    const parkingSlotsLink = screen.getByRole('link', { name: /Parking Slots Find a spot/i });
    expect(parkingSlotsLink).toHaveAttribute('href', '/parkingslots');

    const bookingsLink = screen.getByRole('link', { name: /Bookings Your reservations/i });
    expect(bookingsLink).toHaveAttribute('href', '/bookings');

    const privacyLink = screen.getByRole('link', { name: /Privacy Policy Data usage/i });
    expect(privacyLink).toHaveAttribute('href', '/privacy');
  });
});
