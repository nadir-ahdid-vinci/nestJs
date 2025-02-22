import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
  Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useContext } from 'react';
import { ColorModeContext } from '../App';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const menuItems = [
    { text: 'Accueil', path: '/' },
    { text: 'À propos', path: '/about' },
    { text: 'Services', path: '/services' },
    { text: 'Contact', path: '/contact' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      <AppBar className={theme.palette.mode === 'dark' ? 'bg-gray-900' : 'bg-white'}>
        <Toolbar className="container mx-auto">
          {isMobile && (
            <IconButton
              color="primary"
              edge="start"
              onClick={handleDrawerToggle}
              className="mr-2"
            >
              <MenuIcon />
            </IconButton>
          )}
          <RouterLink 
            to="/" 
            className={`text-xl font-bold no-underline ${
              theme.palette.mode === 'dark' ? 'text-white' : 'text-gray-800'
            }`}
          >
            MonSite
          </RouterLink>
          {!isMobile && (
            <div className="ml-auto flex items-center space-x-4">
              {menuItems.map((item) => (
                <RouterLink
                  key={item.text}
                  to={item.path}
                  className={`px-4 py-2 rounded-md hover:bg-gray-100 transition-colors no-underline ${
                    theme.palette.mode === 'dark' 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {item.text}
                </RouterLink>
              ))}
              <Tooltip title={`Mode ${theme.palette.mode === 'dark' ? 'clair' : 'sombre'}`}>
                <IconButton 
                  onClick={colorMode.toggleColorMode} 
                  color="inherit"
                  className={theme.palette.mode === 'dark' ? 'text-white' : 'text-gray-800'}
                >
                  {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>
            </div>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        classes={{
          paper: `w-64 ${theme.palette.mode === 'dark' ? 'bg-gray-900' : 'bg-white'}`,
        }}
      >
        <List className="pt-14">
          {menuItems.map((item) => (
            <ListItem
              button
              component={RouterLink}
              to={item.path}
              key={item.text}
              onClick={handleDrawerToggle}
              className={`hover:bg-gray-100 ${
                theme.palette.mode === 'dark' ? 'hover:bg-gray-800' : ''
              }`}
            >
              <ListItemText 
                primary={item.text} 
                className={theme.palette.mode === 'dark' ? 'text-white' : 'text-gray-700'}
              />
            </ListItem>
          ))}
          <ListItem>
            <IconButton 
              onClick={colorMode.toggleColorMode} 
              color="inherit"
              className={theme.palette.mode === 'dark' ? 'text-white' : 'text-gray-800'}
            >
              {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default Navbar;