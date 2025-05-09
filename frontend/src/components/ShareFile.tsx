import React, { useState } from 'react';
import { 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle,
  TextField,
  IconButton,
  Typography,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import { FileItem } from '../services/FileService';

interface ShareFileProps {
  open: boolean;
  onClose: () => void;
  file: FileItem | null;
}

const ShareFile: React.FC<ShareFileProps> = ({ 
  open, 
  onClose, 
  file
}) => {
  const [emails, setEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState('');
  const [permission, setPermission] = useState('view');
  const [shareLink, setShareLink] = useState('https://aws-file-manager.example.com/share/abc123');
  const [linkCopied, setLinkCopied] = useState(false);

  const handleAddEmail = () => {
    if (currentEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentEmail)) {
      if (!emails.includes(currentEmail)) {
        setEmails([...emails, currentEmail]);
      }
      setCurrentEmail('');
    }
  };

  const handleRemoveEmail = (email: string) => {
    setEmails(emails.filter(e => e !== email));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmail();
    }
  };

  const handlePermissionChange = (event: SelectChangeEvent) => {
    setPermission(event.target.value);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  const handleShare = () => {
    // In a real app, this would call an API to share the file
    console.log(`Sharing ${file?.name} with ${emails.join(', ')} with ${permission} permission`);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Share {file?.name}
        <IconButton
          aria-label="close"
          onClick={onClose}
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
        <Typography variant="subtitle1" gutterBottom>
          Share with people
        </Typography>
        <Box sx={{ display: 'flex', mb: 2 }}>
          <TextField
            fullWidth
            label="Email address"
            variant="outlined"
            size="small"
            value={currentEmail}
            onChange={(e) => setCurrentEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{ mr: 1 }}
          />
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel id="permission-label">Permission</InputLabel>
            <Select
              labelId="permission-label"
              id="permission-select"
              value={permission}
              label="Permission"
              onChange={handlePermissionChange}
            >
              <MenuItem value="view">Viewer</MenuItem>
              <MenuItem value="comment">Commenter</MenuItem>
              <MenuItem value="edit">Editor</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          {emails.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {emails.map((email) => (
                <Chip
                  key={email}
                  label={email}
                  onDelete={() => handleRemoveEmail(email)}
                  size="small"
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No people added yet
            </Typography>
          )}
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle1" gutterBottom>
          Get shareable link
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            value={shareLink}
            InputProps={{
              readOnly: true,
            }}
            sx={{ mr: 1 }}
          />
          <Button 
            variant="outlined" 
            startIcon={<CopyIcon />}
            onClick={handleCopyLink}
          >
            {linkCopied ? 'Copied!' : 'Copy'}
          </Button>
        </Box>
        <FormControl sx={{ minWidth: 200, mt: 1 }} size="small">
          <InputLabel id="link-permission-label">Link Permission</InputLabel>
          <Select
            labelId="link-permission-label"
            id="link-permission-select"
            value={permission}
            label="Link Permission"
            onChange={handlePermissionChange}
          >
            <MenuItem value="view">Anyone with the link can view</MenuItem>
            <MenuItem value="comment">Anyone with the link can comment</MenuItem>
            <MenuItem value="edit">Anyone with the link can edit</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleShare} 
          variant="contained"
          disabled={emails.length === 0}
        >
          Share
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareFile;
