import React from 'react';
import { getCurrentUser } from '../../common/utils'
import UserProfile from './UserProfile'
import UserForm from './UserForm'

const UserEdit = () => {
  const user = getCurrentUser()
  const height = 'calc(100vh - 100px)'
  return (
    <div className='col-xs-12 padding-0'>
      <div className='col-xs-3' style={{height: height, padding: '24px 24px 24px 8px', maxWidth: '20%'}}>
        <UserProfile user={user} />
      </div>
      <div className='col-xs-10 padding-0' style={{height: height, maxWidth: '80%', overflow: 'auto'}}>
        {
          user?.url &&
            <UserForm user={user} />
        }
      </div>
    </div>
  )
}

export default UserEdit
