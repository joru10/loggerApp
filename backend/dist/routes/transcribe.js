"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const transcriptionService_1 = require("../services/transcriptionService");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
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
        const result = await (0, transcriptionService_1.transcribeAudio)(audioBuffer);
        console.log('Transcription result:', result);
        res.json(result);
    }
    catch (error) {
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
exports.default = router;
