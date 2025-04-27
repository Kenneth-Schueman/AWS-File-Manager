import multer from 'multer';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// Create multer upload instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB file size limit
  }
});

export default upload;
