import React from 'react';
import CloseIconButton from '../common/CloseIconButton';
import { toOwnerURI } from '../../common/utils';
import Breadcrumbs from '../common/Breadcrumbs'
import ExternalIdLabel from '../common/ExternalIdLabel';

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
      <div className='col-xs-12 padding-0' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <span style={{display: 'flex', alignItems: 'center'}}>
          {
            mapping.external_id &&
              <ExternalIdLabel value={mapping.external_id} style={{marginLeft: '8px'}} />
          }
        </span>
      </div>
    </React.Fragment>
  )
}

export default MappingHeader;
