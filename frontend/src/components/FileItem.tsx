import React, { useState } from 'react';
import { 
  ListItem, 
  ListItemAvatar, 
  Avatar, 
  ListItemText, 
  ListItemSecondaryAction,
  IconButton,
  Menu,
  MenuItem,
  Typography
} from '@mui/material';
import {
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  MoreVert as MoreVertIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  GetApp as DownloadIcon
} from '@mui/icons-material';
import { downloadFile, toggleStarItem, shareFile, deleteItem } from '../services/api';
import type { FileItem, DirectoryItem } from '../services/api';

interface FileItemProps {
  item: FileItem | DirectoryItem;
  type: 'file' | 'directory';
  onNavigate?: (dirId: string) => void;
  onItemDeleted: () => void;
  onItemStarred: (item: FileItem | DirectoryItem) => void;
  onShareLink?: (shareUrl: string) => void;
}

const FileItemComponent: React.FC<FileItemProps> = ({ 
  item, 
  type, 
  onNavigate, 
  onItemDeleted,
  onItemStarred,
  onShareLink
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleItemClick = () => {
    if (type === 'directory' && onNavigate) {
      onNavigate(item.id);
    }
  };
  
  const handleDownload = async () => {
    if (type === 'file') {
      downloadFile(item.id);
    }
    handleMenuClose();
  };
  
  const handleToggleStar = async () => {
    try {
      const updatedItem = await toggleStarItem(type, item.id, !item.starred);
      onItemStarred(updatedItem);
    } catch (error) {
      console.error('Error toggling star:', error);
    }
    handleMenuClose();
  };
  
  const handleShare = async () => {
    if (type === 'file') {
      try {
        const response = await shareFile(item.id);
        setShareUrl(response.shareUrl);
        if (onShareLink) {
          onShareLink(response.shareUrl);
        }
      } catch (error) {
        console.error('Error sharing file:', error);
      }
    }
    handleMenuClose();
  };
  
  const handleDelete = async () => {
    try {
      await deleteItem(type, item.id);
      onItemDeleted();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
    handleMenuClose();
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const getSecondaryText = () => {
    if (type === 'file') {
      const fileItem = item as FileItem;
      return `${fileItem.type.toUpperCase()} • ${formatFileSize(fileItem.size)}`;
    }
    return 'Folder';
  };
  
  return (
    <ListItem onClick={handleItemClick} sx={{ borderRadius: 1, mb: 0.5 }}>
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: type === 'directory' ? 'primary.light' : 'secondary.light' }}>
          {type === 'directory' ? <FolderIcon /> : <FileIcon />}
        </Avatar>
      </ListItemAvatar>
      <ListItemText 
        primary={item.name} 
        secondary={getSecondaryText()}
      />
      <ListItemSecondaryAction>
        <IconButton edge="end" onClick={handleToggleStar} size="small">
          {item.starred ? <StarIcon color="warning" /> : <StarBorderIcon />}
        </IconButton>
        <IconButton edge="end" onClick={handleMenuOpen} size="small">
          <MoreVertIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {type === 'file' && (
            <MenuItem onClick={handleDownload}>
              <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="inherit">Download</Typography>
            </MenuItem>
          )}
          <MenuItem onClick={handleToggleStar}>
            {item.starred ? (
              <>
                <StarBorderIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="inherit">Remove Star</Typography>
              </>
            ) : (
              <>
                <StarIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="inherit">Add Star</Typography>
              </>
            )}
          </MenuItem>
          {type === 'file' && (
            <MenuItem onClick={handleShare}>
              <ShareIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="inherit">Share</Typography>
            </MenuItem>
          )}
          <MenuItem onClick={handleDelete}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="inherit">Delete</Typography>
          </MenuItem>
        </Menu>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default FileItemComponent;
