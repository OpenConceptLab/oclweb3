import React from 'react';
import OrgIcon from '../orgs/OrgIcon';
import UserIcon from '../users/UserIcon';
import RepoIcon from '../repos/RepoIcon'

const EntityIcon = ({entity, ...rest}) => {
  if(entity?.type === 'Organization')
    return <OrgIcon org={entity} {...rest} />
  if(entity?.type === 'User')
    return <UserIcon user={entity} {...rest} />
  if(['Source', 'Source Version', 'Collection', 'Collection Version'].includes(entity?.type))
    return <RepoIcon repo={entity} {...rest} />
  return entity?.type
}

export default EntityIcon
