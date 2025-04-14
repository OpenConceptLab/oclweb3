import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  FormControl, Select, MenuItem, InputLabel
} from '@mui/material';
import {
  Public as PublicIcon,
  Lock as PrivateIcon,
} from '@mui/icons-material';
import SelectItemText from './SelectItemText'


const VisibilityField = ({ value, onChange, style }) => {
  const { t } = useTranslation()

  return (
    <div className='col-xs-12 padding-0 flex-vertical-center' style={{...style}}>
      <FormControl variant="outlined" fullWidth  size="small">
        <InputLabel>{t('common.visibility')}</InputLabel>
        <Select
          label={t('common.visibility')}
          required
          id="publicAccess"
          defaultValue="View"
          value={value || ''}
          onChange={event => onChange('publicAccess', event.target.value)}
        >
          <MenuItem value="View">
            <SelectItemText
              icon={<PublicIcon fontSize="small" />}
              primaryText="Public (read only)"
              secondaryText={`Anyone can view the content in this Repository`}
            />
          </MenuItem>
          <MenuItem value='Edit'>
            <SelectItemText
              icon={<PublicIcon fontSize="small" />}
              primaryText="Public (read/write)"
              secondaryText={`Anyone can view/edit the content in this Repository`}
            />
          </MenuItem>
          <MenuItem value='None'>
            <SelectItemText
              icon={<PrivateIcon fontSize="small" />}
              primaryText="Private"
              secondaryText={`Only users with access can view the content in this Repository`}
            />
          </MenuItem>
        </Select>
      </FormControl>
    </div>
  )
}

export default VisibilityField;
