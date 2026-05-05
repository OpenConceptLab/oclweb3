import React from 'react';
import { useTranslation } from 'react-i18next'
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import CssBaseline from '@mui/material/CssBaseline';
import MenuIcon from '@mui/icons-material/Menu';
import { COLORS } from '../../common/colors';
import { getCurrentUser } from '../../common/utils';
import OCLLogo from '../common/OCLLogo';
import SearchInput from '../search/SearchInput';
import './Header.scss';
import HeaderControls from './HeaderControls';
import LeftMenu from './LeftMenu'

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

const Header = props => {
  const { t } = useTranslation()
  const user = getCurrentUser()
  const [open, setOpen] = React.useState(false);
  const handleDrawerOpen = () => setOpen(!open);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }} style={{backgroundColor: COLORS.surface.n96, color: COLORS.surface.contrastText, boxShadow: 'none'}}>
        <Toolbar style={{paddingRight: '16px'}}>
          <div className='col-xs-12 padding-0 flex-vertical-center'>
            <div className='col-xs-1 padding-0 flex-vertical-center'>
              {
                Boolean(user?.url) &&
                  <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    onClick={handleDrawerOpen}
                    edge="start"
                    size='large'
                    sx={{
                      mr: 2,
                    }}
                  >
                    <MenuIcon fontSize='inherit' />
                  </IconButton>
              }
              <OCLLogo />
            </div>
            <div className='col-xs-3' />
            <div className='col-xs-4 padding-0' style={{textAlign: 'center'}}>
              <SearchInput size='small' style={{width: '100%'}} placeholder={t('search.input_placeholder')} />
            </div>
            <div className='col-xs-1' />
            <HeaderControls />
          </div>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1, paddingTop: 0, paddingBottom: 1.25, paddingLeft: 2, paddingRight: 2 }}>
        <DrawerHeader />
        {
          props.children
        }
      </Box>
      <LeftMenu isOpen={open} onClose={handleDrawerOpen} />
    </Box>
  );
}

export default Header;
