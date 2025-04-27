// This service would interact with AWS S3 for file operations
// For now, it's a mock implementation

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

// Mock data for file listing
const mockFiles: FileItem[] = [
  { id: '1', name: 'Documents', type: 'folder', size: '-', lastModified: '2023-04-10', starred: false },
  { id: '2', name: 'Images', type: 'folder', size: '-', lastModified: '2023-04-12', starred: true },
  { id: '3', name: 'Project Proposal.docx', type: 'document', size: '245 KB', lastModified: '2023-04-15', starred: false },
  { id: '4', name: 'Budget.xlsx', type: 'spreadsheet', size: '180 KB', lastModified: '2023-04-16', starred: false },
  { id: '5', name: 'Presentation.pptx', type: 'presentation', size: '2.4 MB', lastModified: '2023-04-17', starred: true },
  { id: '6', name: 'Profile Photo.jpg', type: 'image', size: '1.2 MB', lastModified: '2023-04-18', starred: false },
  { id: '7', name: 'Project Demo.mp4', type: 'video', size: '24.5 MB', lastModified: '2023-04-19', starred: false },
  { id: '8', name: 'Report.pdf', type: 'pdf', size: '3.2 MB', lastModified: '2023-04-20', starred: false },
  { id: '9', name: 'Archive.zip', type: 'archive', size: '15.7 MB', lastModified: '2023-04-21', starred: false },
  { id: '10', name: 'index.html', type: 'code', size: '12 KB', lastModified: '2023-04-22', starred: false },
];

// Mock data for folder contents
const mockFolderContents: Record<string, FileItem[]> = {
  '1': [ // Documents folder
    { id: '11', name: 'Project Documentation', type: 'folder', size: '-', lastModified: '2023-04-11', starred: false },
    { id: '12', name: 'Meeting Notes.docx', type: 'document', size: '125 KB', lastModified: '2023-04-14', starred: false },
    { id: '13', name: 'Research Paper.pdf', type: 'pdf', size: '2.8 MB', lastModified: '2023-04-16', starred: true },
  ],
  '2': [ // Images folder
    { id: '21', name: 'Vacation Photos', type: 'folder', size: '-', lastModified: '2023-04-13', starred: false },
    { id: '22', name: 'Logo.png', type: 'image', size: '450 KB', lastModified: '2023-04-15', starred: false },
    { id: '23', name: 'Banner.jpg', type: 'image', size: '1.5 MB', lastModified: '2023-04-17', starred: false },
  ],
};

class FileService {
  // Get files in the current directory
  async getFiles(path: string[] = []): Promise<FolderContent> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (path.length === 0) {
      return { files: mockFiles, path: [] };
    }
    
    // Find the folder ID based on the path
    let currentFiles = mockFiles;
    let folderId = '';
    
    for (const folderName of path) {
      const folder = currentFiles.find(f => f.name === folderName && f.type === 'folder');
      if (!folder) {
        throw new Error(`Folder not found: ${folderName}`);
      }
      folderId = folder.id;
      currentFiles = mockFolderContents[folderId] || [];
    }
    
    return { files: mockFolderContents[folderId] || [], path };
  }

  // Upload a file
  async uploadFile(file: File, path: string[] = []): Promise<FileItem> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real implementation, this would upload to S3
    const newFile: FileItem = {
      id: `new-${Date.now()}`,
      name: file.name,
      type: this.getFileType(file.name),
      size: this.formatFileSize(file.size),
      lastModified: new Date().toISOString().split('T')[0],
      starred: false,
    };
    
    return newFile;
  }

  // Create a new folder
  async createFolder(folderName: string, path: string[] = []): Promise<FileItem> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real implementation, this would create a folder in S3
    const newFolder: FileItem = {
      id: `folder-${Date.now()}`,
      name: folderName,
      type: 'folder',
      size: '-',
      lastModified: new Date().toISOString().split('T')[0],
      starred: false,
    };
    
    return newFolder;
  }

  // Delete a file or folder
  async deleteItem(itemId: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real implementation, this would delete from S3
    console.log(`Deleted item with ID: ${itemId}`);
  }

  // Download a file
  async downloadFile(itemId: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real implementation, this would generate a signed URL from S3
    console.log(`Downloaded item with ID: ${itemId}`);
  }

  // Toggle star status
  async toggleStar(itemId: string, starred: boolean): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // In a real implementation, this would update metadata in DynamoDB
    console.log(`Toggled star for item with ID: ${itemId} to ${starred}`);
  }

  // Helper method to determine file type from extension
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

  // Helper method to format file size
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}

export default new FileService();
