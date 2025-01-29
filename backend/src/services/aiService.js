require('dotenv').config();
import speech from '@google-cloud/speech';
import axios from 'axios';
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/ai-service.log' })
  ]
});

export class AIService {
  constructor() {
    this.lmStudioUrl = process.env.LM_STUDIO_URL || 'http://localhost:1234/v1/chat/completions';
    this.model = process.env.LLM_MODEL_NAME || 'deepseek-r1';
    this.fallbackModel = process.env.FALLBACK_MODEL_NAME || 'phi-4';
    this.speechClient = new speech.SpeechClient();
  }

  async transcribeAudio(audioBuffer) {
    try {
      // ... existing transcription code remains the same ...
    } catch (error) {
      logger.error('Transcription failed:', { error: error.message });
      throw new Error('Audio transcription failed');
    }
  }

  async generateDailyReport(recordings) {
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
      const response = await this._makeLLMRequest(messages, 500);
      return this._parseReportResponse(response);
    } catch (error) {
      logger.error('Daily report generation failed:', { 
        error: error.message,
        recordingsCount: recordings.length 
      });
      throw new Error('Failed to generate daily report');
    }
  }

  async generateMonthlyReport(dailyReports) {
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
      const response = await this._makeLLMRequest(messages, 1000);
      return this._parseReportResponse(response);
    } catch (error) {
      logger.error('Monthly report generation failed:', { 
        error: error.message,
        reportsCount: dailyReports.length 
      });
      throw new Error('Failed to generate monthly report');
    }
  }

  async _makeLLMRequest(messages, maxTokens) {
    try {
      const response = await axios.post(this.lmStudioUrl, {
        messages,
        model: this.model,
        temperature: 0.7,
        max_tokens: maxTokens
      });

      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid LLM response structure');
      }

      return response.data;
    } catch (error) {
      logger.warn('Primary LLM request failed, attempting fallback:', { 
        error: error.message 
      });

      // Attempt fallback
      return this._makeFallbackRequest(messages, maxTokens);
    }
  }

  async _makeFallbackRequest(messages, maxTokens) {
    try {
      const response = await axios.post(process.env.LOCAL_AI_URL, {
        messages,
        model: this.fallbackModel,
        temperature: 0.7,
        max_tokens: maxTokens
      });

      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid fallback LLM response structure');
      }

      return response.data;
    } catch (error) {
      logger.error('Fallback LLM request failed:', { error: error.message });
      throw error;
    }
  }

  _parseReportResponse(response) {
    try {
      const content = response.choices[0].message.content;
      return {
        content,
        timestamp: new Date().toISOString(),
        model: response.model || this.model
      };
    } catch (error) {
      logger.error('Error parsing LLM response:', { error: error.message });
      throw new Error('Failed to parse LLM response');
    }
  }
}

export default new AIService();