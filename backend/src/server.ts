import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app';
import healthRouter from './routes/health';

dotenv.config();

const port = process.env.PORT || 3001;
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/audio-logger';

// Move route registration before MongoDB connection
app.use('/api/health', healthRouter);

mongoose.connect(mongoUri)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });