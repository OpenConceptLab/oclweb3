import React from 'react';
import PersonIcon from '@mui/icons-material/Face2';
import StrangerIcon from '@mui/icons-material/Person';
import IconButton from '@mui/material/IconButton';
import { isLoggedIn } from '../../common/utils';

const UserProfileButton = props => {
  return (
    <IconButton color='primary' {...props}>
      {
        isLoggedIn() ?
          <PersonIcon fontSize='inherit'/> :
        <StrangerIcon fontSize='inherit'/>
      }
    </IconButton>
  )
}

export default UserProfileButton;
