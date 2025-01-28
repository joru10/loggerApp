import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';
import { format } from 'date-fns';

const Reports = ({ recordings }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Activity Log
      </Typography>
      {recordings.map((recording, index) => (
        <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="subtitle1">
            {format(new Date(recording.timestamp), 'HH:mm:ss')}
          </Typography>
          
          {recording.audioData && (
            <Box sx={{ mt: 1 }}>
              <audio controls>
                <source src={recording.audioData} type="audio/wav" />
                Your browser does not support the audio element.
              </audio>
            </Box>
          )}
          
          {recording.transcript && (
            <Typography variant="body1" sx={{ mt: 1, color: 'text.secondary' }}>
              "{recording.transcript}"
            </Typography>
          )}

          {recording.activities && recording.activities.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="primary">
                Activities:
              </Typography>
              <ul style={{ margin: '4px 0' }}>
                {recording.activities.map((activity, idx) => (
                  <li key={idx}>{activity}</li>
                ))}
              </ul>
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default Reports;