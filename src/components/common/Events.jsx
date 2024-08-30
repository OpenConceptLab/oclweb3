import * as React from 'react';
import { useTranslation } from 'react-i18next';
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
    <Typography sx={{fontSize: '14px', display: 'flex', alignItems: 'center', marginTop: isFirst ? '2px' :  (isLast ? '12px' : '8px')}}>
      {eventDescription}
      {
        rel ?
          <Link href={'#' + (event.referenced_object?.version_url || event.referenced_object?.url)} label={rel} sx={{fontSize: '14px', paddingLeft: '4px', minWidth: 'auto'}} /> :
        null
      }
    </Typography>
  )
}


const Event = ({ event, isFirst, isLast }) => {
  return (
    <TimelineItem>
      <TimelineOppositeContent
        sx={{ m: 'auto 0', fontSize: '12px', px: '19px' }}
        align="right"
        variant="body2"
        color="default.light"
      >
        {formatDate(event.created_at)}
        <Typography sx={{fontSize: '12px'}}>
          {formatTime(event.created_at)}
        </Typography>
      </TimelineOppositeContent>
      <TimelineSeparator>
        { !isFirst && <TimelineConnector /> }
        <TimelineDot sx={{backgroundColor: 'primary.60'}}>
          <EntityIcon noLink strict entity={event.referenced_object} isVersion={(event.referenced_object?.short_code && event.referenced_object?.version_url)} sx={{color: '#FFF'}} />
        </TimelineDot>
        { !isLast && <TimelineConnector /> }
      </TimelineSeparator>
      <TimelineContent sx={{ py: '12px', px: '19px', color: 'rgba(0, 0, 0, 0.87)'}}>
        <EventDescription event={event} isFirst={isFirst} isLast={isLast} />
      </TimelineContent>
    </TimelineItem>
  )
}

const Events = ({ user, events, onLoadMore }) => {
  const { t } = useTranslation()

  return (
    <div className='col-xs-12 padding-0'>
      <Typography component='h3' sx={{margin: '16px 0', fontWeight: 'bold', display: 'flex'}}>
        {`${user.first_name}'s ${t('user.recent_activity')}`}
      </Typography>
      <Timeline
        id="events-timeline"
        sx={{
          [`& .${timelineOppositeContentClasses.root}`]: {
            flex: 0.2,
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
            <TimelineItem>
              <TimelineOppositeContent
                sx={{ m: 'auto 0', fontSize: '12px', px: '19px' }}
                variant="body2"
              />
              <TimelineSeparator>
                <TimelineDot sx={{backgroundColor: 'transparent', boxShadow: 'none', marginLeft: '-15px', marginTop: 0}}>
                  <Link
                    label={t('common.more')}
                    onClick={onLoadMore}
                    sx={{fontSize: '12px'}}
                  />
                </TimelineDot>
              </TimelineSeparator>
              <TimelineContent />
            </TimelineItem>
        }
      </Timeline>
    </div>
  );
}

export default Events
