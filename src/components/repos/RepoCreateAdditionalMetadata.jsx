import React from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import VisibilityField from '../common/VisibilityField'
import CustomValidationSchemaField from './CustomValidationSchemaField'
import LimitNotice from '../common/LimitNotice'

const RepoCreateAdditionalMetadata = ({ types, onChange, typeLabel, publicAccess, type, customValidationSchema, website, externalID, validationErrors, visibilityNotice }) => {
  const { t } = useTranslation()
  // A refusal's notice shows under the visibility field, brought into view: Create and Save are at the bottom of the form
  const noticeRef = React.useRef(null)
  React.useEffect(() => {
    if(visibilityNotice)
      noticeRef.current?.scrollIntoView?.({behavior: 'smooth', block: 'center'})
  }, [visibilityNotice])

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
                              error={Boolean(validationErrors?.type)}
                              helperText={validationErrors?.type || ''}
                            />
                }
              />
            </div>
        }
        <VisibilityField style={{marginTop: '24px'}} onChange={onChange} value={publicAccess} />
        {
          visibilityNotice &&
            <div ref={noticeRef} className='col-xs-12 padding-0' style={{marginTop: '12px'}}>
              <LimitNotice size='inline' notice={visibilityNotice} />
            </div>
        }
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
