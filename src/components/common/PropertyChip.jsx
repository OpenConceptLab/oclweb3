import React from 'react';
import Chip from '@mui/material/Chip';

const PropertyChip = ({label, color}) => {
  return <Chip label={label} sx={{backgroundColor: "primary.95", color: color, borderRadius: '4px', padding: '4px 8px', height: '32px'}} />
}

export default PropertyChip;
