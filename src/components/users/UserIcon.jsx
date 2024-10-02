import React from 'react';
import PersonIcon from '@mui/icons-material/Face2';
import StrangerIcon from '@mui/icons-material/Person';
import { isLoggedIn } from '../../common/utils';
import UserTooltip from './UserTooltip'

const UserIcon = ({ user, color, logoClassName, sx, authenticated, noTooltip }) => {
  const iconStyle = {...(sx || {})}
  return noTooltip ? (
    user?.logo_url ?
      <img
        src={user.logo_url}
        className={logoClassName || 'user-img-small'}
        style={iconStyle}
      /> :
    (authenticated || isLoggedIn()) ?
      <PersonIcon color={color} sx={iconStyle} /> :
    <StrangerIcon color={color} sx={iconStyle} />
  ) : (
    <UserTooltip user={user}>
      {
        user?.logo_url ?
          <img
            src={user.logo_url}
            className={logoClassName || 'user-img-small'}
            style={iconStyle}
          /> :
        (authenticated || isLoggedIn()) ?
          <PersonIcon color={color} sx={iconStyle} /> :
        <StrangerIcon color={color} sx={iconStyle} />
      }
    </UserTooltip>
  )
}

export default UserIcon;
