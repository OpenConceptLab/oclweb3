import React from 'react';
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

const RepoVersionButton = ({icon, repo, version, versionStyle, href, vertical, size}) => {
  const verticalStyle = version && vertical ? {flexDirection: 'column', alignItems: 'baseline'} : {}
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
        padding: href ? '4px' : 0,
        minWidth: 'auto',
        ...verticalStyle
      }}
      startIcon={icon}
      href={href ? '#' + href : undefined}
      component="button"
      size={size}
    >
      <span style={{display: 'flex', fontSize: versionStyle?.fontSize}}>{repo}</span>
      {
        version &&
          <Typography component='span' sx={{marginLeft: '4px', color: 'secondary.50', fontFamily: '"Roboto Mono","Helvetica","Arial",sans-serif', display: 'flex', fontSize: '0.85rem', marginTop: '1px', ...(versionStyle || {})}}>
            {version}
          </Typography>
      }
    </Button>
  )
}

export default RepoVersionButton;
