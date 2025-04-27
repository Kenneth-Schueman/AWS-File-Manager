import { Request, Response, NextFunction } from 'express';

// Error handler middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);
  
  // Check if the error is from Multer
  if (err instanceof Error && err.name === 'MulterError') {
    if (err.message === 'File too large') {
      res.status(400).json({
        error: 'File size exceeds the limit (50MB)'
      });
      return;
    }
    res.status(400).json({
      error: `Upload error: ${err.message}`
    });
    return;
  }

  // Handle other errors
  res.status(500).json({
    error: 'Internal server error'
  });
};

// 404 handler middleware
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(404).json({
    error: 'Resource not found'
  });
};
