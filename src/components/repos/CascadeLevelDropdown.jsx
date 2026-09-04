import React from 'react'
import { useTranslation } from 'react-i18next'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import { find } from 'lodash'
import { ALL } from '../../common/constants'

const CascadeLevelDropdown = ({ value, label, placeholder, disabled, backgroundColor, onChange }) => {
  const { t } = useTranslation()
  const options = [
    ...['1', '2', '3', '4', '5'].map(id => ({ id, name: id })),
    { id: ALL, name: t('common.all') },
  ]

  return (
    <Autocomplete
      options={options}
      value={find(options, { id: value }) || null}
      size='small'
      disabled={disabled}
      getOptionLabel={option => option.name || ''}
      isOptionEqualToValue={(option, selected) => option.id === selected.id}
      onChange={(event, option) => onChange(option?.id)}
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          size='small'
          sx={{ backgroundColor: backgroundColor || 'primary.contrastText' }}
        />
      )}
    />
  )
}

export default CascadeLevelDropdown
