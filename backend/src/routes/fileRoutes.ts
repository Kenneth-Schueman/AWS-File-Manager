import express from 'express';
import fileController from '../controllers/fileController';
import upload from '../middleware/upload';

const router = express.Router();

// GET /api/files - List files in a directory
router.get('/', (req, res) => fileController.listFiles(req, res));

// POST /api/files/upload - Upload a file
router.post('/upload', upload.single('file'), (req, res) => fileController.uploadFile(req, res));

// POST /api/files/folder - Create a new folder
router.post('/folder', (req, res) => fileController.createFolder(req, res));

// DELETE /api/files/:key - Delete a file or folder
router.delete('/:key', (req, res) => fileController.deleteItem(req, res));

// GET /api/files/download/:key - Get download URL for a file
router.get('/download/:key', (req, res) => fileController.getDownloadUrl(req, res));

// GET /api/files/share/:key - Get share URL for a file
router.get('/share/:key', (req, res) => fileController.getShareUrl(req, res));

export default router;
