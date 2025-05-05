import React from 'react';
import IconButton from '@mui/material/IconButton'
import AddIcon from '@mui/icons-material/Add'
import UserMenu from '../users/UserMenu';
import UserProfileButton from '../users/UserProfileButton';
import AddMenuList from '../users/AddMenuList'
import { isLoggedIn } from '../../common/utils';


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
    <div className='col-xs-3 padding-0' style={{textAlign: 'right'}}>
      {
        authenticated &&
          <IconButton sx={{marginRight: '8px'}} onClick={onAddMenuOpen}>
            <AddIcon />
          </IconButton>
      }
      <UserProfileButton onClick={() => setUserMenu(true)} />
      <UserMenu isOpen={userMenu} onClose={() => setUserMenu(false)} />
      {
        authenticated &&
          <AddMenuList open={addMenu} onClose={onAddMenuClose} anchorEl={addMenuAnchorEl} />
      }
    </div>
  )
}

export default HeaderControls;
