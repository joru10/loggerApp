import { pipeline } from '@xenova/transformers';
import ffmpeg from 'fluent-ffmpeg';
import { Readable } from 'stream';
import { AutomaticSpeechRecognitionPipeline, AutomaticSpeechRecognitionOutput } from '@xenova/transformers';

interface WhisperResult extends AutomaticSpeechRecognitionOutput {
  text: string;
}

type WhisperTranscriber = AutomaticSpeechRecognitionPipeline;

let transcriber: WhisperTranscriber | null = null;

async function initTranscriber() {
  try {
    if (!transcriber) {
      console.log('Initializing Whisper model...');
      transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny');
      console.log('Whisper model initialized successfully');
    }
    return transcriber;
  } catch (error: any) {
    console.error('Error initializing transcriber:', {
      message: error.message,
      stack: error.stack,
      type: error.type
    });
    throw new Error(`Failed to initialize transcriber: ${error.message}`);
  }
}

// Remove unused interface


async function convertWebmToWav(audioBuffer: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const inputStream = new Readable();
    inputStream.push(audioBuffer);
    inputStream.push(null);

    let outputBuffer = Buffer.alloc(0);
    const command = ffmpeg(inputStream)
      .toFormat('wav')
      .audioCodec('pcm_s16le')
      .audioChannels(1)
      .audioFrequency(16000);

    const { Writable } = require('stream');
    const outputStream = new Writable({
      write(chunk: Buffer, encoding: BufferEncoding, callback: (error?: Error | null) => void) {
        outputBuffer = Buffer.concat([outputBuffer, chunk]);
        callback();
      }
    });

    command
      .on('error', (err: Error) => reject(err))
      .on('end', () => resolve(outputBuffer))
      .stream(outputStream);
  });
}

export interface TranscriptionResult {
  transcript: string;
  activities: any[];
}

export async function transcribeAudio(audioBuffer: Buffer): Promise<TranscriptionResult> {
  try {
    console.log('Starting local Whisper transcription:', {
      inputBufferSize: audioBuffer.length,
      isBuffer: Buffer.isBuffer(audioBuffer)
    });
    
    const model = await initTranscriber();
    
    console.log('Converting audio to WAV format...');
    const wavBuffer = await convertWebmToWav(audioBuffer);
    
    if (!model) {
      throw new Error('Transcriber model not initialized');
    }
    
    const output = await model(wavBuffer as any, {
      chunk_length_s: 30,
      stride_length_s: 5,
      return_timestamps: true
    });

    const result: WhisperResult = {
      ...output,
      text: typeof output === 'string' ? output : Array.isArray(output) ? output[0].text : output.text
    };
    console.log('Local transcription completed:', result);

    return {
      transcript: result.text,
      activities: []
    };
  } catch (error) {
    console.error('Transcription failed:', error);
    throw error;
  }
}

const transcriptionService = {
  transcribeAudio,
  initTranscriber,
  convertWebmToWav
};

export type { TranscriptionResult, WhisperResult, WhisperTranscriber };
export default transcriptionService;
    };
  } catch (error: any) {
    console.error('Transcription error:', {
      message: error.message,
      stack: error.stack
    });
    throw new Error(`Failed to transcribe audio: ${error.message}`);
  }
}

const transcriptionService = {
  transcribeAudio,
  initTranscriber,
  convertWebmToWav
};

export type { TranscriptionResult, WhisperResult, WhisperTranscriber };
export default transcriptionService;