import React from 'react';
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import Skeleton from '@mui/material/Skeleton'
import find from 'lodash/find'
import GroupHeader from './GroupHeader';
import GroupItems from './GroupItems';
import { generateRandomString } from '../../common/utils'

const AutocompleteGroupByRepoSummary = ({id, options, label, value, onChange, edit, required, freeSolo, helperText, error}) => {
  const selected = find(options, {id: value}) || (freeSolo ? {id: value, name: value, resultType: 'Suggested'} : '')
  const isLoaded = options?.length && (!edit || !required || value)
  return isLoaded ?
    <Autocomplete
      openOnFocus
      freeSolo={freeSolo}
      id={id}
      options={options}
      getOptionLabel={option => option.name || ''}
      fullWidth
      required
      groupBy={option => option.resultType}
      renderGroup={(params) => {
        const key = params.key || params.group || generateRandomString()
        return (
          <li key={key} style={{listStyle: 'none'}}>
          <GroupHeader>{params.group}</GroupHeader>
          <GroupItems>{params.children}</GroupItems>
        </li>
        )
      }}
      size='small'
      renderInput={
        params => <TextField
                    {...params}
                    required={required}
                    label={label}
                    variant="outlined"
                    size='small'
                    fullWidth
                    helperText={helperText}
                    error={error}
                  />
      }
      onChange={(event, value) => onChange(id, value?.id || '')}
      value={selected}
    />
  : <Skeleton variant="rounded" width='100%' height={40} />
}

export default AutocompleteGroupByRepoSummary
