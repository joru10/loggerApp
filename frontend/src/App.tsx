// Remove logo import
import './App.css';

import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid
} from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers';
import AudioRecorder from './components/AudioRecorder';
import { format } from 'date-fns';
import Reports from './components/Reports';
import { fetchRecordings, saveRecording } from './services/recordingService';
import { Recording } from './types';
// ... other imports ...

// Add type import
import { transcriptionService, type TranscriptionResult } from './services/transcriptionService';

const App: React.FC = () => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [transcriptionInitialized, setTranscriptionInitialized] = useState(false);

  useEffect(() => {
    // Initialize transcription service if available
    const initTranscriptionService = async () => {
      console.log('Checking transcription service...', transcriptionService);
      if (transcriptionService && typeof transcriptionService.init === 'function') {
        console.log('Initializing transcription service...');
        try {
          transcriptionService.init((text) => {
            console.log('Transcription update:', text);
          });
          console.log('Transcription service initialized successfully');
          setTranscriptionInitialized(true);
        } catch (error) {
          console.error('Failed to initialize transcription service:', error);
          setTranscriptionInitialized(false);
        }
      } else {
        console.warn('Transcription service or init method not available:', transcriptionService);
        setTranscriptionInitialized(false);
      }
    };

    initTranscriptionService();
    
    console.log('Initial load effect running');
    const loadRecordings = async () => {
      try {
        const savedRecordings = await fetchRecordings();
        console.log('Fetched recordings:', savedRecordings);
        if (savedRecordings) {
          const processedRecordings = savedRecordings
            .map((rec: any) => ({
              ...rec,
              timestamp: new Date(rec.timestamp)
            }))
            .sort((a: Recording, b: Recording) => 
              b.timestamp.getTime() - a.timestamp.getTime()
            );
          
          console.log('Processed recordings:', processedRecordings);
          setRecordings(processedRecordings);
        }
      } catch (error) {
        console.error('Failed to load recordings:', error);
      }
    };
    
    loadRecordings();
    const refreshInterval = setInterval(loadRecordings, 60000);
    return () => clearInterval(refreshInterval);
  }, []);

  const filteredRecordings = recordings.filter(recording => {
    const recordingDate = recording.timestamp instanceof Date ? recording.timestamp : new Date(recording.timestamp);
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    const recordingDateStr = format(recordingDate, 'yyyy-MM-dd');
    return recordingDateStr === selectedDateStr;
  });

  const handleRecordingComplete = async (recordingData: { audioData: Blob; transcript?: string }) => {
    try {
      const { audioData, transcript } = recordingData;
      console.log('Starting transcription with service:', transcriptionService); // Debug log
      
      if (!transcriptionInitialized) {
        throw new Error('Transcription service is not initialized. Please try again.');
      }
      
      let processedData: TranscriptionResult;
      processedData = await transcriptionService.transcribeAudio(audioData, transcript);
      
      const newRecording = {
        transcript: processedData.transcript || transcript || '',
        timestamp: new Date(),
        activities: processedData.activities || [],
        audioData,
        url: URL.createObjectURL(audioData)
      };
  
      const savedRecording = await saveRecording(newRecording);
      setRecordings(prevRecordings => [savedRecording, ...prevRecordings]);
    } catch (error) {
      console.error('Error processing recording:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
        Audio Logger
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Box sx={{ p: 2, mb: 3 }}>
            <DateCalendar 
              value={selectedDate}
              onChange={(newValue) => newValue && setSelectedDate(newValue)}
            />
          </Box>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <AudioRecorder onRecordingComplete={handleRecordingComplete} />
          <Box sx={{ mt: 4 }}>
            <Reports recordings={filteredRecordings} />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default App;
