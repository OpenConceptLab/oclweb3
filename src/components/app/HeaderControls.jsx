import React from 'react';
import IconButton from '@mui/material/IconButton'
import AddIcon from '@mui/icons-material/Add'
import UserMenu from '../users/UserMenu';
import ErrorBoundary from '../errors/ErrorBoundary';
import UserProfileButton from '../users/UserProfileButton';
import AddMenuList from '../users/AddMenuList'
import { isLoggedIn } from '../../common/utils';
import ClassicTermBrowserButton from './ClassicTermBrowserButton';


const HeaderControls = () => {
  const [userMenu, setUserMenu] = React.useState(false)
  const [addMenu, setAddMenu] = React.useState(false)
  const [addMenuAnchorEl, setAddMenuAnchorEl] = React.useState(false)

  const onAddMenuOpen = event => {
    setAddMenuAnchorEl(event.currentTarget)
    setAddMenu(true)
  }
  const onAddMenuClose = () => {
    setAddMenuAnchorEl(false)
    setAddMenu(false)
  }

  const authenticated = isLoggedIn()

  return (
    <div className='col-xs-4 padding-0' style={{textAlign: 'right'}}>
      <ClassicTermBrowserButton />
      {
        authenticated &&
          <IconButton sx={{marginRight: '8px'}} onClick={onAddMenuOpen}>
            <AddIcon />
          </IconButton>
      }
      <UserProfileButton onClick={() => setUserMenu(true)} />
      <ErrorBoundary fallback={null}>
        <UserMenu isOpen={userMenu} onClose={() => setUserMenu(false)} />
      </ErrorBoundary>
      {
        authenticated &&
        <AddMenuList open={addMenu} onClose={onAddMenuClose} anchorEl={addMenuAnchorEl} />
      }
    </div>
  )
}

export default HeaderControls;
