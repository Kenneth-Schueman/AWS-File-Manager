import { Request, Response } from 'express';
import fileService from '../services/fileService';

class FileController {
  /**
   * List files in a directory
   * @param req Request object
   * @param res Response object
   */
  async listFiles(req: Request, res: Response): Promise<void> {
    try {
      const { path } = req.query;
      const pathArray = path ? (Array.isArray(path) ? path : [path]) : [];
      
      const result = await fileService.listFiles(pathArray as string[]);
      res.json(result);
    } catch (error) {
      console.error('Error in listFiles controller:', error);
      res.status(500).json({
        error: 'Failed to list files'
      });
    }
  }

  /**
   * Upload a file
   * @param req Request object
   * @param res Response object
   */
  async uploadFile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file provided' });
        return;
      }

      const { path } = req.body;
      const pathArray = path ? JSON.parse(path) : [];
      
      const file = await fileService.uploadFile(req.file, pathArray);
      res.status(201).json({
        file,
        message: 'File uploaded successfully'
      });
    } catch (error) {
      console.error('Error in uploadFile controller:', error);
      res.status(500).json({
        error: 'Failed to upload file'
      });
    }
  }

  /**
   * Create a new folder
   * @param req Request object
   * @param res Response object
   */
  async createFolder(req: Request, res: Response): Promise<void> {
    try {
      const { folderName, path } = req.body;
      
      if (!folderName) {
        res.status(400).json({ error: 'Folder name is required' });
        return;
      }

      const pathArray = path ? JSON.parse(path) : [];
      
      const folder = await fileService.createFolder(folderName, pathArray);
      res.status(201).json({
        folder,
        message: 'Folder created successfully'
      });
    } catch (error) {
      console.error('Error in createFolder controller:', error);
      res.status(500).json({
        error: 'Failed to create folder'
      });
    }
  }

  /**
   * Delete a file or folder
   * @param req Request object
   * @param res Response object
   */
  async deleteItem(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      
      if (!key) {
        res.status(400).json({ error: 'Item key is required' });
        return;
      }

      await fileService.deleteItem(key);
      res.json({ message: 'Item deleted successfully' });
    } catch (error) {
      console.error('Error in deleteItem controller:', error);
      res.status(500).json({
        error: 'Failed to delete item'
      });
    }
  }

  /**
   * Get download URL for a file
   * @param req Request object
   * @param res Response object
   */
  async getDownloadUrl(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      
      if (!key) {
        res.status(400).json({ error: 'File key is required' });
        return;
      }

      const url = await fileService.getDownloadUrl(key);
      res.json({ url });
    } catch (error) {
      console.error('Error in getDownloadUrl controller:', error);
      res.status(500).json({
        error: 'Failed to generate download URL'
      });
    }
  }

  /**
   * Get share URL for a file
   * @param req Request object
   * @param res Response object
   */
  async getShareUrl(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      const { expiresIn } = req.query;
      
      if (!key) {
        res.status(400).json({ error: 'File key is required' });
        return;
      }

      const expiration = expiresIn ? parseInt(expiresIn as string, 10) : 604800; // Default: 7 days
      const url = await fileService.getShareUrl(key, expiration);
      
      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expiration);
      
      res.json({
        url,
        expiresAt: expiresAt.toISOString()
      });
    } catch (error) {
      console.error('Error in getShareUrl controller:', error);
      res.status(500).json({
        error: 'Failed to generate share URL'
      });
    }
  }
}

export default new FileController();
