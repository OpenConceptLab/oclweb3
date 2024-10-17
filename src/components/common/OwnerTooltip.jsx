import React from 'react';
import OrgTooltip from '../orgs/OrgTooltip';
import UserTooltip from '../users/UserTooltip'

const OwnerTooltip = ({children, owner, ...rest}) => {
  return owner?.type?.toLowerCase() === 'organization' ?
    <OrgTooltip org={owner} {...rest}>
      {children}
    </OrgTooltip> :
  <UserTooltip user={owner} {...rest}>
    {children}
  </UserTooltip>
}

export default OwnerTooltip
