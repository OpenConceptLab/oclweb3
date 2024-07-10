import React from 'react';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import IconButton from '@mui/material/IconButton';

const DeleteIconButton = props => {
  return (
    <IconButton {...props}>
      <DeleteIcon fontSize='inherit'/>
    </IconButton>
  )
}

export default DeleteIconButton
