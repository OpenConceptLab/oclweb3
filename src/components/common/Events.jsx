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
import TimelineOppositeContent, {
  timelineOppositeContentClasses,
} from '@mui/lab/TimelineOppositeContent';
import TimelineDot from '@mui/lab/TimelineDot';
import Typography from '@mui/material/Typography';
import { formatTime, formatDate } from '../../common/utils'
import EntityIcon from '../common/EntityIcon';
import Link from '../common/Link'
import UserIcon from '../users/UserIcon'

const EventDescription = ({ event, isFirst, isLast }) => {
  const { event_type, description, referenced_object} = event;
  const getDescription = () => {
    let eventDescription = description
    let rel;
    if(event_type && !isEmpty(referenced_object)) {
      eventDescription = `${event_type} ${referenced_object.type} `
      if(['Source Version', 'Collection Version'].includes(referenced_object.type)) {
        rel = `${referenced_object.short_code}/${referenced_object.id}`
      } else
        rel = referenced_object.name || referenced_object.id
    }
    return {eventDescription, rel}
  }
  const {eventDescription, rel} = getDescription()
  return (
    <Typography sx={{fontSize: '14px', alignItems: 'center', marginTop: isFirst ? '2px' :  (isLast ? '12px' : '8px'), display: 'block'}}>
      {eventDescription}
      {
        rel ?
          <Link href={'#' + (event.referenced_object?.version_url || event.referenced_object?.url)} label={rel} sx={{fontSize: '14px', paddingLeft: 0, minWidth: 'auto', paddingTop: '1px'}} /> :
        null
      }
    </Typography>
  )
}


const Event = ({ event, isFirst, isLast }) => {
  const hasReferencedObjectLogo = Boolean(event.referenced_object?.logo_url)
  let dotStyle = hasReferencedObjectLogo ? {padding: 0, borderWidth: '1px'} : {}
  return (
    <TimelineItem>
      <TimelineOppositeContent
        sx={{ m: 'auto 0', fontSize: '12px', paddingRight: '19px', paddingLeft: 0 }}
        align="right"
        variant="body2"
        color="default.light"
      >
        {moment(event.created_at).fromNow()}
      </TimelineOppositeContent>
      <TimelineSeparator>
        { !isFirst && <TimelineConnector /> }
        <TimelineDot sx={{backgroundColor: event.referenced_object?.logo_url ? 'transparent' : 'primary.60', ...dotStyle}}>
          <EntityIcon noLink strict entity={event.referenced_object} isVersion={(event.referenced_object?.short_code && event.referenced_object?.version_url)} sx={{color: '#FFF'}} logoClassName='user-img-xsmall' />
        </TimelineDot>
        { !isLast && <TimelineConnector /> }
      </TimelineSeparator>
      <TimelineContent sx={{ py: '12px', px: '19px', color: 'rgba(0, 0, 0, 0.87)'}}>
        <EventDescription event={event} isFirst={isFirst} isLast={isLast} />
      </TimelineContent>
    </TimelineItem>
  )
}

const Events = ({ user, events, onLoadMore, showAvatar, moreMarginLeft }) => {
  const { t } = useTranslation()

  return (
    <div className='col-xs-12 padding-0'>
      <Typography component='h3' sx={{margin: '16px 0', fontWeight: 'bold', display: 'flex', alignItems: 'center'}}>
          {
            showAvatar &&
              <UserIcon user={user} sx={{width: '40px', height: '40px', marginRight: '16px'}} color='primary' />
          }
        {`${t('user.your')} ${t('user.recent_activity')}`}
      </Typography>
      <Timeline
        id="events-timeline"
        sx={{
          [`& .${timelineOppositeContentClasses.root}`]: {
            flex: moreMarginLeft ? 0.25 : 0.1,
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
            <TimelineItem sx={{minHeight: '20px'}}>
              <TimelineOppositeContent
                sx={{ m: 0, fontSize: '12px', px: '19px', height: 0 }}
                variant="body2"
              />
              <TimelineSeparator>
                <TimelineDot sx={{backgroundColor: 'transparent', boxShadow: 'none', marginLeft: moreMarginLeft || '-35px', marginTop: 0, marginBottom: 0, height: '20px'}}>
                  <Link
                    label={t('common.more')}
                    onClick={onLoadMore}
                    sx={{fontSize: '12px'}}
                  />
                </TimelineDot>
              </TimelineSeparator>
              <TimelineContent sx={{m: 0, height: 0}} />
            </TimelineItem>
        }
      </Timeline>
    </div>
  );
}

export default Events
