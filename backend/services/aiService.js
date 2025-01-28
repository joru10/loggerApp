import speech from '@google-cloud/speech';
import axios from 'axios';

const LM_STUDIO_URL = 'http://localhost:1234/v1/chat/completions';
const speechClient = new speech.SpeechClient();

export class AIService {
  static async transcribeAudio(audioBuffer) {
    // ... existing transcription code remains the same ...
  }

  static async generateDailyReport(recordings) {
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful assistant that creates detailed activity reports based on audio transcriptions.'
      },
      {
        role: 'user',
        content: `Generate a detailed daily activity report based on these recordings:\n${
          recordings.map(r => `${r.timestamp}: ${r.transcription}`).join('\n')
        }`
      }
    ];

    try {
      const response = await axios.post(LM_STUDIO_URL, {
        messages,
        model: 'deepseek-r1',
        temperature: 0.7,
        max_tokens: 500
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating report:', error);
      return 'Error generating report';
    }
  }

  static async generateMonthlyReport(dailyReports) {
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful assistant that creates monthly summary reports based on daily reports.'
      },
      {
        role: 'user',
        content: `Generate a monthly summary report based on these daily reports:\n${
          dailyReports.map(r => r.content).join('\n\n')
        }`
      }
    ];

    try {
      const response = await axios.post(LM_STUDIO_URL, {
        messages,
        model: 'deepseek-r1',
        temperature: 0.7,
        max_tokens: 1000
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating monthly report:', error);
      return 'Error generating monthly report';
    }
  }
}