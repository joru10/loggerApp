"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const Recording_1 = require("../models/Recording");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.post('/', upload.single('audio'), async (req, res) => {
    try {
        console.log('Received recording request:', {
            body: JSON.stringify(req.body),
            fileSize: req.file?.size,
            contentType: req.file?.mimetype,
            headers: req.headers['content-type']
        });
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }
        const newRecording = {
            transcript: req.body.transcript || '',
            timestamp: new Date(req.body.timestamp),
            activities: JSON.parse(req.body.activities || '[]'),
            audioData: req.file.buffer
        };
        const recording = new Recording_1.Recording(newRecording);
        const savedRecording = await recording.save();
        console.log('Recording saved successfully:', {
            id: savedRecording._id,
            transcript: savedRecording.transcript,
            hasAudioData: !!savedRecording.audioData
        });
        res.status(201).json(savedRecording);
    }
    catch (error) {
        console.error('Error saving recording:', error);
        res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to save recording' });
    }
});
router.post('/', async (req, res) => {
    try {
        console.log('Received recording request:', {
            hasAudioData: !!req.body.audioData,
            audioDataType: typeof req.body.audioData,
            timestamp: req.body.timestamp
        });
        const recording = new Recording_1.Recording({
            transcript: req.body.transcript || '',
            timestamp: req.body.timestamp || new Date(),
            audioData: req.body.audioData,
            activities: []
        });
        const savedRecording = await recording.save();
        console.log('Saved recording:', {
            id: savedRecording._id,
            hasAudioData: !!savedRecording.audioData
        });
        res.json(savedRecording);
    }
    catch (error) {
        console.error('Error saving recording:', error);
        res.status(500).json({ error: 'Failed to save recording' });
    }
});
router.get('/', async (req, res) => {
    try {
        const recordings = await Recording_1.Recording.find().sort({ timestamp: -1 });
        console.log('Fetched recordings:', {
            count: recordings.length,
            latest: recordings[0]?.timestamp
        });
        res.json(recordings);
    }
    catch (error) {
        console.error('Error fetching recordings:', error);
        res.status(500).json({ error: 'Failed to fetch recordings' });
    }
});
router.get('/daily/:date', async (req, res) => {
    try {
        const date = new Date(req.params.date);
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);
        const recordings = await Recording_1.Recording.find({
            timestamp: {
                $gte: date,
                $lt: nextDay
            }
        }).populate('activities.categoryId');
        res.json(recordings);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch daily recordings' });
    }
});
router.get('/monthly/:year/:month', async (req, res) => {
    try {
        const year = parseInt(req.params.year);
        const month = parseInt(req.params.month) - 1;
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);
        const recordings = await Recording_1.Recording.find({
            timestamp: {
                $gte: startDate,
                $lte: endDate
            }
        }).populate('activities.categoryId');
        // Group activities by category with proper typing
        const categoryStats = recordings.reduce((acc, recording) => {
            recording.activities.forEach(activity => {
                if (activity.categoryId) {
                    const categoryId = activity.categoryId.toString();
                    if (!acc[categoryId]) {
                        acc[categoryId] = {
                            totalDuration: 0,
                            activityCount: 0,
                            category: categoryId // Changed from activity.category to categoryId
                        };
                    }
                    acc[categoryId].totalDuration += activity.duration || 0;
                    acc[categoryId].activityCount += 1;
                }
            });
            return acc;
        }, {});
        res.json({
            recordings,
            stats: categoryStats,
            period: {
                start: startDate,
                end: endDate
            }
        });
    }
    catch (error) {
        console.error('Monthly report generation failed:', error);
        res.status(500).json({
            error: 'Failed to generate monthly report',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Error handling middleware with proper types
router.use((err, req, res, next) => {
    console.error('Recording route error:', err);
    res.status(500).json({
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
exports.default = router;
