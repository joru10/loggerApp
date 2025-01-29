import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

jest.mock('../services/notificationService', () => ({
  checkNotificationPermission: jest.fn().mockResolvedValue(true),
  scheduleNotification: jest.fn(),
  getStoredInterval: jest.fn().mockReturnValue(60)
}));

describe('App Component', () => {
  test('renders main title', () => {
    render(<App />);
    expect(screen.getByText('Audio Logger')).toBeInTheDocument();
  });

  test('shows notification settings', () => {
    render(<App />);
    expect(screen.getByText(/Reminder Interval/i)).toBeInTheDocument();
  });
});