import React from 'react';
import VersionIcon from '@mui/icons-material/AccountTreeOutlined';
import RepoIcon from '../repos/RepoIcon';
import ConceptIcon from '../concepts/ConceptIcon';
import DotSeparator from './DotSeparator'
import OwnerIcon from './OwnerIcon'
import RepoVersionLabel from '../repos/RepoVersionLabel'

const Breadcrumbs = ({owner, ownerType, repo, repoVersion, repoURL, id, version, concept}) => {
  const iconProps = {color: 'secondary', style: {marginRight: '8px', width: '0.8em'}}
  return (
    <div className='col-xs-12 padding-0' style={{display: 'flex', alignItems: 'center'}}>
      {
        ownerType && owner &&
          <React.Fragment>
            <OwnerIcon ownerType={ownerType} {...iconProps} />
            {owner}
          </React.Fragment>
      }
      {
        repo &&
          <React.Fragment>
            <DotSeparator />
            <RepoVersionLabel href={repoURL} icon={<RepoIcon sx={{color: 'secondary'}} />} repo={repo} version={repoVersion} versionStyle={{fontSize: '14px'}} />
          </React.Fragment>
      }
      {
        id && concept &&
          <React.Fragment>
            <DotSeparator />
            <ConceptIcon selected {...iconProps} />
            <span className='searchable'>{id}</span>
          </React.Fragment>
      }
      {
        version && !repoVersion &&
          <React.Fragment>
            <DotSeparator />
            <VersionIcon {...iconProps} />
            {version}
          </React.Fragment>
      }
    </div>
  )
}

export default Breadcrumbs;
