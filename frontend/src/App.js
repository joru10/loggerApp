import logo from './logo.svg';
import './App.css';

import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import AudioRecorder from './components/AudioRecorder';
import { checkNotificationPermission, scheduleNotification, getStoredInterval } from './services/notificationService';
import { Grid } from '@mui/material';
import Calendar from './components/Calendar';
import { format } from 'date-fns';
import Reports from './components/Reports';

// Add to imports
import { transcribeAudio } from './services/transcriptionService';
import { saveRecording, fetchRecordings } from './services/recordingService';
// Remove this line
// import { processRecording } from './services/recordingService';

// Add correct import
import { transcribeAudio as processRecording } from './services/transcriptionService';

function App() {
  const [recordings, setRecordings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationInterval, setNotificationInterval] = useState(() => {
    const stored = getStoredInterval();
    return stored && [15, 30, 60, 120, 240, 480].includes(stored) ? stored : 60;
  });

  useEffect(() => {
    const setupNotifications = async () => {
      const hasPermission = await checkNotificationPermission();
      if (hasPermission) {
        setNotificationsEnabled(true);
        scheduleNotification(notificationInterval);
      }
    };
    setupNotifications();
  }, [notificationInterval]);

  const handleIntervalChange = (event) => {
    const newInterval = event.target.value;
    setNotificationInterval(newInterval);
    scheduleNotification(newInterval);
  };

  // Add useEffect to load recordings on mount
  // Remove the duplicate useEffect and handleRecordingComplete
    useEffect(() => {
      const loadRecordings = async () => {
        try {
          const savedRecordings = await fetchRecordings();
          // Ensure proper date conversion and sorting
          const processedRecordings = savedRecordings
            .map(rec => ({
              ...rec,
              timestamp: new Date(rec.timestamp)
            }))
            .sort((a, b) => b.timestamp - a.timestamp); // Sort by newest first
          
          console.log('Loaded recordings:', processedRecordings);
          setRecordings(processedRecordings);
        } catch (error) {
          console.error('Failed to load recordings:', error);
        }
      };
      
      // Load recordings immediately and set up periodic refresh
      loadRecordings();
      
      // Optional: Refresh recordings periodically
      const refreshInterval = setInterval(loadRecordings, 60000); // Refresh every minute
      
      return () => clearInterval(refreshInterval);
    }, []);

    // Remove the localStorage useEffect and handleRecordingComplete
    // Keep only this version
    const handleRecordingComplete = async (recordingData) => {
      try {
        const { audioData, transcript } = recordingData;
        console.log('Received recording data:', { 
          hasAudio: !!audioData, 
          transcript: transcript,
          type: typeof transcript
        });
      
        // Process recording with transcript
        const processedData = await processRecording(audioData, transcript);
        console.log('Processed recording data:', processedData);
        
        // Save recording with transcript and activities
        const savedRecording = await saveRecording({
          url: audioData,
          audioData: audioData,
          timestamp: new Date().toISOString(),
          transcript: transcript || processedData.transcript, // Try both sources
          activities: processedData.activities,
          processed: true
        });
      
        console.log('Saved recording:', savedRecording);
        
        // Update recordings immediately
        setRecordings(prevRecordings => {
          const newRecordings = [savedRecording, ...prevRecordings];
          console.log('Updated recordings:', newRecordings);
          return newRecordings;
        });
      } catch (error) {
        console.error('Error processing recording:', error);
      }
    };

  const filteredRecordings = recordings.filter(recording => {
    const recordingDate = recording.timestamp instanceof Date ? recording.timestamp : new Date(recording.timestamp);
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    const recordingDateStr = format(recordingDate, 'yyyy-MM-dd');
    return recordingDateStr === selectedDateStr;
  });

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
        Audio Logger
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Calendar 
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
          
          <Box sx={{ mb: 3 }}>
            {!notificationsEnabled ? (
              <>
                <Typography color="warning.main" gutterBottom>
                  Enable notifications to get recording reminders
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={() => checkNotificationPermission()}
                >
                  Enable Notifications
                </Button>
              </>
            ) : (
              <FormControl fullWidth>
                <InputLabel>Reminder Interval</InputLabel>
                <Select
                  value={notificationInterval}
                  label="Reminder Interval"
                  onChange={handleIntervalChange}
                >
                  <MenuItem value={15}>Every 15 minutes</MenuItem>
                  <MenuItem value={30}>Every 30 minutes</MenuItem>
                  <MenuItem value={60}>Every hour</MenuItem>
                  <MenuItem value={120}>Every 2 hours</MenuItem>
                  <MenuItem value={240}>Every 4 hours</MenuItem>
                  <MenuItem value={480}>Every 8 hours</MenuItem>
                </Select>
              </FormControl>
            )}
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
}

export default App;
