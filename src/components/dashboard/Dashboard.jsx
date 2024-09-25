import React from 'react'
import { getCurrentUser, isLoggedIn } from '../../common/utils';
import UserDashboard from './UserDashboard';
import GuestDashboard from './GuestDashboard';

const Dashboard = () => {
  const authenticated = isLoggedIn()
  const user = getCurrentUser()
  return (
    <div className='col-xs-12 padding-0' style={{display: 'flex', justifyContent: 'center', width: '100%'}}>
      <div className='col-xs-12 padding-0' style={{maxWidth: 'calc(1440px - 32px)'}}>
        <div className='col-xs-12 padding-0 flex-vertical-center' style={{fontSize: '22px'}}>
          {
            authenticated ?
              <UserDashboard user={user} /> :
            <GuestDashboard />
          }
        </div>
      </div>
    </div>
  )
}

export default Dashboard;
