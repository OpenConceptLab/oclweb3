import React from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import VisibilityField from '../common/VisibilityField'
import CustomValidationSchemaField from './CustomValidationSchemaField'

const RepoCreateAdditionalMetadata = ({ types, onChange, typeLabel, publicAccess, type, customValidationSchema, website, externalID }) => {
  const { t } = useTranslation()

  return (
    <>
      <div className='col-xs-12 padding-0'>
        <Typography sx={{fontSize: '16px', fontWeight: 'bold'}}>
          {t('repo.additional_meta_data')}
        </Typography>
        {
          types?.length > 0 &&
            <div className='col-xs-12 padding-0' style={{marginTop: '24px'}}>
              <Autocomplete
                openOnFocus
                blurOnSelect
                value={type ? types.find(_type => _type.id === type) : ''}
                isOptionEqualToValue={(option, value) => option?.id === value}
                options={types}
                getOptionLabel={(option) => option?.name || ''}
                onChange={(event, item) => onChange('type', item)}
                fullWidth
                required
                size='small'
                renderInput={
                  params => <TextField
                              {...params}
                              required
                              label={typeLabel}
                              variant="outlined"
                              fullWidth
                            />
                }
              />
            </div>
        }
        <VisibilityField style={{marginTop: '24px'}} onChange={onChange} value={publicAccess} />
        <CustomValidationSchemaField style={{marginTop: '24px'}} onChange={onChange} value={customValidationSchema} />
        <div className='col-xs-12 padding-0' style={{marginTop: '24px'}}>
          <TextField label={t('common.website')} type='url' fullWidth value={website || ''} onChange={event => onChange('website', event.target.value)} />
        </div>
        <div className='col-xs-12 padding-0' style={{marginTop: '24px'}}>
          <TextField label={t('common.external_id')} fullWidth value={externalID || ''} onChange={event => onChange('externalID', event.target.value)} />
        </div>
      </div>
    </>
  )
}
export default RepoCreateAdditionalMetadata;
