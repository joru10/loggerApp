import mongoose, { Document } from 'mongoose';

interface IActivity {
  description: string;
  startTime: Date;
  duration: number;
  categoryId: mongoose.Types.ObjectId;
  confidence: number;
}

interface IRecording extends Document {
  transcript: string;
  timestamp: Date;
  activities: IActivity[];
  audioData: Buffer;
  url?: string;
}

const recordingSchema = new mongoose.Schema<IRecording>({
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
      type: mongoose.Schema.Types.ObjectId,
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
    transform: function(doc, ret) {
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

export const Recording = mongoose.model('Recording', recordingSchema);