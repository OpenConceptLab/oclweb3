import React from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography'
import APIService from '../../services/APIService'
import DashboardEvents from './DashboardEvents';
import EventsButtonGroup from './EventsButtonGroup';
import DashboardBanners from './DashboardBanners'
import CommunityBlog from './CommunityBlog'


const GuestDashboard = () => {
  const { t } = useTranslation()
  const [allEvents, setAllEvents] = React.useState({events: [], headers: {}})
  const [loading, setLoading] = React.useState(true)

  const getService = (page, limit=10) => APIService.new().overrideURL('/events/').get(null, null, {limit: limit, page: page})

  const fetchEvents = () => {
    setLoading(true)
    getService(parseInt(allEvents.headers.page_number || '0') + 1).then(response => {
      setAllEvents({events: [...allEvents.events, ...response.data], headers: response.headers})
      setLoading(false)
    })
  }

  React.useEffect(() => {
    fetchEvents()
  }, [])

  return (
    <div className='col-xs-12 padding-0'>
      <div className='col-xs-9' style={{maxWidth: 'calc(100% - 360px)', minWidth: '500px'}}>
        <div className='col-xs-12 padding-0' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <Typography sx={{fontSize: '22px', color: 'secondary.main'}}>
            {(t('dashboard.anonymous_heading'))}
          </Typography>
          <EventsButtonGroup communityOnly onClick={() => {}} />
        </div>
        <DashboardEvents events={allEvents.events} sx={{marginTop: '8px', maxHeight: 'calc(var(--app-height) - 151px)'}} highlight isLoading={loading} />
      </div>
      <div className='col-xs-3 padding-0' style={{minWidth: '360px'}}>
        <DashboardBanners />
        <div className='col-xs-12 padding-0' style={{marginTop: '8px'}}>
          <CommunityBlog />
        </div>
      </div>
    </div>
  )
}

export default GuestDashboard
