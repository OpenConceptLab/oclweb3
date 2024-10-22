import React from 'react';
import CloseIconButton from '../common/CloseIconButton';
import { toOwnerURI } from '../../common/utils';
import Breadcrumbs from '../common/Breadcrumbs'

const MappingHeader = ({mapping, onClose, repoURL, nested}) => {
  return (
    <React.Fragment>
      <div className='col-xs-12 padding-0' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <span style={{width: 'calc(100% - 40px)'}}>
          <Breadcrumbs
            ownerURL={repoURL ? toOwnerURI(repoURL) : false}
            owner={mapping.owner}
            ownerType={mapping.owner_type}
            repo={mapping.source}
            repoVersion={mapping.latest_source_version}
            repoType={mapping.source?.type}
            version={mapping.version}
            repoURL={repoURL}
            mapping={mapping}
            nested={nested}
          />
        </span>
        <span>
          <CloseIconButton color='secondary' onClick={onClose} />
        </span>
      </div>
    </React.Fragment>
  )
}

export default MappingHeader;
