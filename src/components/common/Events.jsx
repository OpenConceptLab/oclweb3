import * as React from 'react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import map from 'lodash/map'
import isEmpty from 'lodash/isEmpty'
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import MoreIcon from '@mui/icons-material/ExpandCircleDownOutlined';
import { getCurrentUser, getSiteTitle } from '../../common/utils'
import EntityIcon from '../common/EntityIcon';
import Link from '../common/Link'
import UserIcon from '../users/UserIcon'

const EventDescription = ({ event, isFirst, isLast, isJoined }) => {
  const { event_type, description, referenced_object} = event;
  const getDescription = () => {
    let eventDescription = description
    if(isJoined)
      eventDescription += ' ' + getSiteTitle()
    let rel;
    if(event_type && !isEmpty(referenced_object)) {
      eventDescription = `${event_type} ${referenced_object.type} `
      if(['Source Version', 'Collection Version'].includes(referenced_object.type)) {
        rel = `${referenced_object.short_code}/${referenced_object.id}`
      } else
        rel = referenced_object.id || referenced_object.username || referenced_object.name
    }
    return {eventDescription, rel}
  }
  const {eventDescription, rel} = getDescription()
  return (
    <React.Fragment>
      <Typography sx={{fontSize: '14px', alignItems: 'center', marginTop: isFirst ? '2px' :  (isLast ? (isJoined ? 0 : '12px') : '8px'), display: 'block'}}>
        {eventDescription}
        {
          rel ?
            <Link href={'#' + (event.referenced_object?.version_url || event.referenced_object?.url)} label={rel} sx={{fontSize: '14px', paddingLeft: 0, minWidth: 'auto', paddingTop: '1px'}} /> :
          null
        }
      </Typography>
      <Typography sx={{fontSize: '12px', m: 'auto 0', color: 'default.light'}}>
        {moment(event.created_at).fromNow()}
      </Typography>
    </React.Fragment>
  )
}


const Event = ({ event, isFirst, isLast }) => {
  const isJoined = event?.event_type?.toLowerCase() === 'joined' && !event?.referenced_object
  const hasReferencedObjectLogo = Boolean(event?.referenced_object?.logo_url || (isJoined && event?.object?.logo_url))
  let dotStyle = hasReferencedObjectLogo ? {padding: 0, borderWidth: '1px'} : {}
  return (
    <TimelineItem sx={isJoined ? {display: 'flex', alignItems: 'center'} : {}}>
      <TimelineSeparator>
        { !isFirst && <TimelineConnector /> }
        <TimelineDot sx={{backgroundColor: hasReferencedObjectLogo ? 'transparent' : (isJoined ? 'primary.main' : 'primary.60'), ...dotStyle}}>
          {
            isJoined ?
              <EntityIcon entity={event.object} sx={{color: '#FFF'}} logoClassName='user-img-xsmall' /> :
            <EntityIcon noLink strict entity={event.referenced_object} isVersion={(event.referenced_object?.short_code && event.referenced_object?.version_url)} sx={{color: '#FFF'}} logoClassName='user-img-xsmall' />
          }
        </TimelineDot>
        { !isLast && <TimelineConnector /> }
      </TimelineSeparator>
      <TimelineContent sx={{ py: '12px', px: '19px', color: 'rgba(0, 0, 0, 0.87)'}}>
        <EventDescription event={event} isFirst={isFirst} isLast={isLast} isJoined={isJoined} />
      </TimelineContent>
    </TimelineItem>
  )
}

const Events = ({ user, events, onLoadMore, showAvatar }) => {
  const { t } = useTranslation()
  const currentUser = getCurrentUser()
  const isSelf = Boolean(currentUser?.username && currentUser?.username === user.username)

  return (
    <div className='col-xs-12 padding-0'>
      <Typography component='h3' sx={{margin: '16px 0', fontWeight: 'bold', display: 'flex', alignItems: 'center'}}>
        {
          showAvatar &&
            <UserIcon noTooltip user={user} sx={{width: '40px', height: '40px', marginRight: '16px'}} color='primary' />
        }
        {`${isSelf ? t('user.your') : (user.name + "'s")} ${t('user.recent_activity')}`}
      </Typography>
      <Timeline
        id="events-timeline"
        sx={{
          '.MuiTimelineItem-root:before': {
            flex: 0,
            p: 0
          },
          p: 0,
          marginTop: 0,
          maxHeight: '420px',
          overflow: 'auto'
        }}
      >
        {
          map(events, (event, i) => (
            <Event key={i} event={event} isFirst={i === 0} isLast={onLoadMore ? false : i === events?.length - 1} />
          ))
        }
        {
          onLoadMore &&
            <TimelineItem sx={{minHeight: '50px'}}>
              <TimelineSeparator>
                <Tooltip title='Show more'>
                  <TimelineDot sx={{backgroundColor: 'transparent', boxShadow: 'none', cursor: 'pointer', marginTop: 0}} onClick={onLoadMore}>
                    <MoreIcon sx={{color: 'primary.60'}} />
                  </TimelineDot>
                </Tooltip>
              </TimelineSeparator>
              <TimelineContent sx={{m: 0, height: 0}} />
            </TimelineItem>
        }
      </Timeline>
    </div>
  );
}

export default Events
