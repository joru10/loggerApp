# Audio Logger

A web application that records audio and provides real-time speech-to-text transcription with intelligent activity tracking and report generation.

## Features

- Audio recording with real-time transcription
- Speech-to-text conversion using Web Speech API
- Intelligent activity identification from transcripts using LLM
- Automated report generation:
  - Per-recording activity analysis
  - Daily activity summaries
  - Monthly consolidated reports (planned)
- Material-UI interface
- Real-time transcript display
- Audio file generation (WebM format)

## Tech Stack

- React.js
- Material-UI
- Web Speech API
- MediaRecorder API
- LLM Integration for activity analysis
- Node.js backend for report processing

## Prerequisites

- Node.js (v14 or higher)
- Modern web browser with Web Speech API support (Chrome recommended)
- Microphone access
- API key for LLM service

## Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/joru10/loggerApp.git
cd loggerApp
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Configure environment variables:
   - Create a \`.env\` file
   - Add your LLM API key
   - Configure other necessary environment variables

4. Start the development server:
\`\`\`bash
npm start
\`\`\`

## Usage

1. Click the "Start Recording" button to begin recording
2. Speak into your microphone to log your activities
3. View real-time transcription as you speak
4. Click "Stop Recording" to finish
5. The recording and transcript will be processed:
   - Audio and transcript are saved
   - LLM analyzes the transcript for activities
   - Activities are stored for daily report generation

## Report Generation

### Per-Recording Analysis
- Each recording is analyzed to identify specific activities
- Activities are categorized and stored for aggregation

### Daily Reports
- End-of-day consolidation of all recorded activities
- Intelligent summarization of daily accomplishments
- Activity categorization and time tracking

### Monthly Reports (Planned)
- Monthly activity patterns and trends
- Productivity analysis
- Time allocation insights

## Browser Support

This application primarily supports Chrome and Chrome-based browsers due to the Web Speech API implementation.

## License

MIT
