import React from 'react';
import { useTranslation } from 'react-i18next'
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderOpenIcon from '@mui/icons-material/FolderOutlined';
import BookmarkIcon from '@mui/icons-material/BookmarkBorder';
import Chip from '@mui/material/Chip';
import { BG_GRAY, TEXT_GRAY } from '../../common/constants';
import OCLLogo from '../common/OCLLogo';
import SearchInput from '../search/SearchInput';
import Languages from './Languages';
import './Header.scss';

const drawerWidth = 258

const openedMixin = theme => ({
  width: drawerWidth,
  overflowX: 'hidden',
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
});

const closedMixin = theme => ({
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

const Header = props => {
  const { t } = useTranslation()
  /*eslint no-unused-vars: 0*/
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => setOpen(!open);

  const handleDrawerClose = () => setOpen(false);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }} style={{backgroundColor: BG_GRAY, color: TEXT_GRAY, boxShadow: 'none'}}>
        <Toolbar>
          <div className='col-xs-12 padding-0'>
            <div className='col-xs-1 padding-0 flex-vertical-center'>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerOpen}
                edge="start"
                sx={{
                  marginRight: 4.375,
                }}
              >
                {open ? <MenuOpenIcon /> : <MenuIcon />}
              </IconButton>
              <OCLLogo />
            </div>
            <div className='col-xs-3' />
            <div className='col-xs-4 padding-0' style={{textAlign: 'center'}}>
              <SearchInput size='small' style={{width: '100%'}} />
            </div>
            <div className='col-xs-1' />
            <div className='col-xs-3 padding-0' style={{textAlign: 'right'}}>
              <Languages />
              <Chip label={t('auth.sign_in')} color='primary' style={{height: '40px', borderRadius: '100px', marginLeft: '8px'}} onClick={() => {}} />
            </div>
          </div>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open} className='left-menu-drawer-root'>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            <MenuOpenIcon />
          </IconButton>
        </DrawerHeader>
        <List>
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              selected={open}
              sx={{
                minHeight: 56,
                justifyContent: open ? 'initial' : 'center',
                px: 1,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 1.75 : 'auto',
                  justifyContent: 'center',
                }}
              >
                <DashboardIcon color='primary' />
              </ListItemIcon>
              <ListItemText primary={t('dashboard.name')} sx={{ opacity: open ? 1 : 0, fontWeight: 500 }} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              sx={{
                minHeight: 56,
                justifyContent: open ? 'initial' : 'center',
                px: 1,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 1.75 : 'auto',
                  justifyContent: 'center',
                }}
              >
                <FolderOpenIcon />
              </ListItemIcon>
              <ListItemText primary={t('my_repositories.name')} sx={{ opacity: open ? 1 : 0, fontWeight: 500 }} />
            </ListItemButton>
          </ListItem>
        </List>
        <Divider style={{margin: '0 8px'}} />
        <List>
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              sx={{
                minHeight: 56,
                justifyContent: open ? 'initial' : 'center',
                px: 1,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 1.75 : 'auto',
                  justifyContent: 'center',
                }}
              >
                <BookmarkIcon />
              </ListItemIcon>
              <ListItemText primary={t('bookmarks.name')} sx={{ opacity: open ? 1 : 0, fontWeight: 500 }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        {
          props.children
        }
      </Box>
    </Box>
  );
}

export default Header;
