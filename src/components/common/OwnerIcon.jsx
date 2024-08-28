import React from 'react';
import OrgIcon from '../orgs/OrgIcon';
import UserIcon from '../users/UserIcon';

const OwnerIcon = ({ ownerType, owner, ...rest }) => {
  return ['user', 'users'].includes(ownerType?.toLowerCase()) ?
    <UserIcon user={owner} {...rest} /> :
  <OrgIcon org={owner} {...rest} strict noLink />
}

export default OwnerIcon;
