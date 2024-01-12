import React from 'react';
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

const RepoVersionLabel = ({icon, repo, version, versionStyle, href, vertical}) => {
  const verticalStyle = Boolean(version && vertical) ? {flexDirection: 'column', alignItems: 'baseline'} : {}
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
        ...verticalStyle
      }}
      startIcon={icon}
      href={href ? '#' + href : undefined}
      component="button"
    >
      <span style={{display: 'flex'}}>{repo}</span>
      {
        version &&
          <Typography component='span' sx={{marginLeft: '4px', color: 'secondary.s50', fontFamily: '"Roboto Mono","Helvetica","Arial",sans-serif', display: 'flex', fontSize: '0.85rem', marginTop: '1px', ...(versionStyle || {})}}>
            {version}
          </Typography>
      }
    </Button>
  )
}

export default RepoVersionLabel;
