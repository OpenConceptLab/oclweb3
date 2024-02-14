import React from 'react';
import TextField from '@mui/material/TextField';

const CommonTextField = ({sx, value, ...rest}) => {
  return (
    <TextField
      variant='standard'
      value={value || ''}
      {...rest}
      sx={{
        '.MuiFormLabel-root' : {
          paddingLeft: '16px',
          color: 'surface.contrastText'
        },
        '.MuiInputBase-input': {
          padding: '5px 12px',
          color: 'surface.dark',
          '&::after': {
            color: 'surface.contrastText'
          }
        },
        ...(sx || {})
      }}
    />
  )
}

export default CommonTextField;
