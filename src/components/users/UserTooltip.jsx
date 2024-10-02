import React from 'react'
import { useHistory } from 'react-router-dom';
import UserIcon from '@mui/icons-material/Face2';
import HTMLTooltip from '../common/HTMLTooltip'
import FollowActionButton from '../common/FollowActionButton'

const TooltipTitle = ({ user }) => {
  const history = useHistory()
  return (
    <React.Fragment>
      <div style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        {
          user?.logo_url ?
            <img src={user.logo_url} style={{width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover'}} /> :
          <UserIcon sx={{width: '30px', height: '30px'}} />
        }
        <FollowActionButton iconButton entity={user} sx={{mr: 0, ml: 1.5}} size='small' />
      </div>
      <div style={{width: '100%', fontSize: '14px', marginTop: '6px'}}>
        <span style={{color: '#000', cursor: 'pointer'}} onClick={() => history.push(user?.url)}>
          <b>{user?.name}</b>
        </span>
        <span style={{marginLeft: '8px', cursor: 'pointer'}} onClick={() => history.push(user?.url)}>
          {user?.username}
        </span>
      </div>
      {
        Boolean(user?.company) &&
          <div style={{width: '100%', fontSize: '12px', marginTop: '4px'}} className='ellipsis-text-3'>
            {user.company}
          </div>
      }
    </React.Fragment>
  )
}


const UserTooltip = ({ user, children, spanStyle  }) => {
  return (
    <HTMLTooltip
      title={
        <React.Fragment>
          <TooltipTitle user={user} />
        </React.Fragment>
      }
    >
      <span style={{display: 'flex', ...spanStyle}}>
        {children}
      </span>
    </HTMLTooltip>
  )
}

export default UserTooltip;
