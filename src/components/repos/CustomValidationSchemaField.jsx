import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  FormControl, Select, MenuItem, InputLabel,
} from '@mui/material';
import SelectItemText from '../common/SelectItemText'

const CustomValidationSchemaField = ({value, onChange, style}) => {
  const { t } = useTranslation()
  return (
    <div className='col-xs-12 padding-0 flex-vertical-center' style={{...style}}>
      <FormControl variant="outlined" fullWidth  size="small">
        <InputLabel>{t('repo.custom_validation_schema')}</InputLabel>
        <Select
          label={t('repo.custom_validation_schema')}
          required
          id="customValidationSchema"
          defaultValue="None"
          value={value || 'None'}
          onChange={event => onChange('customValidationSchema', event.target.value)}
        >
          <MenuItem value="None">
            <SelectItemText
              value='None'
              primaryText='None'
              secondaryText="Default validation schema"
            />
          </MenuItem>
          <MenuItem value='OpenMRS'>
            <SelectItemText
              value='OpenMRS'
              primaryText='OpenMRS Validation Schema'
              secondaryText="Custom OpenMRS Validation schema"
            />
          </MenuItem>
        </Select>
      </FormControl>
    </div>
  )
}

export default CustomValidationSchemaField;
