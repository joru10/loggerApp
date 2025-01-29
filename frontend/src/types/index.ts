export interface Activity {
  id: string;
  description: string;
  duration: number;
  categoryId: {
    id: string;
    name: string;
  };
}

export interface Recording {
  _id: string;
  url: string;
  audioData: Blob;
  timestamp: Date;
  transcript: string;
  activities: Activity[];
  processed: boolean;
}

export interface TranscriptionResult {
  transcript: string;
  activities: Activity[];
}