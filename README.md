# Audio Logger

A web application for recording and transcribing audio notes with activity tracking.

## Prerequisites

- Node.js (v18 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies for both frontend and backend:
```bash
cd frontend && npm install
cd ../backend && npm install
```

3. Configure environment variables:
   - Create a \`.env\` file
   - Add your LLM API key
   - Configure other necessary environment variables

4. Start the development server:
\`\`\`bash
npm start
\`\`\`

## Usage

1. Configure Activity Categories:
   - Access the configuration panel
   - Create custom categories for your activities
   - Add relevant keywords for each category
   - Set category colors for reports

2. Record Activities:
   - Click the "Start Recording" button
   - Speak into your microphone to log your activities
   - Mention times and durations for better tracking
   - View real-time transcription as you speak
   - Click "Stop Recording" to finish

3. Activity Processing:
   - Audio and transcript are saved
   - LLM analyzes the transcript for activities
   - Activities are automatically categorized
   - Times and durations are extracted or defaulted
   - Activities are stored for reporting

## Report Generation

### Per-Recording Analysis
- Each recording is analyzed to identify specific activities
- Activities are automatically categorized based on content
- Time tracking with smart defaults:
  - Explicit times are extracted when mentioned
  - Default 15-minute duration when unspecified
  - Recording timestamp used for undefined start times

### Daily Reports
- End-of-day consolidation of all recorded activities
- Activities grouped by category
- Time-based analysis of daily work
- Intelligent summarization of accomplishments
- Category-based time tracking

### Monthly Reports
- Monthly activity patterns and trends
- Category-based aggregation
- Time allocation insights
- Productivity analysis by category
- Visual representations of time distribution

## Browser Support

This application primarily supports Chrome and Chrome-based browsers due to the Web Speech API implementation.

## License

MIT
