import React from 'react';
import { useTranslation } from 'react-i18next';
import Bookmarks from '../common/Bookmarks';
import EmptyOverview from '../common/EmptyOverview'
import Paper from '@mui/material/Paper'
import CanonicalURLIcon from '../common/CanonicalURLIcon';
import Link from '../common/Link'
import UserStatistics from './UserStatistics'
import Members from '../orgs/OrgMembers';
import Events from '../common/Events';

const UserOverview = ({ user, bookmarks, events, height }) => {
  const { t } = useTranslation()
  const repos = (user?.public_sources || 0) + (user?.public_collections || 0)

  return (
    <div className='col-xs-12 padding-0' style={{height: height || '100%' }}>
      <div className='col-xs-9' style={{padding: '0 16px', height: '100%', overflow: 'auto', width: '80%'}}>
        <Bookmarks bookmarks={bookmarks} />
        {
          Boolean(events?.length) &&
            <Events user={user} events={events} height={height} />
        }
        {
          Boolean(user?.url && repos == 0 && events?.length === 0) &&
            <div className='col-xs-12' style={{marginTop: '15%', marginBottom: '16px'}}>
              <EmptyOverview label={`${user.name} ${t('user.user_has_not_created_public_repos_suffix')}`} />
            </div>
        }
      </div>
      <Paper className='col-xs-3' sx={{width: '20% !important', borderLeft: '0.5px solid', borderColor: 'surface.n90', borderRadius: 0, boxShadow: 'none', padding: '16px', height: '100%', overflow: 'auto', backgroundColor: 'default.main'}}>
        <div className='col-xs-12 padding-0'>
          <UserStatistics user={user} />
        </div>
        <div className='col-xs-12 padding-0'>
          <Members title={t('common.following')} members={user?.following || []} />
        </div>
        <div className='col-xs-12 padding-0'>
          <Link label={t('url_registry.view_canonical_url_registry')} href={`#/users/${user.username}/url-registry`} sx={{fontSize: '12px'}} startIcon={<CanonicalURLIcon fontSize='inherit' />} />
        </div>
      </Paper>
    </div>
  )
}

export default UserOverview
