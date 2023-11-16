import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { PRIMARY } from '../../common/constants'

const LinkTo = ({ label }) => <Link to='/' style={{color: PRIMARY, fontSize: '22px', margin: '0 5px'}} className='no-anchor-styles'>{label}</Link>

const Dashboard = () => {
  const { t } = useTranslation()
  return (
    <div className='col-xs-12 padding-0'>
      <div className='col-xs-12 padding-0 flex-vertical-center' style={{fontSize: '22px'}}>
        <React.Fragment>
          {t('dashboard.welcome_line')} <LinkTo label={t('auth.sign_in')} /> or <LinkTo label={t('auth.register')} />
          </React.Fragment>
      </div>
    </div>
  )
}

export default Dashboard;
