import React from 'react';
import { Box, Paper } from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers';

interface CalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateChange }) => {
  console.log('Calendar rendering', { selectedDate });  // Add debug log
  
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ maxWidth: 320 }}>
        <DateCalendar 
          value={selectedDate}
          onChange={(newValue) => {
            console.log('Calendar onChange', { newValue });  // Add debug log
            if (newValue) onDateChange(newValue);
          }}
        />
      </Box>
    </Paper>
  );
};

export default Calendar;