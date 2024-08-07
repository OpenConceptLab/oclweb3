import React from 'react';
import OrgIcon from '@mui/icons-material/AccountBalance';
import UserIcon from '@mui/icons-material/Person';

const OwnerIcon = ({ ownerType, ...rest }) => {
  return ['user', 'users'].includes(ownerType?.toLowerCase()) ? <UserIcon {...rest} /> : <OrgIcon {...rest}/>
}

export default OwnerIcon;
