import React, { useState, useEffect } from 'react';
import './FileExplorer.css';
import { 
  Typography, 
  Button, 
  Breadcrumbs, 
  Link, 
  List, 
  Divider, 
  CircularProgress, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Snackbar, 
  Alert 
} from '@mui/material';
import { 
  CreateNewFolder as CreateNewFolderIcon,
  CloudUpload as CloudUploadIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import FileItem from './FileItem';
import { 
  getItems, 
  createDirectory, 
  uploadFiles
} from '../services/api';
import type { 
  FileItem as FileItemType, 
  DirectoryItem 
} from '../services/api';

interface BreadcrumbItem {
  id: string;
  name: string;
}

const FileExplorer: React.FC = () => {
  const [currentDirectory, setCurrentDirectory] = useState<string>('root');
  const [directoryPath, setDirectoryPath] = useState<BreadcrumbItem[]>([{ id: 'root', name: 'Home' }]);
  const [files, setFiles] = useState<FileItemType[]>([]);
  const [directories, setDirectories] = useState<DirectoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [createFolderOpen, setCreateFolderOpen] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [shareDialogOpen, setShareDialogOpen] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [notification, setNotification] = useState<{ open: boolean; message: string; type: 'success' | 'error' }>({
    open: false,
    message: '',
    type: 'success'
  });
  
  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await getItems(currentDirectory);
      setFiles(data.files);
      setDirectories(data.directories);
    } catch (error) {
      console.error('Error fetching items:', error);
      showNotification('Failed to load files and folders', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchItems();
  }, [currentDirectory]);
  
  const navigateToDirectory = (dirId: string, dirName: string) => {
    setCurrentDirectory(dirId);
    
    if (dirId === 'root') {
      setDirectoryPath([{ id: 'root', name: 'Home' }]);
    } else {
      setDirectoryPath([...directoryPath, { id: dirId, name: dirName }]);
    }
  };
  
  const navigateUp = () => {
    if (directoryPath.length > 1) {
      const newPath = [...directoryPath];
      newPath.pop();
      setDirectoryPath(newPath);
      setCurrentDirectory(newPath[newPath.length - 1].id);
    }
  };
  
  const navigateToBreadcrumb = (index: number) => {
    const newPath = directoryPath.slice(0, index + 1);
    setDirectoryPath(newPath);
    setCurrentDirectory(newPath[newPath.length - 1].id);
  };
  
  const handleCreateFolder = () => {
    setCreateFolderOpen(true);
  };
  
  const handleCreateFolderClose = () => {
    setCreateFolderOpen(false);
    setNewFolderName('');
  };
  
  const handleCreateFolderSubmit = async () => {
    if (!newFolderName.trim()) {
      return;
    }
    
    try {
      await createDirectory(newFolderName, currentDirectory);
      showNotification(`Folder "${newFolderName}" created successfully`, 'success');
      fetchItems();
    } catch (error) {
      console.error('Error creating folder:', error);
      showNotification('Failed to create folder', 'error');
    }
    
    handleCreateFolderClose();
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList) return;
    
    const files = Array.from(fileList);
    handleUploadFiles(files);
    
    // Reset the input
    event.target.value = '';
  };
  
  const handleUploadFiles = async (files: File[]) => {
    try {
      await uploadFiles(files, currentDirectory);
      showNotification(`${files.length} file(s) uploaded successfully`, 'success');
      fetchItems();
    } catch (error) {
      console.error('Error uploading files:', error);
      showNotification('Failed to upload files', 'error');
    }
  };
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    
    if (event.dataTransfer.files.length > 0) {
      const files = Array.from(event.dataTransfer.files);
      handleUploadFiles(files);
    }
  };
  
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };
  
  const handleItemDeleted = () => {
    fetchItems();
    showNotification('Item deleted successfully', 'success');
  };
  
  const handleItemStarred = (item: FileItemType | DirectoryItem) => {
    // Update the item in the local state
    if ('type' in item) {
      // It's a file
      setFiles(prevFiles => 
        prevFiles.map(file => 
          file.id === item.id ? { ...file, starred: item.starred } : file
        )
      );
    } else {
      // It's a directory
      setDirectories(prevDirs => 
        prevDirs.map(dir => 
          dir.id === item.id ? { ...dir, starred: item.starred } : dir
        )
      );
    }
    
    showNotification(
      item.starred ? 'Item added to starred' : 'Item removed from starred',
      'success'
    );
  };
  
  const handleShareLink = (url: string) => {
    setShareUrl(url);
    setShareDialogOpen(true);
  };
  
  const handleShareDialogClose = () => {
    setShareDialogOpen(false);
  };
  
  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    showNotification('Share link copied to clipboard', 'success');
    handleShareDialogClose();
  };
  
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({
      open: true,
      message,
      type
    });
  };
  
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };
  
  return (
    <div
      className="file-explorer-container"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="breadcrumb-container">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={navigateUp}
          disabled={directoryPath.length <= 1}
          className="back-button"
        >
          Back
        </Button>
        <Breadcrumbs aria-label="breadcrumb">
          {directoryPath.map((item, index) => (
            <Link
              key={item.id}
              color={index === directoryPath.length - 1 ? 'text.primary' : 'inherit'}
              onClick={() => navigateToBreadcrumb(index)}
              className={index === directoryPath.length - 1 ? 'breadcrumb-current' : 'breadcrumb-link'}
              underline="hover"
            >
              {item.name}
            </Link>
          ))}
        </Breadcrumbs>
      </div>
      
      <div className="action-buttons">
        <Button
          variant="contained"
          startIcon={<CreateNewFolderIcon />}
          onClick={handleCreateFolder}
        >
          New Folder
        </Button>
        <Button
          variant="contained"
          component="label"
          startIcon={<CloudUploadIcon />}
        >
          Upload Files
          <input
            type="file"
            multiple
            hidden
            onChange={handleFileUpload}
          />
        </Button>
      </div>
      
      <div className="content-container">
        {loading ? (
          <div className="loading-container">
            <CircularProgress />
          </div>
        ) : directories.length === 0 && files.length === 0 ? (
          <div className="empty-message">
            <Typography variant="body1" color="text.secondary">
              This folder is empty. Upload files or create a new folder.
            </Typography>
          </div>
        ) : (
          <List>
            {directories.length > 0 && (
              <>
                <Typography variant="subtitle2" color="text.secondary" sx={{ ml: 2, mb: 1 }}>
                  Folders
                </Typography>
                {directories.map((directory) => (
                  <FileItem
                    key={directory.id}
                    item={directory}
                    type="directory"
                    onNavigate={() => navigateToDirectory(directory.id, directory.name)}
                    onItemDeleted={handleItemDeleted}
                    onItemStarred={handleItemStarred}
                  />
                ))}
                {files.length > 0 && <Divider className="section-divider" />}
              </>
            )}
            
            {files.length > 0 && (
              <>
                <Typography variant="subtitle2" color="text.secondary" sx={{ ml: 2, mb: 1 }}>
                  Files
                </Typography>
                {files.map((file) => (
                  <FileItem
                    key={file.id}
                    item={file}
                    type="file"
                    onItemDeleted={handleItemDeleted}
                    onItemStarred={handleItemStarred}
                    onShareLink={handleShareLink}
                  />
                ))}
              </>
            )}
          </List>
        )}
      </div>
      
      {/* Create Folder Dialog */}
      <Dialog open={createFolderOpen} onClose={handleCreateFolderClose}>
        <DialogTitle className="dialog-title">Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            type="text"
            fullWidth
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateFolderClose}>Cancel</Button>
          <Button onClick={handleCreateFolderSubmit} color="primary">Create</Button>
        </DialogActions>
      </Dialog>
      
      {/* Share Link Dialog */}
      <Dialog open={shareDialogOpen} onClose={handleShareDialogClose}>
        <DialogTitle className="dialog-title">Share File</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Share Link"
            type="text"
            fullWidth
            value={shareUrl}
            InputProps={{
              readOnly: true,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleShareDialogClose}>Close</Button>
          <Button onClick={copyShareLink} color="primary">Copy Link</Button>
        </DialogActions>
      </Dialog>
      
      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        className="notification"
      >
        <Alert onClose={handleCloseNotification} severity={notification.type} className="alert-message">
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default FileExplorer;
