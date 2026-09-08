import React from 'react';
import { useTranslation } from 'react-i18next';
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import DataObjectIcon from '@mui/icons-material/DataObject'

export const isBlankJSONString = value => value === undefined || value === null || !String(value).trim()

export const isValidJSONString = value => {
  if(isBlankJSONString(value))
    return true
  try {
    JSON.parse(value)
    return true
  } catch {
    return false
  }
}

export const jsonToString = value => {
  if(value === undefined || value === null || value === '')
    return ''
  if(typeof value === 'string')
    return value
  return JSON.stringify(value, null, 2)
}

export const stringToJSON = value => {
  if(isBlankJSONString(value))
    return null
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

const JSONTextField = ({ label, value, onChange, error, helperText, minRows, maxRows, ...rest }) => {
  const { t } = useTranslation()
  const isInvalid = !isValidJSONString(value)
  const canPrettify = !isInvalid && !isBlankJSONString(value)

  const onPrettify = () => onChange(JSON.stringify(JSON.parse(value), null, 2))

  return (
    <TextField
      label={label}
      fullWidth
      multiline
      minRows={minRows || 3}
      maxRows={maxRows || 12}
      value={value || ''}
      onChange={event => onChange(event.target.value)}
      error={Boolean(error) || isInvalid}
      helperText={error || (isInvalid ? t('errors.invalid_json') : (helperText || t('common.json_helper_text')))}
      slotProps={{
        input: {
          sx: {fontFamily: 'monospace', fontSize: '13px', alignItems: 'flex-start'},
          endAdornment: (
            <InputAdornment position='end' sx={{alignSelf: 'flex-start', marginTop: '8px'}}>
              <Tooltip title={t('common.format_json')}>
                <span>
                  <IconButton size='small' disabled={!canPrettify} onClick={onPrettify}>
                    <DataObjectIcon fontSize='inherit' />
                  </IconButton>
                </span>
              </Tooltip>
            </InputAdornment>
          )
        }
      }}
      {...rest}
    />
  )
}

export default JSONTextField;
