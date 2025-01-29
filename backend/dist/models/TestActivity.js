"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const TestActivitySchema = new mongoose_1.default.Schema({
    description: String,
    startTime: Date,
    duration: Number,
    categoryId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Category'
    },
    confidence: Number,
    source: {
        audioNoteId: String,
        timestamp: Date
    },
    isTest: {
        type: Boolean,
        default: true
    },
    testSessionId: String
}, { timestamps: true });
exports.default = mongoose_1.default.model('TestActivity', TestActivitySchema);
