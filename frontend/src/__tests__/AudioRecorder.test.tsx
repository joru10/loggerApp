import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AudioRecorder from '../components/AudioRecorder';

describe('AudioRecorder Component', () => {
  const mockOnRecordingComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders start recording button', () => {
    render(<AudioRecorder onRecordingComplete={mockOnRecordingComplete} />);
    expect(screen.getByText('Start Recording')).toBeInTheDocument();
  });

  test('shows transcript placeholder when not recording', () => {
    render(<AudioRecorder onRecordingComplete={mockOnRecordingComplete} />);
    expect(screen.getByText('Start recording to see transcript...')).toBeInTheDocument();
  });
});