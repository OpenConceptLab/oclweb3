import React from 'react';
import IconButton from '@mui/material/IconButton';
import { getCurrentUser } from '../../common/utils';
import UserIcon from './UserIcon';

const UserProfileButton = props => {
  return (
    <IconButton color='primary' {...props}>
      <UserIcon user={getCurrentUser()} />
    </IconButton>
  )
}

export default UserProfileButton;
