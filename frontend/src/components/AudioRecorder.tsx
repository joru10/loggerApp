import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress
} from '@mui/material';

interface AudioRecorderProps {
  onRecordingComplete: (data: { audioData: Blob; transcript?: string }) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Only setup recording when user initiates it
    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const setupRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current = recorder;
    } catch (error) {
      console.error('Failed to setup recording:', error);
    }
  };

  const startRecording = async () => {
    try {
      await setupRecording();
      setTranscript('');
      chunksRef.current = [];
      mediaRecorderRef.current?.start(1000);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return;

    try {
      setLoading(true);
      mediaRecorderRef.current.stop();
      
      // Wait for all chunks to be collected
      await new Promise<void>(resolve => {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.onstop = () => {
            console.log('Recording stopped, chunks:', {
              count: chunksRef.current.length,
              totalSize: chunksRef.current.reduce((acc, chunk) => acc + chunk.size, 0)
            });
            resolve();
          };
        }
      });

      const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
      console.log('Created audio blob:', {
        size: audioBlob.size,
        type: audioBlob.type
      });
      
      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current = null;
      
      setIsRecording(false);
      onRecordingComplete({ audioData: audioBlob, transcript });
    } catch (error) {
      console.error('Failed to stop recording:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Audio Logger
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            color={isRecording ? "error" : "primary"}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> :
              isRecording ? 'Stop Recording' : 'Start Recording'}
          </Button>
        </Box>

        <Typography variant="h6" gutterBottom>
          Transcript:
        </Typography>
        <Paper sx={{ p: 2, bgcolor: 'grey.100', minHeight: 100 }}>
          <Typography>
            {transcript || 'Start recording to see transcript...'}
          </Typography>
        </Paper>
      </Paper>
    </Box>
  );
};

export default AudioRecorder;