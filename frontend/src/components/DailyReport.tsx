import React from 'react';
import { 
  Box, 
  Paper, 
  List, 
  ListItem,
  ListItemText,
  IconButton,
  Stack
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Recording } from '../types';

interface DailyReportProps {
  recordings: Recording[];
}

export const DailyReport: React.FC<DailyReportProps> = ({ recordings }) => {
  return (
    <Box component={Paper} sx={{ p: 2 }}>
      <List>
        {recordings.map((recording) => (
          <ListItem
            key={recording._id}
            secondaryAction={
              <Stack direction="row" spacing={1}>
                <IconButton edge="end" aria-label="play">
                  <PlayArrowIcon />
                </IconButton>
              </Stack>
            }
          >
            <ListItemText
              primary={recording.transcript}
              secondary={new Date(recording.timestamp).toLocaleString()}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default DailyReport;