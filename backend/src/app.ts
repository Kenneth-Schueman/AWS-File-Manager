import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import config from './config/config';
import fileRoutes from './routes/fileRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Create Express application
const app = express();

// Configure middleware
app.use(cors({
  origin: config.cors.origin,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// API routes
app.use('/api/files', fileRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling
app.use('*', notFoundHandler);
app.use(errorHandler);

export default app;
