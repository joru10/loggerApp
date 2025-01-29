import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Paper,
  Typography,
  Slider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { api } from '../services/api';

const TestMode: React.FC = () => {
  const [reportType, setReportType] = useState<'daily' | 'monthly'>('daily');
  const [startDate, setStartDate] = useState(new Date());
  const [activityCount, setActivityCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [testData, setTestData] = useState<any>(null);

  const generateTestData = async () => {
    try {
      if (reportType === 'daily') {
        const response = await api.getDailyRecordings(startDate.toISOString().split('T')[0]);
        setTestData(response);
      } else {
        const response = await api.getMonthlyReport(
          startDate.getFullYear(),
          startDate.getMonth() + 1
        );
        setTestData(response);
      }
    } catch (error) {
      console.error('Test mode error:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Test Mode
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Report Type</InputLabel>
          <Select
            value={reportType}
            label="Report Type"
            onChange={(e) => setReportType(e.target.value as 'daily' | 'monthly')}
          >
            <MenuItem value="daily">Daily Report</MenuItem>
            <MenuItem value="monthly">Monthly Report</MenuItem>
          </Select>
        </FormControl>

        <DatePicker
          label="Select Date"
          value={startDate}
          onChange={(date) => date && setStartDate(date)}
          sx={{ width: '100%', mb: 2 }}
        />

        <Typography gutterBottom>
          Number of Activities to Generate
        </Typography>
        <Slider
          value={activityCount}
          onChange={(_, value) => setActivityCount(Array.isArray(value) ? value[0] : value)}
          min={1}
          max={50}
          marks
          valueLabelDisplay="auto"
          sx={{ mb: 2 }}
        />

        <Button
          variant="contained"
          onClick={generateTestData}
          disabled={loading}
          fullWidth
        >
          {loading ? <CircularProgress size={24} /> : 'Generate Test Data'}
        </Button>
      </Paper>

      {testData && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Generated Data
          </Typography>
          <pre>{JSON.stringify(testData, null, 2)}</pre>
        </Paper>
      )}
    </Box>
  );
};

export default TestMode;