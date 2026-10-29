import React from 'react'
import { useTranslation } from 'react-i18next';
import DoneIcon from '@mui/icons-material/Done';
import ButtonGroup from '@mui/material/ButtonGroup'
import Button from '@mui/material/Button'

const EventButton = ({ label, selected, terminal, onClick }) => {
  return (
    <Button id={label} sx={[{
      textTransform: 'none',
      fontWeight: 'bold'
    }, selected ? {
      backgroundColor: 'surface.s90'
    } : {
      backgroundColor: ''
    }, terminal ? {
      borderRadius: '25px'
    } : {
      borderRadius: null
    }]} color='secondary' startIcon={selected ? <DoneIcon fontSize='inherit' /> : undefined} onClick={onClick}>
      {label}
    </Button>
  );
}
const EventsButtonGroup = ({ onClick, selected, community, communityOnly }) => {
  const { t } = useTranslation()
  if(communityOnly)
    return (
      <ButtonGroup size="small" aria-label="Community feed" color='secondary'>
        <EventButton label={t('dashboard.community_feed')} selected terminal onClick={() => onClick('community')} />
      </ButtonGroup>
    )
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
      {
        community &&
          <ButtonGroup size="small" aria-label="Community feed" color='secondary'>
            <EventButton label={t('dashboard.community_feed')} selected={selected === 'community'} terminal onClick={() => onClick('community')} />
          </ButtonGroup>
      }
      <ButtonGroup size="small" aria-label="Small button group" color='secondary'>
        <EventButton label={t('common.all')} selected={selected === 'all'} terminal onClick={() => onClick('all')} />
        <EventButton label={t('common.following')} selected={selected === 'following'} onClick={() => onClick('following')} />
        <EventButton label={t('org.my')} selected={selected === 'orgs'} terminal onClick={() => onClick('orgs')} />
      </ButtonGroup>
    </div>
  )
}
export default EventsButtonGroup;