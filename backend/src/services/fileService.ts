import { s3 } from '../config/aws';
import config from '../config/config';
import path from 'path';

// Define file types directly in this file
export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: string;
  lastModified: string;
  starred: boolean;
  path?: string;
}

export interface FolderContent {
  files: FileItem[];
  path: string[];
}

class FileService {
  private bucketName: string;

  constructor() {
    this.bucketName = config.aws.s3BucketName;
  }

  /**
   * List files and folders in a directory
   * @param dirPath Array of path segments
   * @returns Promise with folder contents
   */
  async listFiles(dirPath: string[] = []): Promise<FolderContent> {
    try {
      const prefix = dirPath.length > 0 ? `${dirPath.join('/')}/` : '';
      const delimiter = '/';

      const params = {
        Bucket: this.bucketName,
        Prefix: prefix,
        Delimiter: delimiter
      };

      const data = await s3.listObjectsV2(params).promise();
      const files: FileItem[] = [];

      // Process common prefixes (folders)
      if (data.CommonPrefixes) {
        for (const commonPrefix of data.CommonPrefixes) {
          if (commonPrefix.Prefix) {
            const name = this.getNameFromPrefix(commonPrefix.Prefix);
            files.push({
              id: commonPrefix.Prefix,
              name,
              type: 'folder',
              size: '-',
              lastModified: new Date().toISOString().split('T')[0],
              starred: false,
              path: commonPrefix.Prefix
            });
          }
        }
      }

      // Process objects (files)
      if (data.Contents) {
        for (const content of data.Contents) {
          // Skip the directory itself
          if (content.Key === prefix) continue;

          const name = this.getNameFromKey(content.Key || '');
          files.push({
            id: content.Key || '',
            name,
            type: this.getFileType(name),
            size: this.formatFileSize(content.Size || 0),
            lastModified: content.LastModified ? content.LastModified.toISOString().split('T')[0] : '',
            starred: false,
            path: content.Key
          });
        }
      }

      return { files, path: dirPath };
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  }

  /**
   * Upload a file to S3
   * @param file File buffer and metadata
   * @param dirPath Directory path array
   * @returns Promise with uploaded file info
   */
  async uploadFile(file: Express.Multer.File, dirPath: string[] = []): Promise<FileItem> {
    try {
      const prefix = dirPath.length > 0 ? `${dirPath.join('/')}/` : '';
      const key = `${prefix}${file.originalname}`;

      const params = {
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
      };

      await s3.upload(params).promise();

      return {
        id: key,
        name: file.originalname,
        type: this.getFileType(file.originalname),
        size: this.formatFileSize(file.size),
        lastModified: new Date().toISOString().split('T')[0],
        starred: false,
        path: key
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Create a new folder in S3
   * @param folderName Name of the folder
   * @param dirPath Directory path array
   * @returns Promise with created folder info
   */
  async createFolder(folderName: string, dirPath: string[] = []): Promise<FileItem> {
    try {
      const prefix = dirPath.length > 0 ? `${dirPath.join('/')}/` : '';
      const key = `${prefix}${folderName}/`;

      const params = {
        Bucket: this.bucketName,
        Key: key,
        Body: ''
      };

      await s3.upload(params).promise();

      return {
        id: key,
        name: folderName,
        type: 'folder',
        size: '-',
        lastModified: new Date().toISOString().split('T')[0],
        starred: false,
        path: key
      };
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  }

  /**
   * Delete a file or folder from S3
   * @param key S3 object key
   * @returns Promise indicating success
   */
  async deleteItem(key: string): Promise<void> {
    try {
      if (key.endsWith('/')) {
        // It's a folder, delete all objects inside it
        await this.deleteFolder(key);
      } else {
        // It's a file, delete it directly
        const params = {
          Bucket: this.bucketName,
          Key: key
        };

        await s3.deleteObject(params).promise();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  }

  /**
   * Delete a folder and all its contents
   * @param prefix Folder prefix
   * @returns Promise indicating success
   */
  private async deleteFolder(prefix: string): Promise<void> {
    try {
      // List all objects in the folder
      const listParams = {
        Bucket: this.bucketName,
        Prefix: prefix
      };

      const listedObjects = await s3.listObjectsV2(listParams).promise();

      if (!listedObjects.Contents || listedObjects.Contents.length === 0) return;

      // Create delete params
      const deleteParams = {
        Bucket: this.bucketName,
        Delete: { Objects: [] as { Key: string }[] }
      };

      listedObjects.Contents.forEach(({ Key }) => {
        if (Key) {
          deleteParams.Delete.Objects.push({ Key });
        }
      });

      // Delete objects
      await s3.deleteObjects(deleteParams).promise();

      // If there are more objects to delete (pagination)
      if (listedObjects.IsTruncated) {
        await this.deleteFolder(prefix);
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw error;
    }
  }

  /**
   * Generate a pre-signed URL for downloading a file
   * @param key S3 object key
   * @returns Promise with the pre-signed URL
   */
  async getDownloadUrl(key: string): Promise<string> {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key,
        Expires: 3600 // URL expires in 1 hour
      };

      return s3.getSignedUrlPromise('getObject', params);
    } catch (error) {
      console.error('Error generating download URL:', error);
      throw error;
    }
  }

  /**
   * Generate a pre-signed URL for sharing a file
   * @param key S3 object key
   * @param expiresIn Expiration time in seconds
   * @returns Promise with the pre-signed URL
   */
  async getShareUrl(key: string, expiresIn: number = 604800): Promise<string> {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key,
        Expires: expiresIn // Default: 7 days
      };

      return s3.getSignedUrlPromise('getObject', params);
    } catch (error) {
      console.error('Error generating share URL:', error);
      throw error;
    }
  }

  /**
   * Extract folder name from S3 prefix
   * @param prefix S3 prefix
   * @returns Folder name
   */
  private getNameFromPrefix(prefix: string): string {
    // Remove trailing slash
    const withoutTrailingSlash = prefix.endsWith('/') ? prefix.slice(0, -1) : prefix;
    // Get the last part of the path
    const parts = withoutTrailingSlash.split('/');
    return parts[parts.length - 1];
  }

  /**
   * Extract file name from S3 key
   * @param key S3 key
   * @returns File name
   */
  private getNameFromKey(key: string): string {
    return path.basename(key);
  }

  /**
   * Determine file type from extension
   * @param fileName File name
   * @returns File type
   */
  private getFileType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
        return 'image';
      case 'mp4':
      case 'mov':
      case 'avi':
      case 'wmv':
        return 'video';
      case 'mp3':
      case 'wav':
      case 'ogg':
        return 'audio';
      case 'pdf':
        return 'pdf';
      case 'zip':
      case 'rar':
      case 'tar':
      case 'gz':
        return 'archive';
      case 'html':
      case 'css':
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
      case 'json':
        return 'code';
      case 'doc':
      case 'docx':
        return 'document';
      case 'xls':
      case 'xlsx':
        return 'spreadsheet';
      case 'ppt':
      case 'pptx':
        return 'presentation';
      default:
        return 'file';
    }
  }

  /**
   * Format file size for display
   * @param bytes File size in bytes
   * @returns Formatted file size
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}

export default new FileService();
