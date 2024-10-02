import React from 'react'
import UserIcon from '@mui/icons-material/Face2';
import BaseEntityChip from '../common/BaseEntityChip'
import UserTooltip from './UserTooltip';

const UserChip = ({ user, noTooltip, ...rest }) => {
  return noTooltip ? (
    <BaseEntityChip
      entity={user}
      icon={<UserIcon />}
      {...rest}
    />
  ) : (
    <UserTooltip user={user}>
      <BaseEntityChip
        entity={user}
        icon={<UserIcon />}
        {...rest}
      />

     </UserTooltip>
  )
}

export default UserChip;
