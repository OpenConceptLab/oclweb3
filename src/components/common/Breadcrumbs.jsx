import React from 'react';
import VersionIcon from '@mui/icons-material/AccountTreeOutlined';
import RepoIcon from '../repos/RepoIcon';
import ConceptIcon from '../concepts/ConceptIcon';
import DotSeparator from './DotSeparator'
import RepoVersionButton from '../repos/RepoVersionButton'
import RepoTooltip from '../repos/RepoTooltip'
import Box from '@mui/material/Box';
import OwnerButton from './OwnerButton'

const Breadcrumbs = ({owner, ownerType, repo, repoVersion, repoURL, id, version, concept, noIcons, color, fontSize, size, ownerURL, nested}) => {
  const iconProps = {color: 'secondary', style: {marginRight: '8px', width: '0.8em'}}
  const hideParents = Boolean(concept && nested)
  return (
    <Box className='col-xs-12 padding-0' sx={{display: 'flex', alignItems: 'center', color: color, fontSize: fontSize}}>
      {
        ownerType && owner && !hideParents &&
          <OwnerButton
            ownerType={ownerType}
            owner={owner}
            ownerURL={ownerURL}
            noIcons={noIcons}
            size={size}
            sx={{
              '.owner-button-label': {
                maxWidth: '125px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: '14px',
                whiteSpace: 'nowrap',
              },
              '.MuiButton-startIcon': {
                fontSize: '18px',
              }
            }}
          />
      }
      {
        repo && !hideParents &&
          <React.Fragment>
            <DotSeparator />
        <RepoTooltip repo={{url: repoURL}}>
            <RepoVersionButton
              size={size}
              href={repoURL}
              icon={
                noIcons ?
                  false :
                  <RepoIcon
                    noTooltip
                    sx={{color: 'secondary', fontSize: '18px'}}
                  />
              }
              sx={{
                '.repo-button-label': {
                  display: 'inline-block !important',
                  maxWidth: '150px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontSize: '14px',
                  whiteSpace: 'nowrap',
                },
                '.repo-version-label': {
                  display: 'inline-block',
                maxWidth: '75px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: '14px',
                whiteSpace: 'nowrap',
                }
              }}
              repo={repo}
              version={repoVersion}
              versionStyle={{fontSize: fontSize || '14px'}}
          />
        </RepoTooltip>
          </React.Fragment>
      }
      {
        id && concept &&
          <React.Fragment>
            {!hideParents && <DotSeparator />}
            {
              !noIcons &&
                <ConceptIcon
                  selected
                  sx={{
                    fontSize: '18px'
                  }}
                  {...iconProps}
                  color='primary'
                />
            }
            <span className='searchable' style={{
              maxWidth: '125px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: '14px',
              whiteSpace: 'nowrap',
            }}>
              {id}
            </span>
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
