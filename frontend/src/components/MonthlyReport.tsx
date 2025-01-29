import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress,
  Paper,
  Grid 
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { DatePicker } from '@mui/x-date-pickers';
// Update imports
import { api } from '../services/api';

interface ActivityData {
  date: string;
  count: number;
  category: string;
}

interface MonthlyReportData {
  report: {
    summary: string;
  };
  activities: ActivityData[];
}

const MonthlyReport: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<MonthlyReportData['report'] | null>(null);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);

  useEffect(() => {
    const fetchMonthlyReport = async () => {
      try {
        setLoading(true);
        const response = await api.getMonthlyReport(
          selectedDate.getFullYear(),
          selectedDate.getMonth() + 1
        );
        setReportData(response.report);
        setActivityData(response.activities);
      } catch (err) {
        setError('Failed to load monthly report');
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyReport();
  }, [selectedDate]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Monthly Activity Report
      </Typography>

      <DatePicker
        views={['year', 'month']}
        value={selectedDate}
        onChange={(newValue: Date | null) => newValue && setSelectedDate(newValue)}
        sx={{ mb: 3, width: 200 }}
      />
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Activity Summary
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Summary
            </Typography>
            <Typography>
              {reportData?.summary}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MonthlyReport;