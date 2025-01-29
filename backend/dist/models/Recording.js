"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Recording = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const recordingSchema = new mongoose_1.default.Schema({
    transcript: {
        type: String,
        required: true,
        default: ''
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    },
    activities: [{
            description: { type: String, required: true },
            startTime: { type: Date, required: true },
            duration: { type: Number, required: true },
            categoryId: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'Category',
                required: true
            },
            confidence: { type: Number, required: true }
        }],
    audioData: {
        type: Buffer,
        required: true
    },
    url: String
}, {
    toJSON: {
        transform: function (doc, ret) {
            if (ret.audioData && ret.audioData.buffer) {
                // Convert Buffer to ArrayBuffer for proper serialization
                ret.audioData = {
                    type: 'audio/webm;codecs=opus',
                    data: Array.from(ret.audioData),
                    size: ret.audioData.length
                };
            }
            return ret;
        }
    }
});
exports.Recording = mongoose_1.default.model('Recording', recordingSchema);
