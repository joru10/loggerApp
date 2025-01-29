import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AudioRecorder from '../AudioRecorder';

describe('AudioRecorder', () => {
  const mockOnRecordingComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Web Speech API
    global.webkitSpeechRecognition = jest.fn().mockImplementation(() => ({
      continuous: true,
      interimResults: true,
      lang: 'en-US',
      start: jest.fn(),
      stop: jest.fn(),
      onresult: jest.fn(),
      onend: jest.fn(),
      onerror: jest.fn(),
    }));
  });

  it('renders start recording button', () => {
    render(<AudioRecorder onRecordingComplete={mockOnRecordingComplete} />);
    expect(screen.getByText('Start Recording')).toBeInTheDocument();
  });

  it('shows error when speech recognition is not supported', async () => {
    delete global.webkitSpeechRecognition;
    render(<AudioRecorder onRecordingComplete={mockOnRecordingComplete} />);
    
    fireEvent.click(screen.getByText('Start Recording'));
    
    await waitFor(() => {
      expect(screen.getByText(/Speech recognition is not supported/)).toBeInTheDocument();
    });
  });
});