import { apiService } from './api';
import { Recording } from '../types';

export const saveRecording = async (recording: Partial<Recording>): Promise<Recording> => {
  console.log('Preparing to save recording:', {
    timestamp: recording.timestamp,
    audioSize: recording.audioData?.size,
    audioType: recording.audioData?.type,
    hasActivities: Array.isArray(recording.activities)
  });

  const formData = new FormData();
  formData.append('audio', recording.audioData as Blob);
  formData.append('transcript', recording.transcript || 'No transcript available');
  formData.append('timestamp', recording.timestamp?.toISOString() || new Date().toISOString());
  formData.append('activities', JSON.stringify(recording.activities || []));

  try {
    const response = await apiService.post('/recordings', formData);
    return response.data;
  } catch (error) {
    console.error('Error saving recording:', { error, requestData: recording });
    throw error;
  }
};

export const fetchRecordings = async (): Promise<Recording[]> => {
  const response = await apiService.get('/recordings');
  return response.data;
};