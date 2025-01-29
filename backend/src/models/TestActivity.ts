import mongoose from 'mongoose';

const TestActivitySchema = new mongoose.Schema({
  description: String,
  startTime: Date,
  duration: Number,
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
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

export default mongoose.model('TestActivity', TestActivitySchema);