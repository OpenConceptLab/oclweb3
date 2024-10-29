import React from 'react'
import { useTranslation } from 'react-i18next';
import UserStatistics from './UserStatistics'
import Following from './Following';
import CanonicalURLIcon from '../common/CanonicalURLIcon';
import Link from '../common/Link'

const UserSummary = ({ user }) => {
  const { t } = useTranslation()
  return (
    <>
      <div className='col-xs-12 padding-0'>
        <UserStatistics user={user} />
      </div>
      <div className='col-xs-12 padding-0'>
        <Following title={t('common.following')} following={user?.following || []} />
      </div>
      <div className='col-xs-12 padding-0'>
        <Link label={t('url_registry.view_canonical_url_registry')} href={`#/users/${user.username}/url-registry`} sx={{fontSize: '12px'}} startIcon={<CanonicalURLIcon fontSize='inherit' />} />
      </div>
    </>
  )
}

export default UserSummary
