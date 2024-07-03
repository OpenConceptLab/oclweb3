import React from 'react';
import Button from '@mui/material/Button'
import merge from 'lodash/merge';

const Link = ({ label, href, sx, ...rest }) => (
  <Button
    size='small'
    component="a"
    variant="text"
    href={href}
    sx={merge({
      color: 'primary',
      fontSize: '22px',
      textTransform: 'none',
      paddingLeft: 0,
      paddingRight: 0,
      backgroundColor: 'none',
      '&:hover': {
        color: 'primary.main',
        backgroundColor: 'inherit',
        textTransform: 'none',
        textDecoration: 'none',
        outline: 'none',
      },
      '&:focus': {
        color: 'primary.main',
        backgroundColor: 'inherit',
        textTransform: 'none',
        textDecoration: 'none',
        outline: 'none',
      }
    }, sx || {})}
    {...rest}
  >
    {label}
  </Button>
)

export default Link
