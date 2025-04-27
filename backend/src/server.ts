import app from './app';
import config from './config/config';

// Start the server
const server = app.listen(config.port, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

export default server;
