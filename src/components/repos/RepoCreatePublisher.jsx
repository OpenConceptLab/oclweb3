import React from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'

const RepoCreatePublisher = ({ onChange, config, ...rest }) => {
  const { t } = useTranslation()
  const fields = config.fields
  const booleanFields = fields.filter(field => field.type === 'boolean')
  const booleanGridSize = parseInt(12 / ((booleanFields?.length || 1) + 1))

  return (
    <>
      <div className='col-xs-12 padding-0'>
        <Typography sx={{fontSize: '16px', fontWeight: 'bold'}}>
          {t('repo.publisher_information')}
        </Typography>
        <div className='col-xs-12 padding-0' style={{marginTop: '24px'}}>
          <TextField label={t('repo.publisher')} fullWidth value={rest.publisher || ''} onChange={event => onChange('publisher', event.target.value)} />
        </div>
        <div className='col-xs-12 padding-0' style={{marginTop: '24px'}}>
          <div className='col-xs-6 padding-0'>
            <TextField label={t('repo.jurisdiction')} fullWidth value={rest.jurisdiction || ''} onChange={event => onChange('jurisdiction', event.target.value)} />
          </div>
          <div className='col-xs-6' style={{padding: '0 0 0 10px'}}>
            <TextField label={t('repo.purpose')} fullWidth value={rest.purpose || ''} onChange={event => onChange('purpose', event.target.value)} />
          </div>
        </div>
        <div className='col-xs-12 padding-0' style={{marginTop: '24px'}}>
          <div className='col-xs-6 padding-0'>
            <TextField label={t('repo.copyright')} fullWidth value={rest.copyright || ''} onChange={event => onChange('copyright', event.target.value)} />
          </div>
          <div className='col-xs-6' style={{padding: '0 0 0 10px'}}>
            <TextField label={t('repo.identifier')} fullWidth value={rest.identifier || ''} onChange={event => onChange('identifier', event.target.value)} />
          </div>
        </div>
        <div className='col-xs-12 padding-0' style={{marginTop: '24px'}}>
          <div className='col-xs-6 padding-0'>
            <TextField label={t('repo.contact')} fullWidth value={rest.contact || ''} onChange={event => onChange('contact', event.target.value)} />
          </div>
          {
            fields.find(field => field.id === 'contentType') ?
              <div className='col-xs-6' style={{padding: '0 0 0 10px'}}>
                <TextField label={t('repo.content_type')} fullWidth value={rest.contentType || ''} onChange={event => onChange('contentType', event.target.value)} />
              </div> :
            null
          }
        </div>
        <div className='col-xs-12 padding-0' style={{marginTop: '24px'}}>
          <div className='col-xs-6 padding-0'>
            <TextField label={t('repo.meta')} fullWidth value={rest.meta || ''} onChange={event => onChange('meta', event.target.value)} />
          </div>
          <div className='col-xs-6' style={{padding: '0 0 0 10px'}}>
            <TextField label={t('repo.revision_date')} fullWidth type='date' value={rest.revisionDate || ''} onChange={event => onChange('revisionDate', event.target.value)} InputLabelProps={{shrink: true}} />
          </div>
        </div>
        <div className='col-xs-12 padding-0' style={{marginTop: '24px'}}>
          <div className={`col-xs-${booleanGridSize} padding-0`}>
            <FormControlLabel
              control={<Switch size='small' color="primary" checked={rest.experimental || false} onChange={event => onChange('experimental', event.target.checked)} />}
              label={t('repo.experimental')}
              labelPlacement="end"
              sx={{'.MuiTypography-root': {fontSize: '14px'}, marginLeft: 0}}
            />
          </div>
          {
            booleanFields.map(field => (
              <div className={`col-xs-${booleanGridSize}`} style={{padding: '0 0 0 10px'}} key={field.id}>
                <FormControlLabel
                  control={<Switch size='small' color="primary" checked={rest[field.id] || false} onChange={event => onChange(field.id, event.target.checked)} />}
                  label={field.label}
                  labelPlacement="end"
                  size='small'
                  sx={{'.MuiTypography-root': {fontSize: '14px'}, marginLeft: 0}}
                />
              </div>
            ))
          }
        </div>
      </div>
    </>
  )
}
export default RepoCreatePublisher;
