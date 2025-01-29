const { Worker } = require('bullmq');
const aiService = require('../services/aiService');
const logger = require('../utils/logger');
const Recording = require('../models/Recording');

const MAX_RETRIES = 3;
const BACKOFF_DELAY = 1000; // 1 second

const storeProcessingResults = async (result, audioData, jobId, status = 'completed') => {
  try {
    const recording = new Recording({
      transcript: result.transcript || '',
      activities: result.activities || [],
      audioData: audioData,
      processedAt: new Date(),
      status,
      error: result.error
    });
    await recording.save();
    logger.info('Recording stored successfully:', { jobId, status });
    return recording;
  } catch (error) {
    logger.error('Failed to store recording:', { error, jobId });
    throw error;
  }
};

const worker = new Worker('recording-processing', async (job) => {
  const { transcript, audioData } = job.data;
  
  try {
    logger.info('Processing recording:', { jobId: job.id });
    
    // Process transcript with retry logic
    let result;
    let attempts = 0;
    let lastError;

    while (attempts < MAX_RETRIES) {
      try {
        result = await aiService.processTranscript(transcript, job.id, new Date());
        break;
      } catch (error) {
        lastError = error;
        attempts++;
        logger.warn('Transcription attempt failed:', { attempt: attempts, jobId: job.id, error });
        
        if (attempts === MAX_RETRIES) {
          // Store the recording with original transcript on final failure
          result = {
            transcript: transcript,
            activities: [],
            error: lastError.message
          };
          const storedRecording = await storeProcessingResults(result, audioData, job.id, 'failed_transcription');
          return {
            recordingId: storedRecording._id,
            transcript: transcript,
            activities: [],
            status: 'failed_transcription',
            error: lastError.message
          };
        }
        await new Promise(resolve => setTimeout(resolve, BACKOFF_DELAY * attempts));
      }
    }
    
    // Store results in database
    const storedRecording = await storeProcessingResults(result, audioData, job.id);
    
    return {
      recordingId: storedRecording._id,
      transcript: result.transcript,
      activities: result.activities
    };
  } catch (error) {
    logger.error('Recording processing failed:', { 
      error, 
      jobId: job.id 
    });
    throw error;
  }
}, {
  concurrency: 2,
  removeOnComplete: true,
  removeOnFail: false
});

worker.on('completed', (job) => {
  logger.info('Recording processed successfully:', { jobId: job.id });
});

worker.on('failed', (job, error) => {
  logger.error('Recording processing failed:', { 
    jobId: job.id, 
    error 
  });
});

worker.on('error', (error) => {
  logger.error('Worker error:', { error });
});