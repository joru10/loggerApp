import React from 'react';
import { Box, Typography } from '@mui/material';
import { DailyReport } from './DailyReport';
import { Recording } from '../types';

interface ReportsProps {
  recordings: Recording[];
}

const Reports: React.FC<ReportsProps> = ({ recordings }) => {
  console.log('Reports rendering with:', recordings);
  
  if (!DailyReport) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Daily Report ({recordings.length} recordings)
        </Typography>
        <Typography color="error">
          Error loading report component
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Daily Report ({recordings.length} recordings)
      </Typography>
      <DailyReport recordings={recordings} />
    </Box>
  );
};

export default Reports;