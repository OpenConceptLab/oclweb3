import React from 'react';
import isPlainObject from 'lodash/isPlainObject'
import PersonIcon from '@mui/icons-material/Face2';
import StrangerIcon from '@mui/icons-material/Person';
import { isLoggedIn } from '../../common/utils';
import UserTooltip from './UserTooltip'

const UserIcon = ({ user, color, logoClassName, sx, authenticated, noTooltip }) => {
  // sx may be an array (LeftMenu passes one for followed items), and spreading that into an <img> style
  // blanks the app. Only a plain object doubles as the image's style; the MUI icons take sx as is.
  const imgStyle = isPlainObject(sx) ? sx : undefined
  return noTooltip ? (
    user?.logo_url ?
      <img
        src={user.logo_url}
        className={logoClassName || 'user-img-small'}
        style={imgStyle}
      /> :
    (authenticated || isLoggedIn()) ?
      <PersonIcon color={color} sx={sx} /> :
    <StrangerIcon color={color} sx={sx} />
  ) : (
    <UserTooltip user={user}>
      {
        user?.logo_url ?
          <img
            src={user.logo_url}
            className={logoClassName || 'user-img-small'}
            style={imgStyle}
          /> :
        (authenticated || isLoggedIn()) ?
          <PersonIcon color={color} sx={sx} /> :
        <StrangerIcon color={color} sx={sx} />
      }
    </UserTooltip>
  )
}

export default UserIcon;
