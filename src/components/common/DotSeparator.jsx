import React from 'react';

const DotSeparator = ({ margin }) => {
  return (
    <span style={{display: 'flex', alignItems: 'center', backgroundColor: 'rgba(94, 92, 113, 0.5)', margin: margin || '0 12px', width: '4px', height: '4px', borderRadius: '10px'}} />
  )
}

export default DotSeparator;
