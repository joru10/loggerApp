import React, { useState } from 'react';
import { Paper, Typography, Button, CircularProgress } from '@mui/material';
import { generateDailyReport } from '../services/aiService';

const DailyReport = ({ recordings }) => {
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const transcriptions = recordings.map(rec => rec.transcription).filter(Boolean);
      const generatedReport = await generateDailyReport(transcriptions);
      setReport(generatedReport);
    } catch (error) {
      console.error('Error generating report:', error);
    }
    setLoading(false);
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Daily Report
      </Typography>
      
      <Button 
        variant="contained" 
        onClick={handleGenerateReport}
        disabled={loading || recordings.length === 0}
        sx={{ mb: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Generate Report'}
      </Button>

      {report && (
        <Typography variant="body1" whiteSpace="pre-wrap">
          {report}
        </Typography>
      )}
    </Paper>
  );
};

export default DailyReport;