import React from 'react';
import PersonIcon from '@mui/icons-material/Face2';
import StrangerIcon from '@mui/icons-material/Person';
import { isLoggedIn } from '../../common/utils';

const UserIcon = ({ user, color, logoClassName, sx }) => {
  const iconStyle = {...(sx || {})}
  return (
    <React.Fragment>
      {
        isLoggedIn() ?
          (
            user?.logo_url ?
              <img src={user.logo_url} className={logoClassName || 'user-img-small'} /> :
            <PersonIcon color={color} fontSize='inherit' sx={iconStyle} />
          ) :
          <StrangerIcon color={color} sx={iconStyle} fontSize='inherit' />
      }
    </React.Fragment>
  )
}

export default UserIcon;
