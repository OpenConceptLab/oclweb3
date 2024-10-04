import React from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import moment from 'moment'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import HighlightIcon from '@mui/icons-material/CampaignOutlined';
import Avatar from '@mui/material/Avatar';
import { WHITE } from '../../common/colors'
import { getSiteTitle } from '../../common/utils'
import EntityIcon from '../common/EntityIcon';
import EntityChip from '../common/EntityChip';
import Link from '../common/Link'

const EventCard = ({ event, highlight }) => {
  const history = useHistory()
  const { t } = useTranslation()
  const getTitle = (event, object, includeSubtitle) => {
    let title = object?.id || object?.username || object?.name
    let subTitle = event?.event_type?.toLowerCase()
    if(event?.referenced_object?.type)
      subTitle += ` ${t('common.a')} ${event.referenced_object?.type?.toLowerCase()}`
    else
      subTitle += ` ${getSiteTitle()}`
    return (
      <span style={{display: 'flex', alignItems: 'center'}}>
        <Typography component='span' sx={{fontWeight: 'bold'}}>
          <Link label={title} href={'#' + object.url} sx={{color: 'secondary.main', fontSize: '16px', fontWeight: 'bold', minWidth: 'auto'}} />
        </Typography>
        {
          includeSubtitle &&
            <Typography component='span' sx={{marginLeft: '4px'}}>
              {subTitle}
            </Typography>
        }
      </span>
    )
  }
  return (
    <Card sx={{boxShadow: 'none', border: '1px solid', borderColor: 'surface.nv80', margin: highlight ? '0 0 16px 0' : '16px 0', borderRadius: '10px'}}>
      <CardHeader
        avatar={
          <Avatar sx={{width: '45px', height: '45px', backgroundColor: event.object?.logo_url ? 'transparent' : 'primary.60', cursor: 'pointer'}} onClick={() => history.push(event.object?.version_url || event.object?.url)}>
            <EntityIcon noLink strict entity={event.object} sx={{color: WHITE}} />
          </Avatar>
        }
        title={getTitle(event, event.object, true)}
        subheader={moment(event.created_at).fromNow()}
      />
      {
        event?.referenced_object?.type &&
          <CardContent sx={{backgroundColor: 'surface.main', margin: '0 16px 16px 16px', borderRadius: '10px', padding: '16px !important', display: 'flex', borderColor: 'surface.main'}}>
            <EntityChip entity={event.referenced_object} sx={{color: WHITE, cursor: 'pointer'}} onClick={() => history.push(event.referenced_object?.version_url || event.referenced_object?.url)} />
          </CardContent>
      }
    </Card>
  )
}

const HighlightCard = props => {
  const { t } = useTranslation()
  return (
    <Card variant="outlined" sx={{backgroundColor: 'surface.main', marginBottom: '16px', borderRadius: '10px'}}>
      <CardHeader
        sx={{
          color: 'surface.contrastText',
          padding: '16px 16px 12px 16px'
        }}
        avatar={
          <Avatar sx={{backgroundColor: 'transparent'}}>
            <HighlightIcon fontSize='large' sx={{color: 'surface.contrastText'}} />
          </Avatar>
        }
        title={
          <Typography sx={{color: 'surface.contrastText', fontSize: '16px', fontWeight: '500'}}>
            {t('common.highlights')}
          </Typography>
        }
      />
      <CardContent sx={{padding: '0 16px', paddingBottom: '0 !important'}}>
        {props.children}
      </CardContent>
    </Card>
  )
}

const DashboardEvents = ({ events, highlight, sx }) => {
  return (
    <div className='col-xs-12 padding-0' style={{maxHeight: '85vh', overflow: 'auto', ...sx}}>
      {
        events.map(event => (
          highlight ?
            <HighlightCard key={event.id}>
              <EventCard key={event.id} event={event} highlight={highlight} />
            </HighlightCard> :
          <EventCard key={event.id} event={event} highlight={highlight} />
        ))
      }
    </div>
  )
}

export default DashboardEvents
