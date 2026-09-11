import React from 'react';
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import {
  CheckBoxOutlineBlank as UncheckedIcon, CheckBox as CheckedIcon
} from '@mui/icons-material';
import { compact, isArray, orderBy, uniqBy } from 'lodash'
import { TEXT_GRAY } from '../../common/colors'

const LIMIT_TAGS = 24

export const toLocaleCode = value => value?.id || value?.locale || value || ''

// blank for codes the ISO list doesn't know (e.g. "pt_BR"), where the name is just the code again
const toDisplayName = option => (option?.name && option.name !== toLocaleCode(option)) ? option.name : ''

const LocaleSelect = ({ id, label, locales, multiple, limitTags, required, size, disabled, value, error, helperText, focusOnSelect, onChange }) => {
  const fieldId = id || 'locale'
  const isMultiple = Boolean(multiple)

  const selectedCodes = React.useMemo(() => {
    const values = isMultiple ? (isArray(value) ? value : compact([value])) : compact([value])
    return compact(values.map(toLocaleCode))
  }, [value, isMultiple])

  const options = React.useMemo(() => {
    const known = (locales || []).map(locale => ({...locale, id: toLocaleCode(locale)}))
    // a repo can already reference a code the ISO list doesn't have (e.g. "pt_BR"), keep it selectable
    const unknown = selectedCodes
                    .filter(code => !known.some(locale => locale.id === code))
                    .map(code => ({id: code, locale: code, name: code}))
    return orderBy(uniqBy([...known, ...unknown], 'id'), locale => locale.id.toLowerCase(), 'asc')
  }, [locales, selectedCodes])

  const selected = React.useMemo(() => {
    const picked = compact(selectedCodes.map(code => options.find(option => option.id === code)))
    return isMultiple ? picked : (picked[0] || null)
  }, [options, selectedCodes, isMultiple])

  const filterOptions = (opts, state) => {
    const input = (state?.inputValue || '').trim().toLowerCase()
    if(!input)
      return opts
    return opts.filter(
      option => option.id.toLowerCase().includes(input) || (option.name || '').toLowerCase().includes(input)
    )
  }

  const getOptionLabel = option => {
    const code = toLocaleCode(option)
    const name = toDisplayName(option)
    return name ? `${code} ${name}` : code
  }

  const onSelect = (event, item) => {
    onChange(fieldId, isMultiple ? (item || []).map(toLocaleCode) : toLocaleCode(item))
    // single select is done in one click, so hand the user straight to the next field
    if(!isMultiple && item && focusOnSelect)
      setTimeout(() => document.getElementById(focusOnSelect)?.focus(), 0)
  }

  if(!locales?.length)
    return <Skeleton variant='rounded' width='100%' height={size === 'medium' ? 56 : 40} />

  return (
    <Autocomplete
      openOnFocus
      fullWidth
      multiple={isMultiple}
      limitTags={isMultiple ? (limitTags || LIMIT_TAGS) : undefined}
      disableCloseOnSelect={isMultiple}
      blurOnSelect={false}
      disabled={disabled}
      id={fieldId}
      size={size || 'small'}
      options={options}
      value={selected}
      filterOptions={filterOptions}
      isOptionEqualToValue={(option, val) => option.id === toLocaleCode(val)}
      getOptionLabel={getOptionLabel}
      onChange={onSelect}
      renderOption={(props, option, { selected: isChecked }) => {
        const { key, ...optionProps } = props
        return (
          <li key={key || option.id} {...optionProps} style={{alignItems: 'flex-start'}}>
            {
              isMultiple &&
                <Checkbox
                  icon={<UncheckedIcon fontSize='small' />}
                  checkedIcon={<CheckedIcon fontSize='small' />}
                  checked={isChecked}
                  sx={{padding: 0, marginRight: '8px', marginTop: '2px'}}
                />
            }
            <Typography component='span' sx={{color: 'text.secondary', minWidth: '48px', marginRight: '8px'}}>
              {option.id}
            </Typography>
            <Typography component='span'>
              {toDisplayName(option)}
            </Typography>
          </li>
        )
      }}
      renderValue={!isMultiple ? undefined : (values, getItemProps) => values.map((option, index) => {
        const { key, ...tagProps } = getItemProps({index})
        const name = toDisplayName(option)
        return (
          <Chip
            key={key || option.id}
            size='small'
            avatar={name ? <Avatar>{option.id}</Avatar> : undefined}
            label={name || option.id}
            {...tagProps}
            sx={{
              margin: '2px',
              '.MuiChip-avatar': {
                backgroundColor: 'surface.main',
                color: TEXT_GRAY,
                fontSize: '11px',
                fontWeight: 500
              }
            }}
          />
        )
      })}
      renderInput={
        params => <TextField
                    {...params}
                    required={required}
                    label={label}
                    error={Boolean(error)}
                    helperText={helperText}
                    variant='outlined'
                    size={size || 'small'}
                    fullWidth
                  />
      }
    />
  )
}

export default LocaleSelect;
