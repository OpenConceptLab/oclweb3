import React from 'react'
import { useTranslation } from 'react-i18next'
import { getCurrentUser, isLoggedIn, getLoginURL, getRegisterURL } from '../../common/utils';
import Link from '../common/Link';
import UserDashboard from './UserDashboard';
import DashboardBanners from './DashboardBanners'

const Dashboard = () => {
  const { t } = useTranslation()
  const authenticated = isLoggedIn()
  const user = getCurrentUser()
  return (
    <div className='col-xs-12 padding-0' style={{display: 'flex', justifyContent: 'center', width: '100%'}}>
      <div className='col-xs-12 padding-0' style={{maxWidth: 'calc(1280px - 32px)'}}>
        <div className='col-xs-12 padding-0 flex-vertical-center' style={{fontSize: '22px'}}>
          {
            authenticated ?
              <UserDashboard user={user} /> :
            <span>
              {t('dashboard.welcome_line')} <Link label={t('auth.sign_in')} href={getLoginURL()} /> {t('common.or')} <Link label={t('auth.register')} href={getRegisterURL()} />
            </span>
          }
        </div>
        {
          !authenticated &&
            <DashboardBanners />
        }
      </div>
    </div>
  )
}

export default Dashboard;
