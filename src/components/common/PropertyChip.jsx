import React from 'react';
import Chip from '@mui/material/Chip';

const PropertyChip = ({label}) => {
  return <Chip label={label} style={{backgroundColor: "#f2efff", color: '#1c1b1f', borderRadius: '4px', padding: '4px 8px', height: '32px'}} />
}

export default PropertyChip;
