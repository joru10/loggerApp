import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import recordingsRouter from './routes/recordings';
import transcribeRouter from './routes/transcribe';

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/recordings', recordingsRouter);
app.use('/api/transcribe', transcribeRouter);

export default app;