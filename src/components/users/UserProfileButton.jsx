import React from 'react';
import PersonIcon from '@mui/icons-material/Face2';
import IconButton from '@mui/material/IconButton';

const UserProfileButton = ({ onClick }) => {
  return (
    <IconButton color='primary' onClick={onClick}>
      <PersonIcon fontSize='inherit'/>
    </IconButton>
  )
}

export default UserProfileButton;
