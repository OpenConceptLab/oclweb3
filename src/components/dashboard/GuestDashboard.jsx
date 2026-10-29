import React from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography'
import APIService from '../../services/APIService'
import DashboardEvents, { DASHBOARD_COLUMN_STYLE, DASHBOARD_SIDE_COLUMN_STYLE } from './DashboardEvents';
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
      <div className='col-xs-9' style={{maxWidth: 'calc(100% - 360px)', minWidth: '500px', ...DASHBOARD_COLUMN_STYLE}}>
        <div className='col-xs-12 padding-0' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0}}>
          <Typography sx={{fontSize: '22px', color: 'secondary.main'}}>
            {(t('dashboard.anonymous_heading'))}
          </Typography>
          <EventsButtonGroup communityOnly onClick={() => {}} />
        </div>
        <DashboardEvents events={allEvents.events} sx={{marginTop: '8px'}} highlight isLoading={loading} />
      </div>
      <div className='col-xs-3 padding-0' style={DASHBOARD_SIDE_COLUMN_STYLE}>
        <div className='col-xs-12 padding-0' style={{flexShrink: 0}}>
          <DashboardBanners />
        </div>
        <CommunityBlog sx={{marginTop: '8px'}} />
      </div>
    </div>
  )
}

export default GuestDashboard
