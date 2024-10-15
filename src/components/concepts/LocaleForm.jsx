import React from 'react';
import { useTranslation } from 'react-i18next';
import TextField from '@mui/material/TextField'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch';
import get from 'lodash/get'
import AutocompleteGroupByRepoSummary from '../common/AutocompleteGroupByRepoSummary'
import LocaleAutoComplete from './LocaleAutoComplete'


const LocaleForm = ({index, locales, idPrefix, localeType, field, localeTypes, onChange, edit}) => {
  const { t } = useTranslation()
  return (
    <React.Fragment key={index}>
      <div className='col-xs-4' style={{marginTop: '24px', padding: '0 8px 0 0'}}>
        <LocaleAutoComplete
          id={`${idPrefix}.locale`}
          cachedLocales={locales}
          value={field.locale.value}
          label={t('concept.form.locale')}
          required
          size='small'
          onChange={onChange}
        />
      </div>
      <div className='col-xs-8' style={{marginTop: '24px', padding: '0 0 0 8px'}}>
        <TextField
          fullWidth
          id={`${idPrefix}.${localeType}`}
          label={t(`concept.form.${localeType}`)}
          variant='outlined'
          required
          size='small'
          onChange={event => onChange(event.target.id, event.target.value || '')}
          value={get(field, `${localeType}.value`)}
        />
      </div>
      <div className='col-xs-5' style={{marginTop: '24px', padding: '0 8px 0 0', width: '45%'}}>
        <AutocompleteGroupByRepoSummary
          id={`${idPrefix}.${localeType}_type`}
          options={localeTypes}
          label={t('concept.form.type')}
          value={get(field, `${localeType}_type.value`)}
          edit={edit}
          required
          freeSolo
        />
      </div>
      <div className='col-xs-5' style={{marginTop: '24px', padding: '0 8px 0 8px', width: '45%'}}>
        <TextField
          fullWidth
          id={`${idPrefix}.external_id`}
          label={t('concept.form.external_id')}
          value={field.external_id.value}
          variant='outlined'
          size='small'
          onChange={event => onChange(event.target.id, event.target.value || '')}
        />
      </div>
      <div className='col-xs-1' style={{marginTop: '24px', padding: '0 0 0 8px', width: '10%', textAlign: 'right'}}>
        <FormControlLabel
          sx={{m: 0, '.MuiFormControlLabel-label': {fontSize: '12px'}}}
          labelPlacement="top"
          id={`${idPrefix}.locale_preferred`}
          control={
            <Switch
              id={`${idPrefix}.locale_preferred`}
              size='small'
              sx={{ m: 0 }}
              checked={Boolean(field.locale_preferred.value)}
            />
          }
          label={t('concept.form.locale_preferred')}
          size='small'
          onChange={event => onChange(event.target.id, event.target.checked || false)}
          checked={Boolean(field.locale_preferred.value)}
        />
      </div>
    </React.Fragment>

  )
}

export default LocaleForm
