"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const transformers_1 = require("@xenova/transformers");
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const stream_1 = require("stream");
let transcriber = null;
async function initTranscriber() {
    try {
        if (!transcriber) {
            console.log('Initializing Whisper model...');
            transcriber = await (0, transformers_1.pipeline)('automatic-speech-recognition', 'Xenova/whisper-tiny');
            console.log('Whisper model initialized successfully');
        }
        return transcriber;
    }
    catch (error) {
        console.error('Error initializing transcriber:', {
            message: error.message,
            stack: error.stack,
            type: error.type
        });
        throw new Error(`Failed to initialize transcriber: ${error.message}`);
    }
}
async function convertWebmToWav(audioBuffer) {
    return new Promise((resolve, reject) => {
        const inputStream = new stream_1.Readable();
        inputStream.push(audioBuffer);
        inputStream.push(null);
        let outputBuffer = Buffer.alloc(0);
        const command = (0, fluent_ffmpeg_1.default)(inputStream)
            .toFormat('wav')
            .audioCodec('pcm_s16le')
            .audioChannels(1)
            .audioFrequency(16000);
        const { Writable } = require('stream');
        const outputStream = new Writable({
            write(chunk, encoding, callback) {
                outputBuffer = Buffer.concat([outputBuffer, chunk]);
                callback();
            }
        });
        command
            .on('error', (err) => reject(err))
            .on('end', () => resolve(outputBuffer))
            .stream(outputStream);
    });
}
async function transcribeAudio(audioBuffer) {
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
        const output = await model(wavBuffer, {
            chunk_length_s: 30,
            stride_length_s: 5,
            return_timestamps: true
        });
        const result = {
            ...output,
            text: typeof output === 'string' ? output : Array.isArray(output) ? output[0].text : output.text
        };
        console.log('Local transcription completed:', result);
        return {
            transcript: result.text,
            activities: []
        };
    }
    catch (error) {
        console.error('Local transcription error:', {
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
}
exports.default = {
    transcribeAudio,
    initTranscriber,
    convertWebmToWav
};
