import { useState } from 'react';
import { 
  CssBaseline, 
  ThemeProvider, 
  createTheme,
  AppBar, 
  Toolbar, 
  Typography, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Divider,
  useMediaQuery,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Folder as FolderIcon,
  Star as StarIcon,
  Storage as StorageIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import FileExplorer from './components/FileExplorer';
import StarredItems from './components/StarredItems';
import { useAuth } from './context/AuthContext';
import './App.css';

// Create a theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

// Drawer width is defined in CSS

function FileManagerApp() {
  const { user, logout } = useAuth();
  const [view, setView] = useState<'explorer' | 'starred'>('explorer');
  // We'll keep the currentDirectory state even though it's not directly used in this component
  // It will be needed if we want to pass it to child components in the future
  const [, setCurrentDirectory] = useState<string>('root');
  const [currentDirectoryName, setCurrentDirectoryName] = useState<string>('Home');
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleNavigateToDirectory = (dirId: string, dirName: string) => {
    setCurrentDirectory(dirId);
    setCurrentDirectoryName(dirName);
    setView('explorer');
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  };

  const handleViewChange = (newView: 'explorer' | 'starred') => {
    setView(newView);
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  };
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const drawer = (
    <>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          AWS File Manager
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton 
            selected={view === 'explorer'} 
            onClick={() => handleViewChange('explorer')}
          >
            <ListItemIcon>
              <FolderIcon />
            </ListItemIcon>
            <ListItemText primary="My Files" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton 
            selected={view === 'starred'} 
            onClick={() => handleViewChange('starred')}
          >
            <ListItemIcon>
              <StarIcon />
            </ListItemIcon>
            <ListItemText primary="Starred" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <div className="storage-info">
        <Typography variant="body2" color="text.secondary">
          Local Storage
        </Typography>
        <div className="storage-container">
          <StorageIcon className="storage-icon" />
          <Typography variant="body2">Local Disk</Typography>
        </div>
      </div>
    </>
  );

  return (
    <ThemeProvider theme={theme}>
      <div className="app-container">
        <CssBaseline />
        
        {/* App Bar */}
        <AppBar
          position="fixed"
          className="app-bar"
        >
          <Toolbar>
            <Typography variant="h6" noWrap component="div" className="toolbar-title">
              {view === 'explorer' ? currentDirectoryName : 'Starred Items'}
            </Typography>
            
            {/* User menu */}
            <div className="user-menu">
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                aria-label="account"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenuOpen}
              >
                <AccountCircleIcon />
              </IconButton>
              <Typography variant="body1" className="user-name">
                {user?.name}
              </Typography>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon fontSize="small" className="menu-icon" />
                  Logout
                </MenuItem>
              </Menu>
            </div>
          </Toolbar>
        </AppBar>
        
        {/* Drawer */}
        <div className="drawer">

          {/* Mobile drawer */}
          {isMobile ? (
            <Drawer
              variant="temporary"
              open={mobileDrawerOpen}
              onClose={() => setMobileDrawerOpen(false)}
              ModalProps={{
                keepMounted: true, // Better open performance on mobile
              }}
              classes={{
                paper: 'drawer-paper'
              }}
              sx={{ display: { xs: 'block', sm: 'none' } }}
            >
              {drawer}
            </Drawer>
          ) : (
            /* Desktop drawer */
            <Drawer
              variant="permanent"
              classes={{
                paper: 'drawer-paper'
              }}
              sx={{ display: { xs: 'none', sm: 'block' } }}
              open
            >
              {drawer}
            </Drawer>
          )}
        </div>
        
        {/* Main content */}
        <main className="main-content">
          {view === 'explorer' ? (
            <FileExplorer />
          ) : (
            <StarredItems onNavigateToDirectory={handleNavigateToDirectory} />
          )}
        </main>
      </div>
    </ThemeProvider>
  );
}

export default FileManagerApp;
