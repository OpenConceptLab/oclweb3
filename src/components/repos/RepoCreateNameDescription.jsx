import React from 'react'
import { useTranslation } from 'react-i18next';

import Typography from '@mui/material/Typography'
import ListItemText from '@mui/material/ListItemText'
import TextField from '@mui/material/TextField'

import NamespaceDropdown from '../url-registry/NamespaceDropdown'


const RepoCreateNameDescription = ({url, ownerURL, onOwnerChange, onChange, isEdit, ...rest}) => {
  const { t } = useTranslation()
  return (
    <>
      <div className='col-xs-12 padding-0'>
        <Typography sx={{fontSize: '16px', fontWeight: 'bold'}}>
          {t('user.name_and_description')}
        </Typography>
      </div>
      <div className='col-xs-12 padding-0' style={{marginTop: '24px', textAlign: 'left'}}>
        <div className='col-xs-4 padding-0'>
          <NamespaceDropdown
            asOwner
            disabled={isEdit}
            size='small'
            label={t('common.owner')}
            id='repo.owner'
            owner={ownerURL}
            onChange={onOwnerChange}
          />
        </div>
        <div className='col-xs-1' style={{display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', marginTop: '-5px', padding: '0 10px', width: '34px'}}>
          <Typography sx={{fontSize: '32px', color: 'neutral.70'}}>
            /
          </Typography>
        </div>
        <div className='col-xs-3 padding-0'>
          <TextField disabled={isEdit} value={rest.id || ''} label={t('repo.short_code')} required fullWidth onChange={event => onChange('id', event.target.value)} />
        </div>
        {
          url ?
            <div className='col-xs-4 padding-0'>
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
        <div className='col-xs-7 padding-0'>
          <TextField label={t('repo.full_name')} fullWidth value={rest.fullName || ''} onChange={event => onChange('fullName', event.target.value)} />
        </div>
        <div className='col-xs-5' style={{padding: '0 0 0 10px'}}>
          <TextField label={t('repo.short_name')} fullWidth required value={rest.name || ''} onChange={event => onChange('name', event.target.value)} />
        </div>
      </div>
      <div className='col-xs-12 padding-0' style={{marginTop: '24px', textAlign: 'left'}}>
        <TextField type='url' label={t('url_registry.canonical_url')} fullWidth value={rest.canonicalURL || ''} onChange={event => onChange('canonicalURL', event.target.value)} />
      </div>
      <div className='col-xs-12 padding-0' style={{marginTop: '24px', textAlign: 'left'}}>
        <TextField label={t('common.description')} fullWidth multiline rows={3} maxRows={10} value={rest.description || ''} onChange={event => onChange('description', event.target.value)} />
      </div>
    </>
  )
}

export default RepoCreateNameDescription;
