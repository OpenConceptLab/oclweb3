import React from 'react';
import OrgChip from '../orgs/OrgChip';
import UserChip from '../users/UserChip';

const OwnerChip = ({ ownerType, owner, ...rest }) => {
  return ['user', 'users'].includes(ownerType?.toLowerCase() || owner?.type?.toLowerCase()) ?
    <UserChip user={owner} {...rest} /> :
  <OrgChip org={owner} {...rest} />
}

export default OwnerChip;
