import React from 'react';
import VersionIcon from '@mui/icons-material/AccountTreeOutlined';
import RepoIcon from '../repos/RepoIcon';
import ConceptIcon from '../concepts/ConceptIcon';
import DotSeparator from './DotSeparator'
import OwnerIcon from './OwnerIcon'
import RepoVersionLabel from '../repos/RepoVersionLabel'
import Box from '@mui/material/Box';
import Button from '@mui/material/Button'

const Breadcrumbs = ({owner, ownerType, repo, repoVersion, repoURL, id, version, concept, noIcons, color, fontSize, size, ownerURL}) => {
  const iconProps = {color: 'secondary', style: {marginRight: '8px', width: '0.8em'}}
  return (
    <Box className='col-xs-12 padding-0' sx={{display: 'flex', alignItems: 'center', color: color, fontSize: fontSize}}>
      {
        ownerType && owner &&
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
          padding: ownerURL ? '4px' : 0,
          minWidth: 'auto',
        }}
            startIcon={!noIcons && <OwnerIcon ownerType={ownerType} {...iconProps} />}
        href={ownerURL ? '#' + ownerURL : undefined}
        component="button"
        size={size}
        >

        <span style={{marginLeft: '-8px'}}>{owner}</span>
          </Button>
      }
      {
        repo &&
          <React.Fragment>
            <DotSeparator />
            <RepoVersionLabel size={size} href={repoURL} icon={noIcons ? false : <RepoIcon sx={{color: 'secondary'}} />} repo={repo} version={repoVersion} versionStyle={{fontSize: fontSize || '14px'}} />
          </React.Fragment>
      }
      {
        id && concept &&
          <React.Fragment>
            <DotSeparator />
            {
              !noIcons &&
                <ConceptIcon selected {...iconProps} />
            }
            <span className='searchable'>{id}</span>
          </React.Fragment>
      }
      {
        version && !repoVersion &&
          <React.Fragment>
            <DotSeparator />
            {
              !noIcons &&
                <VersionIcon {...iconProps} />
            }
            {version}
          </React.Fragment>
      }
    </Box>
  )
}

export default Breadcrumbs;
