import React from 'react'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import { CardSection } from '../common/FormComponent'

export const NUMERIC_EXTRA_KEYS = [
  'units', 'allow_decimal', 'low_absolute', 'hi_absolute',
  'low_critical', 'hi_critical', 'low_normal', 'hi_normal'
]

export const getDatatypeExtraKeys = datatype => {
  if(datatype === 'Numeric')
    return NUMERIC_EXTRA_KEYS
  return datatype === 'Text' ? ['text_format'] : []
}

const ConceptDatatypeSection = ({ datatype, extras, onChange, t }) => {
  if(!getDatatypeExtraKeys(datatype).length)
    return null

  const label = key => t(`concept.form.datatype_metadata.${key}`)
  const allowDecimals = [true, 1, 'true', '1', 'yes'].includes(extras.allow_decimal)
  const textFormat = extras.text_format || 'PLAIN'

  return (
    <CardSection title={label(datatype === 'Numeric' ? 'numeric_header' : 'text_header')}>
      <Box sx={{mt: 2}}>
        {datatype === 'Numeric' ? (
          <React.Fragment>
            <TextField
              fullWidth size='small' label={label('units')} id='datatype-units'
              value={extras.units ?? ''}
              onChange={event => onChange('units', event.target.value)}
            />
            <FormControlLabel
              label={label('allow_decimal')}
              control={<Checkbox checked={allowDecimals} onChange={event => onChange('allow_decimal', event.target.checked)} />}
            />
            {['absolute', 'critical', 'normal'].map(range => (
              <Box key={range} sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', sm: '1fr 1fr'}, gap: 2, mt: 2}}>
                {['low', 'hi'].map(bound => {
                  const key = `${bound}_${range}`
                  return (
                    <TextField
                      key={key} id={`datatype-${key}`} fullWidth size='small'
                      label={label(key)} type='number' value={extras[key] ?? ''}
                      slotProps={{htmlInput: {step: allowDecimals ? 'any' : 1}}}
                      onChange={event => {
                        const value = event.target.value
                        if(value === '' || Number.isFinite(Number(value)))
                          onChange(key, value === '' ? undefined : Number(value))
                      }}
                    />
                  )
                })}
              </Box>
            ))}
          </React.Fragment>
        ) : (
          <TextField
            select fullWidth size='small' id='datatype-text-format'
            label={label('text_format')} value={textFormat}
            onChange={event => onChange('text_format', event.target.value)}
          >
            <MenuItem value='PLAIN'>{label('plain')}</MenuItem>
            <MenuItem value='STRUCTURED'>{label('structured')}</MenuItem>
            {!['PLAIN', 'STRUCTURED'].includes(textFormat) && <MenuItem value={textFormat}>{textFormat}</MenuItem>}
          </TextField>
        )}
      </Box>
    </CardSection>
  )
}

export default ConceptDatatypeSection
