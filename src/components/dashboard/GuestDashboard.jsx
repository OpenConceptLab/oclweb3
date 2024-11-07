import React from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography'
import APIService from '../../services/APIService'
import DashboardEvents from './DashboardEvents';
import EventsButtonGroup from './EventsButtonGroup';
import LoaderDialog from '../common/LoaderDialog';
import DashboardBanners from './DashboardBanners'
import CommunityBlog from './CommunityBlog'
import EmptyOverview from '../repos/RepoEmptyOverview'
import Button from '../common/Button';
import { getLoginURL } from '../../common/utils'


const GuestDashboard = () => {
  const { t } = useTranslation()
  const [allEvents, setAllEvents] = React.useState({events: [], headers: {}})
  const [scope, setScope] = React.useState('all')
  const [loading, setLoading] = React.useState(true)

  const getService = (page, limit=10) => APIService.new().overrideURL('/events/').get(null, null, {limit: limit, page: page})

  const fetchEvents = () => {
    setLoading(true)
    getService(parseInt(allEvents.headers.page_number || '0') + 1).then(response => {
      setAllEvents({events: [...allEvents.events, ...response.data], headers: response.headers})
      setLoading(false)
    })
  }

  const onScopeChange = newScope => {
    if(newScope === scope)
      return
    setScope(newScope)

    if(newScope === 'all')
      !allEvents.events.length && fetchEvents()
  }


  React.useEffect(() => {
    fetchEvents()
  }, [])

  const getScopeEvents = () => {
    if(scope === 'orgs')
      return []
    if(scope === 'following')
      return []
    return allEvents.events
  }


  return (
    <div className='col-xs-12 padding-0'>
      <div className='col-xs-9' style={{maxWidth: 'calc(100% - 360px)', minWidth: '500px'}}>
        <div className='col-xs-12 padding-0' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <Typography sx={{fontSize: '22px', color: 'secondary.main'}}>
            {(t('dashboard.anonymous_heading'))}
          </Typography>
          <EventsButtonGroup selected={scope} onClick={onScopeChange} />
        </div>
        <LoaderDialog open={loading} />
        {
          ['all', 'highlights'].includes(scope) ?
            <DashboardEvents events={getScopeEvents()} sx={{marginTop: '16px'}} highlight isLoading={loading} />:
          <div className='col-xs-12 padding-0' style={{height: '86vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
            <EmptyOverview
              label={t('dashboard.events_scope_sign_in')}
              action={
                <Button className='no-anchor-styles' label={t('auth.sign_in')} sx={{ backgroundColor: 'primary.main', maxWidth: '100%', minWidth: '92px', color: '#FFF !important', marginTop: '16px' }} href={getLoginURL()} component='a' />
              }
            />
          </div>
        }
      </div>
      <div className='col-xs-3 padding-0' style={{minWidth: '360px'}}>
        <DashboardBanners />
        <CommunityBlog sx={{marginTop: '8px'}} />
      </div>
    </div>
  )
}

export default GuestDashboard
