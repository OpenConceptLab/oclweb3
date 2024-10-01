import React from 'react';
import Button from '@mui/material/Button'
import OwnerIcon from './OwnerIcon'

const OwnerButton = ({owner, ownerType, ownerURL, noIcons, sx, ...rest}) => {
  const iconProps = {color: 'secondary', style: {marginRight: '8px', width: '0.8em'}}
  return (
    <Button
      sx={{
        textTransform: 'none',
        color: 'inherit',
        '&:hover': {
          textTransform: 'none',
          color: 'inherit',
          background: 'transparent'
        },
        '&:focus': {
          textTransform: 'none',
          color: 'inherit',
          background: 'transparent',
          outline: 'none'
        },
        padding: ownerURL ? '4px' : '0 8px',
        minWidth: 'auto',
        ...sx
      }}
      startIcon={!noIcons && <OwnerIcon ownerType={ownerType} {...iconProps} />}
      href={ownerURL ? '#' + ownerURL : undefined}
      component="button"
    {...rest}
    >

      <span>{owner}</span>
    </Button>
  )
}

export default OwnerButton;
