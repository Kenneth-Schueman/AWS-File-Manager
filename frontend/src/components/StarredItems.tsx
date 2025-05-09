import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  Paper, 
  Snackbar, 
  Alert,
  CircularProgress
} from '@mui/material';
import FileItem from './FileItem';
import { 
  getStarredItems
} from '../services/api';
import type { 
  FileItem as FileItemType, 
  DirectoryItem 
} from '../services/api';

interface StarredItemsProps {
  onNavigateToDirectory: (dirId: string, dirName: string) => void;
}

const StarredItems: React.FC<StarredItemsProps> = ({ onNavigateToDirectory }) => {
  const [files, setFiles] = useState<FileItemType[]>([]);
  const [directories, setDirectories] = useState<DirectoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<{ open: boolean; message: string; type: 'success' | 'error' }>({
    open: false,
    message: '',
    type: 'success'
  });
  
  const fetchStarredItems = async () => {
    setLoading(true);
    try {
      const data = await getStarredItems();
      setFiles(data.files);
      setDirectories(data.directories);
    } catch (error) {
      console.error('Error fetching starred items:', error);
      showNotification('Failed to load starred items', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchStarredItems();
  }, []);
  
  const handleItemDeleted = () => {
    fetchStarredItems();
    showNotification('Item deleted successfully', 'success');
  };
  
  const handleItemStarred = (item: FileItemType | DirectoryItem) => {
    if (!item.starred) {
      // If the item is unstarred, remove it from the list
      if ('type' in item) {
        // It's a file
        setFiles(prevFiles => prevFiles.filter(file => file.id !== item.id));
      } else {
        // It's a directory
        setDirectories(prevDirs => prevDirs.filter(dir => dir.id !== item.id));
      }
    }
    
    showNotification(
      item.starred ? 'Item added to starred' : 'Item removed from starred',
      'success'
    );
  };
  
  const handleShareLink = (url: string) => {
    navigator.clipboard.writeText(url);
    showNotification('Share link copied to clipboard', 'success');
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
  
  const handleNavigateToDirectory = (dirId: string) => {
    const directory = directories.find(dir => dir.id === dirId);
    if (directory) {
      onNavigateToDirectory(dirId, directory.name);
    }
  };
  
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        p: 3,
        bgcolor: 'background.default'
      }}
    >
      <Typography variant="h5" sx={{ mb: 3 }}>Starred Items</Typography>
      
      <Paper 
        elevation={1} 
        sx={{ 
          flexGrow: 1, 
          overflow: 'auto',
          p: 2,
          borderRadius: 2,
          bgcolor: 'background.paper'
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : directories.length === 0 && files.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No starred items yet. Star items to see them here.
            </Typography>
          </Box>
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
                    onNavigate={handleNavigateToDirectory}
                    onItemDeleted={handleItemDeleted}
                    onItemStarred={handleItemStarred}
                  />
                ))}
              </>
            )}
            
            {files.length > 0 && (
              <>
                {directories.length > 0 && (
                  <Typography variant="subtitle2" color="text.secondary" sx={{ ml: 2, mb: 1, mt: 2 }}>
                    Files
                  </Typography>
                )}
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
      </Paper>
      
      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.type} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StarredItems;
