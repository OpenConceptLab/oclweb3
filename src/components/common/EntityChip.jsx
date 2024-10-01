import React from 'react';
import OrgChip from '../orgs/OrgChip';
import UserChip from '../users/UserChip';
import RepoChip from '../repos/RepoChip';

const EntityChip = ({entity, ...rest}) => {
  if(entity?.type === 'Organization')
    return <OrgChip org={entity} {...rest} />
  if(entity?.type === 'User')
    return <UserChip user={entity} {...rest} />
  if(['Source', 'Collection', 'Source Version', 'Collection Version'].includes(entity?.type))
    return <RepoChip repo={entity} {...rest} />
  return entity?.type
}

export default EntityChip
