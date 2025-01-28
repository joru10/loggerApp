import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { Paper } from '@mui/material';

const Calendar = ({ selectedDate, onDateChange }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper elevation={3} sx={{ mb: 3, p: 2 }}>
        <DateCalendar 
          value={selectedDate}
          onChange={onDateChange}
          disableFuture
        />
      </Paper>
    </LocalizationProvider>
  );
};

export default Calendar;