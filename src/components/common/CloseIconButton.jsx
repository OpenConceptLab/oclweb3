import React from 'react';

import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

const CloseIconButton = props => (
  <IconButton {...props}>
    <CloseIcon fontSize='inherit'/>
  </IconButton>
)

export default CloseIconButton;
