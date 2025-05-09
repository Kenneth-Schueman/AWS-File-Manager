import React, { useState } from 'react';
import { 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle,
  TextField,
  IconButton
} from '@mui/material';
import {
  Close as CloseIcon
} from '@mui/icons-material';
import FileService from '../services/FileService';

interface NewFolderProps {
  open: boolean;
  onClose: () => void;
  currentPath: string[];
  onFolderCreated: () => void;
}

const NewFolder: React.FC<NewFolderProps> = ({ 
  open, 
  onClose, 
  currentPath,
  onFolderCreated 
}) => {
  const [folderName, setFolderName] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!folderName.trim()) {
      setError('Folder name cannot be empty');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      await FileService.createFolder(folderName, currentPath);
      setFolderName('');
      onFolderCreated();
      onClose();
    } catch (error) {
      console.error('Error creating folder:', error);
      setError('Failed to create folder. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setFolderName('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        Create New Folder
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="folderName"
          label="Folder Name"
          type="text"
          fullWidth
          variant="outlined"
          value={folderName}
          onChange={(e) => {
            setFolderName(e.target.value);
            if (e.target.value.trim()) {
              setError('');
            }
          }}
          error={!!error}
          helperText={error}
          disabled={isCreating}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isCreating}>
          Cancel
        </Button>
        <Button 
          onClick={handleCreate} 
          variant="contained" 
          disabled={isCreating}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewFolder;
