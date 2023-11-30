import React from 'react';
import UserMenu from '../users/UserMenu';
import UserProfileButton from '../users/UserProfileButton';


const HeaderControls = () => {
  const [userMenu, setUserMenu] = React.useState(false)
  return (
    <div className='col-xs-3 padding-0' style={{textAlign: 'right'}}>
      <UserProfileButton onClick={() => setUserMenu(true)} />
      <UserMenu isOpen={userMenu} onClose={() => setUserMenu(false)} />
    </div>
  )
}

export default HeaderControls;
