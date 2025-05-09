import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
import authRoutes from './routes/auth.js';
import { authenticateToken } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Create storage directory if it doesn't exist
const STORAGE_DIR = path.join(__dirname, 'storage');
fs.ensureDirSync(STORAGE_DIR);

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
}));

// Auth routes (public)
app.use('/api/auth', authRoutes);

// Database simulation (in-memory for simplicity)
// In a real app, you'd use a proper database
const db = {
  files: [],
  directories: [{ id: 'root', name: 'root', path: '', parentId: null, starred: false }],
  shares: []
};

// Load existing data from filesystem
function syncWithFileSystem() {
  // Clear existing data
  db.files = [];
  db.directories = [{ id: 'root', name: 'root', path: '', parentId: null, starred: false }];
  
  function scanDirectory(dirPath, parentId) {
    const relativePath = path.relative(STORAGE_DIR, dirPath);
    const dirName = path.basename(dirPath);
    
    // Skip if it's the root directory
    if (dirPath !== STORAGE_DIR) {
      const dirId = uuidv4();
      db.directories.push({
        id: dirId,
        name: dirName,
        path: relativePath.replace(/\\/g, '/'),
        parentId,
        starred: false
      });
      parentId = dirId;
    } else {
      parentId = 'root';
    }
    
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        scanDirectory(itemPath, parentId);
      } else {
        db.files.push({
          id: uuidv4(),
          name: item,
          path: path.relative(STORAGE_DIR, itemPath).replace(/\\/g, '/'),
          parentId,
          size: stats.size,
          type: path.extname(item).slice(1),
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime,
          starred: false
        });
      }
    }
  }
  
  scanDirectory(STORAGE_DIR, null);
}

// Initial sync
syncWithFileSystem();

// Helper function to get full path
function getFullPath(relativePath) {
  return path.join(STORAGE_DIR, relativePath);
}

// Routes

// Protected routes - require authentication
app.use('/api/items', authenticateToken);
app.use('/api/directories', authenticateToken);
app.use('/api/upload', authenticateToken);
app.use('/api/download', authenticateToken);
app.use('/api/star', authenticateToken);
app.use('/api/starred', authenticateToken);
app.use('/api/share', authenticateToken);

// Get all items (files and directories) in a directory
app.get('/api/items', (req, res) => {
  const { parentId = 'root' } = req.query;
  
  const directories = db.directories.filter(dir => dir.parentId === parentId);
  const files = db.files.filter(file => file.parentId === parentId);
  
  res.json({ directories, files });
});

// Create a new directory
app.post('/api/directories', async (req, res) => {
  const { name, parentId = 'root' } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Directory name is required' });
  }
  
  // Find parent directory
  const parent = db.directories.find(dir => dir.id === parentId);
  if (!parent && parentId !== 'root') {
    return res.status(404).json({ error: 'Parent directory not found' });
  }
  
  const parentPath = parentId === 'root' ? '' : parent.path;
  const dirPath = path.join(parentPath, name);
  const fullPath = getFullPath(dirPath);
  
  try {
    // Check if directory already exists
    if (fs.existsSync(fullPath)) {
      return res.status(400).json({ error: 'Directory already exists' });
    }
    
    // Create directory
    await fs.ensureDir(fullPath);
    
    // Add to database
    const newDir = {
      id: uuidv4(),
      name,
      path: dirPath.replace(/\\/g, '/'),
      parentId,
      starred: false
    };
    
    db.directories.push(newDir);
    
    res.status(201).json(newDir);
  } catch (error) {
    console.error('Error creating directory:', error);
    res.status(500).json({ error: 'Failed to create directory' });
  }
});

// Upload file
app.post('/api/upload', async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: 'No files were uploaded' });
    }
    
    const { parentId = 'root' } = req.body;
    
    // Find parent directory
    const parent = db.directories.find(dir => dir.id === parentId);
    if (!parent && parentId !== 'root') {
      return res.status(404).json({ error: 'Parent directory not found' });
    }
    
    const parentPath = parentId === 'root' ? '' : parent.path;
    const uploadedFiles = [];
    
    // Handle multiple files
    const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
    
    for (const file of files) {
      const fileName = file.name;
      const filePath = path.join(parentPath, fileName);
      const fullPath = getFullPath(filePath);
      
      // Move file to storage
      await file.mv(fullPath);
      
      // Add to database
      const newFile = {
        id: uuidv4(),
        name: fileName,
        path: filePath.replace(/\\/g, '/'),
        parentId,
        size: file.size,
        type: path.extname(fileName).slice(1),
        createdAt: new Date(),
        modifiedAt: new Date(),
        starred: false
      };
      
      db.files.push(newFile);
      uploadedFiles.push(newFile);
    }
    
    res.status(201).json(uploadedFiles);
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Download file
app.get('/api/download/:fileId', (req, res) => {
  const { fileId } = req.params;
  
  const file = db.files.find(f => f.id === fileId);
  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  const fullPath = getFullPath(file.path);
  
  res.download(fullPath, file.name, (err) => {
    if (err) {
      console.error('Error downloading file:', err);
      res.status(500).json({ error: 'Failed to download file' });
    }
  });
});

// Star/unstar item
app.patch('/api/star/:itemType/:itemId', (req, res) => {
  const { itemType, itemId } = req.params;
  const { starred } = req.body;
  
  if (starred === undefined) {
    return res.status(400).json({ error: 'Starred status is required' });
  }
  
  let item;
  
  if (itemType === 'file') {
    item = db.files.find(f => f.id === itemId);
    if (item) {
      item.starred = starred;
    }
  } else if (itemType === 'directory') {
    item = db.directories.find(d => d.id === itemId);
    if (item) {
      item.starred = starred;
    }
  }
  
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  
  res.json(item);
});

// Get starred items
app.get('/api/starred', (req, res) => {
  const starredFiles = db.files.filter(file => file.starred);
  const starredDirectories = db.directories.filter(dir => dir.starred);
  
  res.json({ directories: starredDirectories, files: starredFiles });
});

// Share file
app.post('/api/share/:fileId', (req, res) => {
  const { fileId } = req.params;
  
  const file = db.files.find(f => f.id === fileId);
  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  // Generate a unique share ID
  const shareId = uuidv4();
  
  // Add to shares database
  const share = {
    id: shareId,
    fileId,
    createdAt: new Date()
  };
  
  db.shares.push(share);
  
  // Return share URL
  const shareUrl = `${req.protocol}://${req.get('host')}/api/shared/${shareId}`;
  res.json({ shareUrl, share });
});

// Access shared file
app.get('/api/shared/:shareId', (req, res) => {
  const { shareId } = req.params;
  
  const share = db.shares.find(s => s.id === shareId);
  if (!share) {
    return res.status(404).json({ error: 'Shared link not found or expired' });
  }
  
  const file = db.files.find(f => f.id === share.fileId);
  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  const fullPath = getFullPath(file.path);
  
  res.download(fullPath, file.name, (err) => {
    if (err) {
      console.error('Error downloading shared file:', err);
      res.status(500).json({ error: 'Failed to download shared file' });
    }
  });
});

// Delete file or directory
app.delete('/api/items/:itemType/:itemId', async (req, res) => {
  const { itemType, itemId } = req.params;
  
  try {
    if (itemType === 'file') {
      const file = db.files.find(f => f.id === itemId);
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      const fullPath = getFullPath(file.path);
      await fs.remove(fullPath);
      
      // Remove from database
      db.files = db.files.filter(f => f.id !== itemId);
      
      // Remove any shares
      db.shares = db.shares.filter(s => s.fileId !== itemId);
      
      res.json({ message: 'File deleted successfully' });
    } else if (itemType === 'directory') {
      const directory = db.directories.find(d => d.id === itemId);
      if (!directory) {
        return res.status(404).json({ error: 'Directory not found' });
      }
      
      // Don't allow deleting root
      if (directory.id === 'root') {
        return res.status(400).json({ error: 'Cannot delete root directory' });
      }
      
      const fullPath = getFullPath(directory.path);
      await fs.remove(fullPath);
      
      // Resync with filesystem to update database
      syncWithFileSystem();
      
      res.json({ message: 'Directory deleted successfully' });
    } else {
      res.status(400).json({ error: 'Invalid item type' });
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
