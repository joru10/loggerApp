export interface Recording {
  _id: string;
  transcript: string;
  timestamp: Date;
  activities: Activity[];
  audioData?: {
    type: string;
    data: number[] | Uint8Array;
    size: number;
  } | Blob;
  url?: string;
}

export interface Activity {
  description: string;
  startTime: string;
  duration: number;
  categoryId: string;
  confidence: number;
}