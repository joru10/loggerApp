import { apiService } from './api';
import { Activity } from '../types';

// Change to export type for TranscriptionResult
export type TranscriptionResult = {
  transcript: string;
  activities: Activity[];
};

// Define service type for better type checking
type TranscriptionServiceType = {
  init: (onTranscript: (text: string) => void) => void;
  start: () => void;
  stop: () => void;
  transcribeAudio: (audioData: Blob, existingTranscript?: string) => Promise<TranscriptionResult>;
};

class TranscriptionServiceImpl implements TranscriptionServiceType {
  private recognition: any = null;
  private callback: ((text: string) => void) | null = null;
  private isRecording: boolean = false;

  private initRecognition() {
    if (!this.recognition && typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
    }
    return this.recognition;
  }

  init = (onTranscript: (text: string) => void) => {
    this.callback = onTranscript;
    const rec = this.initRecognition();
    
    if (rec) {
      rec.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            currentTranscript = event.results[i][0].transcript;
            this.callback?.(currentTranscript);
          }
        }
      };

      rec.onend = () => {
        if (this.isRecording) {
          setTimeout(() => {
            try {
              rec.start();
            } catch (error) {
              console.error('Failed to restart recognition:', error);
            }
          }, 100);
        }
      };

      rec.onerror = (event: any) => {
        console.error('Recognition error:', event.error);
      };
    }
  };

  start = () => {
    const rec = this.initRecognition();
    if (!rec) {
      throw new Error('Speech recognition not available');
    }
    this.isRecording = true;
    try {
      rec.start();
    } catch (error) {
      this.isRecording = false;
      throw error;
    }
  };

  stop = () => {
    const rec = this.initRecognition();
    if (!rec) {
      throw new Error('Speech recognition not available');
    }
    this.isRecording = false;
    try {
      rec.stop();
    } catch (error) {
      throw error;
    }
  };

  transcribeAudio = async (audioData: Blob, existingTranscript?: string): Promise<TranscriptionResult> => {
    try {
      // Check if Whisper service is available
      try {
        const healthCheck = await apiService.get('/api/whisper/health');
        console.log('Whisper service status:', healthCheck.data);
      } catch (error) {
        console.warn('Whisper service not available:', error);
        throw new Error('Whisper transcription service is not available');
      }

      const timestamp = new Date().toISOString();
      const transcript = existingTranscript || 'No transcript available';
      const formData = new FormData();
      
      const audioBlob = audioData.type === 'audio/webm' 
        ? audioData 
        : new Blob([audioData], { type: 'audio/webm;codecs=opus' });
      
      // First, get the Whisper transcription
      formData.append('audio', audioBlob, 'recording.webm');
      const whisperResponse = await apiService.post('/api/whisper/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      // Then save the recording with the Whisper transcription
      const requestBody = {
        transcript: whisperResponse.data?.text || transcript,
        timestamp,
        activities: []
      };
      
      formData.append('body', JSON.stringify(requestBody));
      const response = await apiService.post('/api/recordings', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      return {
        transcript: response.data?.transcript || whisperResponse.data?.text || transcript,
        activities: response.data?.activities || []
      };
    } catch (error: unknown) {
      console.error('Transcription error:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const instance = new TranscriptionServiceImpl();
console.log('TranscriptionService instance created:', {
  hasInit: typeof instance.init === 'function',
  hasTranscribe: typeof instance.transcribeAudio === 'function'
});

export const transcriptionService = instance;

// Ensure the instance is available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).__transcriptionService = instance;
}
