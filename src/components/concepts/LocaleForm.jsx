import React from 'react';
import { useTranslation } from 'react-i18next';
import TextField from '@mui/material/TextField'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch';
import get from 'lodash/get'
import IconButton from '@mui/material/IconButton'
import DropDownChip from '../common/DropDownChip'
import ExternalIdIcon from '../common/ExternalIdIcon'


const LocaleForm = ({index, locales, idPrefix, localeType, field, localeTypes, onChange}) => {
  const { t } = useTranslation()
  const [showExternalID, setShowExternalID] = React.useState(Boolean(field.external_id.value))
  return (
    <React.Fragment key={index}>
      <div className='col-xs-12' style={{marginTop: '24px', padding: 0}}>
        <div className='col-xs-10 padding-0'>
          <DropDownChip
            id={`${idPrefix}.locale`}
            label={t('concept.form.locale')}
            options={locales?.map(locale => locale.id)}
            onChange={value => onChange(`${idPrefix}.locale`, value || '')}
            sx={{marginRight: '8px'}}
            defaultValue={field.locale.value}
            required
          />
          <TextField
            id={`${idPrefix}.${localeType}`}
            label={t(`concept.form.${localeType}`)}
            variant='outlined'
            required
            size='small'
            onChange={event => onChange(event.target.id, event.target.value || '')}
            value={get(field, `${localeType}.value`)}
            sx={{'.MuiInputBase-root': {paddingLeft: 0}, width: '50%'}}
            error={Boolean(get(field, `${localeType}.errors.length`))}
            helperText={get(field, `${localeType}.errors.0`)}
          />
          <DropDownChip
            color='secondary'
            id={`${idPrefix}.${localeType}_type`}
            options={localeTypes?.map(type => type.id)}
            onChange={value => onChange(`${idPrefix}.${localeType}_type`, value || '')}
            sx={{marginLeft: '8px'}}
            defaultValue={get(field, `${localeType}_type.value`)}
            label={t('concept.form.type')}
            required
            freeSolo
          />
        </div>
        <div className='col-xs-2 padding-0' style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <FormControlLabel
          sx={{ml: 1, '.MuiFormControlLabel-label': {fontSize: '12px'}}}
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
          <IconButton sx={{marginLeft: '4px'}} color={showExternalID ? 'primary' : 'secondary'} onClick={() => setShowExternalID(field.external_id.value ? true : !showExternalID)}>
            <ExternalIdIcon fontSize='inherit' />
    </IconButton>
        </div>
      </div>
      {
      showExternalID &&
          <div className='col-xs-5 padding-0' style={{marginTop: '24px'}}>
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
      }
    </React.Fragment>

  )
}

export default LocaleForm
