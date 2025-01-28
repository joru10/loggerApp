import React, { useState, useRef, useEffect } from 'react';
import { Box, Button } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';

const AudioRecorder = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isStopping, setIsStopping] = useState(false);
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);
  const recognition = useRef(null);

  // Add a new ref for tracking processed results
  const processedResults = useRef(new Set());

  useEffect(() => {
    if (window.webkitSpeechRecognition) {
      recognition.current = new window.webkitSpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      recognition.current.lang = 'en-US';
      
      recognition.current.onresult = (event) => {
        if (isStopping) return;
        
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal && !processedResults.current.has(i)) {
            processedResults.current.add(i);
            currentTranscript += result[0].transcript + ' ';
          }
        }
        
        if (currentTranscript.trim()) {
          const newTranscript = currentTranscript.trim();
          console.log('Got transcript:', newTranscript);
          setTranscript(prev => {
            const updated = prev ? `${prev} ${newTranscript}` : newTranscript;
            console.log('Updated transcript:', updated);
            return updated;
          });
        }
      };

      recognition.current.onend = () => {
        if (isRecording && !isStopping) {
          console.log('Restarting recognition...');
          try {
            recognition.current.start();
          } catch (error) {
            console.error('Failed to restart recognition:', error);
          }
        }
      };

      recognition.current.onerror = (event) => {
        console.error('Recognition error:', event.error);
      };

      // Cleanup function
      return () => {
        if (recognition.current) {
          recognition.current.onend = null;
          recognition.current.stop();
        }
      };
    }
  }, [isRecording, isStopping]);

  // Remove the useEffect entirely since we're handling recognition in startRecording
  
  const startRecording = async () => {
    try {
      if (!window.webkitSpeechRecognition) {
        throw new Error('Speech recognition not supported');
      }

      // Clean up any existing recognition instance
      if (recognition.current) {
        recognition.current.onend = null;
        recognition.current.stop();
      }

      // Reset states
      setTranscript('');
      chunks.current = [];
      processedResults.current.clear();
      setIsStopping(false);

      // Initialize recognition with all handlers
      recognition.current = new window.webkitSpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      recognition.current.lang = 'en-US';

      recognition.current.onresult = (event) => {
        if (isStopping) return;
        
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal && !processedResults.current.has(i)) {
            processedResults.current.add(i);
            currentTranscript += result[0].transcript + ' ';
          }
        }
        
        if (currentTranscript.trim()) {
          setTranscript(prev => prev ? `${prev} ${currentTranscript.trim()}` : currentTranscript.trim());
        }
      };

      recognition.current.onend = () => {
        if (isRecording && !isStopping) {
          recognition.current.start();
        }
      };

      // Start media recording first
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const newMediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      newMediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.current.push(e.data);
        }
      };

      // Set up recording
      mediaRecorder.current = newMediaRecorder;
      setIsRecording(true);
      newMediaRecorder.start(200);

      // Start recognition last
      await recognition.current.start();

    } catch (error) {
      console.error('Error in startRecording:', error);
      setIsRecording(false);
      if (recognition.current) {
        recognition.current.onend = null;
        recognition.current.stop();
      }
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorder.current || !isRecording) return;

    setIsStopping(true);
    
    try {
      // Stop media recorder first but keep recognition running briefly
      const recorder = mediaRecorder.current;
      const currentChunks = [...chunks.current];

      if (recorder.state === 'recording') {
        recorder.stop();
        recorder.stream.getTracks().forEach(track => track.stop());
      }

      // Wait for any final transcripts with a longer timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const finalTranscript = transcript;
      console.log('Final transcript before processing:', finalTranscript);

      // Now stop recognition
      if (recognition.current) {
        recognition.current.onend = null;
        recognition.current.stop();
      }

      const blob = new Blob(currentChunks, { type: 'audio/webm;codecs=opus' });
      const audioUrl = URL.createObjectURL(blob);
      
      const audioData = await new Promise((resolveReader) => {
        const reader = new FileReader();
        reader.onloadend = () => resolveReader(reader.result);
        reader.readAsDataURL(blob);
      });

      // Only process if we have a transcript
      if (finalTranscript) {
        console.log('Processing recording with transcript:', finalTranscript);
        await onRecordingComplete({
          audioData,
          transcript: finalTranscript,
          url: audioUrl,
          timestamp: new Date().toISOString()
        });
      } else {
        console.log('No transcript available, skipping processing');
      }

      // Clean up
      setIsRecording(false);
      setIsStopping(false);
      chunks.current = [];
      mediaRecorder.current = null;
      setTranscript('');
    } catch (error) {
      console.error('Error in stopRecording:', error);
      setIsRecording(false);
      setIsStopping(false);
    }
  };

  return (
    <Box sx={{ mb: 4, textAlign: 'center' }}>
      <Button
        variant="contained"
        color={isRecording ? "error" : "primary"}
        onClick={async () => {  // Made async
          if (isRecording) {
            await stopRecording();
          } else {
            await startRecording();
          }
        }}
        startIcon={isRecording ? <StopIcon /> : <MicIcon />}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </Button>
      
      {/* Add transcript display */}
      {transcript && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <p>Transcript: {transcript}</p>
        </Box>
      )}
    </Box>
  );
};

export default AudioRecorder;