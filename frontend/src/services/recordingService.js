const API_BASE_URL = 'http://localhost:3001/api';  // Update port here

const saveRecording = async (recordingData) => {
  try {
    console.log('Saving recording data with transcript:', recordingData.transcript);
    console.log('Saving activities:', recordingData.activities); // Add activities logging

    // Convert Blob to Base64
    const audioBlob = await fetch(recordingData.url).then(r => r.blob());
    const base64Audio = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(audioBlob);
    });

    const payload = {
      ...recordingData,
      audioData: base64Audio,
      transcript: recordingData.transcript,
      activities: recordingData.activities || [], // Ensure activities are included
      processed: true // Mark as processed
    };

    const response = await fetch(`${API_BASE_URL}/recordings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const savedRecording = await response.json();
    console.log('Recording saved with full data:', {
      transcript: savedRecording.transcript,
      activities: savedRecording.activities
    });
    return savedRecording;
  } catch (error) {
    console.error('Failed to save recording:', error);
    throw error;
  }
};

const fetchRecordings = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/recordings`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const recordings = await response.json();
    console.log('Fetched recordings with transcripts:', 
      recordings.map(r => ({ id: r.id, transcript: r.transcript }))
    ); // Added transcript logging for fetched recordings
    return recordings;
  } catch (error) {
    console.error('Failed to fetch recordings:', error);
    throw error;
  }
};

export { saveRecording, fetchRecordings };