import React from 'react';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';

const PinIcon = ({ pinned, sx, ...rest }) => {
  const Icon = pinned ? PushPinIcon : PushPinOutlinedIcon
  return <Icon {...rest} sx={{transform: 'rotate(45deg)', ...sx}} />
}

export default PinIcon;
