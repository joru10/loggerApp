import express from 'express';
import mongoose from 'mongoose';
import { processRecording } from '../services/transcriptionService.js';

const router = express.Router();

// Define Recording Schema
const recordingSchema = new mongoose.Schema({
  url: String,
  audioData: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  transcript: {
    type: String,
    default: ''  // Ensure transcript is always at least an empty string
  },
  activities: {
    type: [Object],  // Array of activity objects
    default: []
  },
  processed: {
    type: Boolean,
    default: false
  }
});

const Recording = mongoose.model('Recording', recordingSchema);

// Update your POST route to include transcript and activities
router.post('/', async (req, res) => {
  try {
    console.log('Received recording request with transcript:', req.body.transcript);
    
    const { url, audioData, timestamp, transcript, activities, processed } = req.body;
    
    // Log the incoming data for debugging
    console.log('Incoming data:', {
      hasTranscript: !!transcript,
      transcriptContent: transcript,
      hasActivities: Array.isArray(activities)
    });
    
    const recording = new Recording({
      url,
      audioData,
      timestamp,
      transcript: transcript || '',
      activities: activities || [],
      processed: false
    });
    
    const savedRecording = await recording.save();
    console.log('Initial save successful with transcript:', savedRecording.transcript);
    
    // Modified condition to better handle transcript
    if (transcript && transcript.length > 0 && transcript !== 'No transcript available') {
      try {
        console.log('Starting LLM processing with transcript:', transcript);
        const processedData = await processRecording(audioData, transcript);
        console.log('Processing completed:', processedData);
        
        // Update the recording with processed data
        savedRecording.transcript = transcript;
        savedRecording.activities = processedData.activities || [];
        savedRecording.processed = true;
        
        const updatedRecording = await savedRecording.save();
        console.log('Recording updated with processed data:', {
          id: updatedRecording._id,
          transcript: updatedRecording.transcript,
          activitiesCount: updatedRecording.activities.length
        });
        
        return res.status(201).json(updatedRecording);
      } catch (error) {
        console.error('Processing failed:', error);
        return res.status(201).json(savedRecording);
      }
    }

    res.status(201).json(savedRecording);
  } catch (error) {
    console.error('Error saving recording:', error);
    res.status(400).json({ error: error.message });
  }
});

// GET all recordings
router.get('/', async (req, res) => {
  try {
    const recordings = await Recording.find().sort({ timestamp: -1 });
    console.log(`Found ${recordings.length} recordings in MongoDB`);
    res.json(recordings);
  } catch (error) {
    console.error('Error fetching recordings:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;