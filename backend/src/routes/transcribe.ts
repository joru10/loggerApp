import express from 'express';
import multer from 'multer';
import TranscriptionService from '../services/transcriptionService';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('audio'), async (req, res) => {
  try {
    console.log('Received transcription request:', {
      fileExists: !!req.file,
      fileSize: req.file?.size,
      mimeType: req.file?.mimetype,
    });

    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Convert audio to proper format if needed
    const audioBuffer = req.file.buffer;
    
    const result = await TranscriptionService.transcribeAudio(audioBuffer);
    console.log('Transcription result:', result);

    res.json(result);
  } catch (error: any) {
    console.error('Transcription route error:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Failed to transcribe audio',
      details: error.message 
    });
  }
});

export default router;