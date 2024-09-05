import React from 'react'
import { useTranslation } from 'react-i18next';
import startCase from 'lodash/startCase'
import DoneIcon from '@mui/icons-material/Done';
import ButtonGroup from '@mui/material/ButtonGroup'
import Button from '@mui/material/Button'

const EventButton = ({ label, selected, terminal, onClick }) => {
  return (
    <Button id={label} sx={{textTransform: 'none', fontWeight: 'bold', backgroundColor: selected ? 'surface.s90' : '', borderRadius: terminal ? '25px' : undefined}} color='secondary' startIcon={selected ? <DoneIcon fontSize='inherit' /> : undefined} onClick={onClick}>
      {label}
    </Button>
  )
}

const EventsButtonGroup = ({ onClick, selected }) => {
  const { t } = useTranslation()
  return (
    <ButtonGroup size="small" aria-label="Small button group" color='secondary'>
      <EventButton label={t('common.all')} selected={selected === 'all'} terminal onClick={() => onClick('all')} />
      <EventButton label={t('common.following')} selected={selected === 'following'} onClick={() => onClick('following')} />
      <EventButton label={startCase(t('org.my'))} selected={selected === 'orgs'} terminal onClick={() => onClick('orgs')} />
    </ButtonGroup>
  )
}

export default EventsButtonGroup;
