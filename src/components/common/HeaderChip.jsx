import React from 'react';
import Chip from '@mui/material/Chip';
import merge from 'lodash/merge'
import Skeleton from '@mui/material/Skeleton';

const HeaderChip = ({ labelPrefix, label, sx, ...rest }) => {
  let _label = label ? `${labelPrefix || ''}${label}` : <Skeleton variant="text" sx={{ fontSize: '20px', width: '60px' }} />
  return (
    <Chip
      label={_label}
      sx={merge(
        {
          backgroundColor: "primary.95",
          color: 'surface.contrastText',
          borderRadius: '8px',
          minWidth: '95px',
          fontSize: '16px',
          padding: '6px 16px 6px 8px',
          border: '1px solid',
          borderColor: 'surface.light',
          height: '35px',
          '.MuiSvgIcon-root': {
            color: 'surface.contrastText',
            mr: '-3px',
            mt: '-2px',
            fontSize: '20px'
          }
        },
        (sx || {})
      )}
      {...rest}
    />
  )
}

export default HeaderChip;
