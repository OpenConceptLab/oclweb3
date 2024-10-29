import React from 'react';
import { useTranslation } from 'react-i18next';
import Bookmarks from '../common/Bookmarks';
import EmptyOverview from '../common/EmptyOverview'
import Events from '../common/Events';

const UserOverview = ({ user, bookmarks, events, height, onLoadMoreEvents }) => {
  const { t } = useTranslation()
  const repos = (user?.public_sources || 0) + (user?.public_collections || 0)

  return (
    <div className='col-xs-12 padding-0' style={{height: height || '100%' }}>
      <div className='col-xs-9' style={{padding: '0 16px', height: '100%', overflow: 'auto', width: '80%'}}>
        <Bookmarks bookmarks={bookmarks} />
        {
          Boolean(events?.length) &&
            <Events user={user} events={events} height={height} onLoadMore={onLoadMoreEvents} />
        }
        {
          Boolean(user?.url && repos == 0 && events?.length === 0) &&
            <div className='col-xs-12' style={{marginTop: '15%', marginBottom: '16px'}}>
              <EmptyOverview label={`${user.name} ${t('user.user_has_not_created_public_repos_suffix')}`} />
            </div>
        }
      </div>
    </div>
  )
}

export default UserOverview
