import React from 'react'
import { useTranslation } from 'react-i18next';

import Typography from '@mui/material/Typography'
import ListItemText from '@mui/material/ListItemText'
import TextField from '@mui/material/TextField'

const OrgCreateNameDescription = ({onChange, isEdit, ...rest}) => {
  const { t } = useTranslation()
  let url = rest?.id ? '/orgs/' + rest?.id + '/' : false
  return (
    <>
      <div className='col-xs-12 padding-0'>
        <Typography sx={{fontSize: '16px', fontWeight: 'bold'}}>
          {t('user.name_and_description')}
        </Typography>
      </div>
      <div className='col-xs-12 padding-0' style={{marginTop: '24px', textAlign: 'left'}}>
        <div className='col-xs-3 padding-0'>
          <TextField disabled={isEdit} value={rest.id || ''} label={t('common.id')} required fullWidth onChange={event => onChange('id', event.target.value)} />
        </div>
        {
          url ?
            <div className='col-xs-8 padding-0'>
              <ListItemText
                primary={t('common.your_url_will_be')}
                secondary={url}
                sx={{
                  margin: '-2px 0 0 10px',
                  '.MuiListItemText-primary': {
                    fontSize: '14px',
                    fontWeight: 'normal',
                    color: 'neutral.60'
                  },
                  '.MuiListItemText-secondary': {
                    fontSize: '12px',
                  },
                }}
              />
            </div> : null
        }
      </div>
      <div className='col-xs-12 padding-0' style={{marginTop: '24px', textAlign: 'left'}}>
        <TextField label={t('common.full_name')} fullWidth value={rest.name || ''} onChange={event => onChange('name', event.target.value)} />
      </div>
      <div className='col-xs-12 padding-0' style={{marginTop: '24px', textAlign: 'left'}}>
        <TextField label={t('common.description')} fullWidth multiline rows={3} maxRows={10} value={rest.description || ''} onChange={event => onChange('description', event.target.value)} />
      </div>
      <div className='col-xs-12 padding-0' style={{marginTop: '24px', textAlign: 'left'}}>
        <TextField label={t('common.website')} fullWidth value={rest.website || ''} onChange={event => onChange('website', event.target.value)} />
      </div>
      <div className='col-xs-12 padding-0' style={{marginTop: '24px', textAlign: 'left'}}>
        <div className='col-xs-6 padding-0'>
          <TextField label={t('common.company')} fullWidth value={rest.company || ''} onChange={event => onChange('company', event.target.value)} />
        </div>
        <div className='col-xs-6 padding-right-0'>
          <TextField label={t('common.location')} fullWidth value={rest.location || ''} onChange={event => onChange('location', event.target.value)} />
        </div>
      </div>
    </>
  )
}

export default OrgCreateNameDescription;
