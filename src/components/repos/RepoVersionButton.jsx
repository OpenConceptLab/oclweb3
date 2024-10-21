import React from 'react';
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import DotSeparator from '../common/DotSeparator'

const RepoVersionButton = ({icon, repo, repoType, version, repoLabelStyle, versionStyle, href, vertical, size, sx}) => {
  const verticalStyle = version && vertical ? {flexDirection: 'column', alignItems: 'baseline', textAlign: 'left'} : {}
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
        ...verticalStyle,
        ...sx
      }}
      startIcon={icon}
      href={href ? '#' + href : undefined}
      component="button"
      size={size}
    >
      <span className='repo-button-group' style={{display: 'flex', alignItems: 'center', ...verticalStyle}}>
        <span style={{display: 'flex', alignItems: 'center'}}>
          <span className='repo-button-label'  style={{whiteSpace: 'nowrap', display: 'flex', fontSize: versionStyle?.fontSize, ...repoLabelStyle}}>
            {repo}
          </span>
          {
            repoType &&
              <React.Fragment>
                <span style={{display: 'flex', alignItems: 'center', fontSize: versionStyle?.fontSize, ...repoLabelStyle}}>
                  <DotSeparator margin='0 8px' />
                  <Typography component='span' sx={{color: 'secondary.50', fontSize: '0.85rem'}}>
                    {repoType}
                  </Typography>
                </span>
              </React.Fragment>
          }
        </span>
        {
          version &&
            <Typography className='repo-version-label' component='span' sx={{marginLeft: '4px', color: 'secondary.50', fontFamily: '"Roboto Mono","Helvetica","Arial",sans-serif', display: 'flex', fontSize: '0.85rem', marginTop: '1px', ...(versionStyle || {})}}>
              {version}
            </Typography>
        }
      </span>
    </Button>
  )
}

export default RepoVersionButton;
