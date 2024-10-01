import React from 'react';
import VersionIcon from '@mui/icons-material/AccountTreeOutlined';
import RepoIcon from '../repos/RepoIcon';
import ConceptIcon from '../concepts/ConceptIcon';
import DotSeparator from './DotSeparator'
import RepoVersionButton from '../repos/RepoVersionButton'
import Box from '@mui/material/Box';
import OwnerButton from './OwnerButton'

const Breadcrumbs = ({owner, ownerType, repo, repoVersion, repoURL, id, version, concept, noIcons, color, fontSize, size, ownerURL}) => {
  const iconProps = {color: 'secondary', style: {marginRight: '8px', width: '0.8em'}}
  return (
    <Box className='col-xs-12 padding-0' sx={{display: 'flex', alignItems: 'center', color: color, fontSize: fontSize}}>
      {
        ownerType && owner &&
          <OwnerButton
            ownerType={ownerType}
            owner={owner}
            ownerURL={ownerURL}
            noIcons={noIcons}
            size={size}
          />
      }
      {
        repo &&
          <React.Fragment>
            <DotSeparator />
            <RepoVersionButton size={size} href={repoURL} icon={noIcons ? false : <RepoIcon sx={{color: 'secondary'}} />} repo={repo} version={repoVersion} versionStyle={{fontSize: fontSize || '14px'}} />
          </React.Fragment>
      }
      {
        id && concept &&
          <React.Fragment>
            <DotSeparator />
            {
              !noIcons &&
                <ConceptIcon selected {...iconProps} color='primary' />
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
