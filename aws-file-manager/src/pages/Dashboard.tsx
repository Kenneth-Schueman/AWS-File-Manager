import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  AppBar, 
  Toolbar, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Button, 
  TextField, 
  InputAdornment,
  Paper,
  Menu,
  MenuItem,
  Avatar,
  Breadcrumbs,
  Link,
  Grid,
  Card,
  CardContent,
  CardActions,
  CircularProgress
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  CloudUpload as CloudUploadIcon,
  CreateNewFolder as CreateNewFolderIcon,
  Folder as FolderIcon,
  Description as FileIcon,
  Image as ImageIcon,
  Movie as VideoIcon,
  AudioFile as AudioIcon,
  PictureAsPdf as PdfIcon,
  Archive as ArchiveIcon,
  Code as CodeIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  GetApp as DownloadIcon,
  Share as ShareIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Home as HomeIcon,
  Logout as LogoutIcon,
  ViewList as ListViewIcon,
  ViewModule as GridViewIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import FileService, { FileItem } from '../services/FileService';
import FileUpload from '../components/FileUpload';
import NewFolder from '../components/NewFolder';
import ShareFile from '../components/ShareFile';

// Helper function to get the appropriate icon for each file type
const getFileIcon = (type: string) => {
  switch (type) {
    case 'folder':
      return <FolderIcon color="primary" />;
    case 'image':
      return <ImageIcon color="secondary" />;
    case 'video':
      return <VideoIcon color="error" />;
    case 'audio':
      return <AudioIcon color="warning" />;
    case 'pdf':
      return <PdfIcon color="error" />;
    case 'archive':
      return <ArchiveIcon color="warning" />;
    case 'code':
      return <CodeIcon color="info" />;
    case 'document':
    case 'spreadsheet':
    case 'presentation':
    default:
      return <FileIcon color="action" />;
  }
};

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileMenuAnchor, setFileMenuAnchor] = useState<null | HTMLElement>(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedFileForAction, setSelectedFileForAction] = useState<FileItem | null>(null);

  // Fetch files when component mounts or path changes
  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      try {
        const result = await FileService.getFiles(currentPath);
        setFiles(result.files);
      } catch (error) {
        console.error('Error fetching files:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [currentPath]);

  // Filter files based on search query
  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleFileClick = (fileId: string, fileType: string) => {
    if (fileType === 'folder') {
      // Navigate into folder
      const folder = files.find(f => f.id === fileId);
      if (folder) {
        setCurrentPath([...currentPath, folder.name]);
      }
    } else {
      // Select file
      setSelectedFile(selectedFile === fileId ? null : fileId);
    }
  };

  const handleFileMenuOpen = (event: React.MouseEvent<HTMLElement>, fileId: string) => {
    event.stopPropagation();
    const file = files.find(f => f.id === fileId);
    if (file) {
      setSelectedFileForAction(file);
      setSelectedFile(fileId);
      setFileMenuAnchor(event.currentTarget);
    }
  };

  const handleFileMenuClose = () => {
    setFileMenuAnchor(null);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleStarToggle = async (fileId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const file = files.find(f => f.id === fileId);
    if (file) {
      try {
        await FileService.toggleStar(fileId, !file.starred);
        setFiles(files.map(f => 
          f.id === fileId ? { ...f, starred: !f.starred } : f
        ));
      } catch (error) {
        console.error('Error toggling star:', error);
      }
    }
  };

  const handleNavigateToPath = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
  };

  const handleUploadClick = () => {
    setUploadDialogOpen(true);
  };

  const handleCreateFolder = () => {
    setNewFolderDialogOpen(true);
  };

  const handleShareFile = () => {
    setShareDialogOpen(true);
    handleFileMenuClose();
  };

  const handleDownloadFile = async () => {
    if (selectedFileForAction) {
      try {
        await FileService.downloadFile(selectedFileForAction.id);
        // In a real app, this would trigger a file download
      } catch (error) {
        console.error('Error downloading file:', error);
      }
    }
    handleFileMenuClose();
  };

  const handleDeleteFile = async () => {
    if (selectedFileForAction) {
      try {
        await FileService.deleteItem(selectedFileForAction.id);
        setFiles(files.filter(f => f.id !== selectedFileForAction.id));
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
    handleFileMenuClose();
  };

  const handleViewModeToggle = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  };

  const handleRefreshFiles = async () => {
    setLoading(true);
    try {
      const result = await FileService.getFiles(currentPath);
      setFiles(result.files);
    } catch (error) {
      console.error('Error refreshing files:', error);
    } finally {
      setLoading(false);
    }
  };

  const drawerWidth = 240;

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          AWS File Manager
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItem onClick={() => setCurrentPath([])}>
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="My Files" />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <StarIcon />
          </ListItemIcon>
          <ListItemText primary="Starred" />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <ShareIcon />
          </ListItemIcon>
          <ListItemText primary="Shared with me" />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            AWS File Manager
          </Typography>
          <TextField
            placeholder="Search files..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ 
              mr: 2, 
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderRadius: 1,
              '& .MuiInputBase-input': { color: 'white' },
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'white' }} />
                </InputAdornment>
              ),
            }}
          />
          <IconButton color="inherit" onClick={handleViewModeToggle} sx={{ mr: 1 }}>
            {viewMode === 'grid' ? <ListViewIcon /> : <GridViewIcon />}
          </IconButton>
          <IconButton color="inherit" onClick={handleUserMenuOpen}>
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.username.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={handleUserMenuClose}
          >
            <MenuItem disabled>
              <Typography variant="body2">{user?.email}</Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        {drawer}
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link 
              color="inherit" 
              href="#" 
              onClick={() => setCurrentPath([])}
              underline="hover"
            >
              Home
            </Link>
            {currentPath.map((path, index) => (
              <Link
                key={index}
                color={index === currentPath.length - 1 ? "text.primary" : "inherit"}
                href="#"
                onClick={() => handleNavigateToPath(index)}
                underline="hover"
              >
                {path}
              </Link>
            ))}
          </Breadcrumbs>
          <Box>
            <Button 
              variant="contained" 
              startIcon={<CloudUploadIcon />}
              onClick={handleUploadClick}
              sx={{ mr: 1 }}
            >
              Upload
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<CreateNewFolderIcon />}
              onClick={handleCreateFolder}
            >
              New Folder
            </Button>
          </Box>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredFiles.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              {searchQuery ? 'No files match your search' : 'This folder is empty'}
            </Typography>
            {!searchQuery && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Upload files or create a new folder to get started
              </Typography>
            )}
          </Paper>
        ) : viewMode === 'grid' ? (
          <Grid container spacing={2}>
            {filteredFiles.map((file) => (
              <Grid key={file.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    bgcolor: selectedFile === file.id ? 'action.selected' : 'background.paper',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                  onClick={() => handleFileClick(file.id, file.type)}
                >
                  <CardContent sx={{ pb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {getFileIcon(file.type)}
                      <Typography variant="body1" sx={{ ml: 1, flexGrow: 1, fontWeight: 'medium' }}>
                        {file.name}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={(e) => handleStarToggle(file.id, e)}
                      >
                        {file.starred ? <StarIcon color="warning" /> : <StarBorderIcon />}
                      </IconButton>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {file.size} • {file.lastModified}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleFileMenuOpen(e, file.id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper>
            <List>
              {filteredFiles.map((file) => (
                <ListItem 
                  key={file.id}
                  sx={{ 
                    bgcolor: selectedFile === file.id ? 'action.selected' : 'inherit',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                  onClick={() => handleFileClick(file.id, file.type)}
                >
                  <ListItemIcon>
                    {getFileIcon(file.type)}
                  </ListItemIcon>
                  <ListItemText 
                    primary={file.name} 
                    secondary={`${file.size} • ${file.lastModified}`} 
                  />
                  <IconButton 
                    size="small" 
                    onClick={(e) => handleStarToggle(file.id, e)}
                  >
                    {file.starred ? <StarIcon color="warning" /> : <StarBorderIcon />}
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={(e) => handleFileMenuOpen(e, file.id)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
        
        <Menu
          anchorEl={fileMenuAnchor}
          open={Boolean(fileMenuAnchor)}
          onClose={handleFileMenuClose}
        >
          <MenuItem onClick={handleDownloadFile}>
            <ListItemIcon>
              <DownloadIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Download</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleShareFile}>
            <ListItemIcon>
              <ShareIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Share</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleDeleteFile}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>
        
        {/* File Upload Dialog */}
        <FileUpload 
          open={uploadDialogOpen} 
          onClose={() => setUploadDialogOpen(false)}
          currentPath={currentPath}
          onUploadComplete={handleRefreshFiles}
        />
        
        {/* New Folder Dialog */}
        <NewFolder
          open={newFolderDialogOpen}
          onClose={() => setNewFolderDialogOpen(false)}
          currentPath={currentPath}
          onFolderCreated={handleRefreshFiles}
        />
        
        {/* Share File Dialog */}
        <ShareFile
          open={shareDialogOpen}
          onClose={() => setShareDialogOpen(false)}
          file={selectedFileForAction}
        />
      </Box>
    </Box>
  );
};

export default Dashboard;
