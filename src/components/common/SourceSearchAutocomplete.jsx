import React from 'react';
import { useTranslation } from 'react-i18next';
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import { debounce, get, map } from 'lodash'

import APIService from '../../services/APIService'
import AutocompleteLoading from './AutocompleteLoading'
import GroupHeader from './GroupHeader'
import GroupItems from './GroupItems'

const MIN_LENGTH = 2

const SourceSearchAutocomplete = ({ id, label, required, size, suggested, value, disabled, error, helperText, onChange }) => {
  const { t } = useTranslation()
  const fieldId = id || 'source'
  const suggestions = map(suggested || [], source => ({...source, resultType: t('repo.suggested_sources')}))
  const [input, setInput] = React.useState('')
  const [sources, setSources] = React.useState(suggestions)
  const [selected, setSelected] = React.useState(value || null)
  const [loading, setLoading] = React.useState(false)

  const fetchSources = searchStr => {
    setLoading(true)
    setSources([])
    APIService.sources().get(null, null, {limit: 25, q: searchStr}).then(response => {
      setSources(map(response.data || [], source => ({...source, resultType: t('common.results')})))
      setLoading(false)
    })
  }

  const onInputChange = React.useMemo(() => debounce((event, newInput, reason) => {
    setInput(newInput || '')
    if(reason !== 'reset' && newInput && newInput.length >= MIN_LENGTH)
      fetchSources(newInput)
    else {
      setLoading(false)
      if(!newInput)
        setSources(suggestions)
    }
  }, 300), [])

  React.useEffect(() => () => onInputChange.cancel(), [onInputChange])

  React.useEffect(() => setSelected(value || null), [value])

  const options = React.useMemo(() => {
    const selectedURL = get(selected, 'url')
    if(!selectedURL || sources.some(source => source.url === selectedURL))
      return sources
    return [{...selected, resultType: t('common.results')}, ...sources]
  }, [sources, selected])

  return (
    <Autocomplete
      openOnFocus
      blurOnSelect
      disabled={disabled}
      filterOptions={options => options}
      isOptionEqualToValue={(option, val) => option.url === get(val, 'url')}
      value={selected}
      id={fieldId}
      size={size || 'small'}
      options={options}
      loading={loading}
      loadingText={<AutocompleteLoading text={input} />}
      noOptionsText={t('common.no_results')}
      getOptionLabel={option => option?.name || option?.short_code || option?.id || ''}
      groupBy={option => option.resultType}
      renderGroup={params => (
        <li style={{listStyle: 'none'}} key={params.group || 'none'}>
          <GroupHeader>{params.group}</GroupHeader>
          <GroupItems>{params.children}</GroupItems>
        </li>
      )}
      fullWidth
      onInputChange={onInputChange}
      onChange={(event, item) => { setSelected(item || null); onChange(fieldId, item) }}
      renderOption={(props, option) => {
        const { key, ...listItemProps } = props
        return (
          <React.Fragment key={key || option.url}>
            <ListItem {...listItemProps}>
              <ListItemText primary={option.name || option.short_code || option.id} secondary={option.owner} />
            </ListItem>
            <Divider component='li' style={{listStyle: 'none'}} />
          </React.Fragment>
        )
      }}
      renderInput={
        params => <TextField
                    {...params}
                    required={required}
                    error={Boolean(error)}
                    helperText={helperText}
                    label={label || t('repo.source')}
                    variant='outlined'
                    size={size || 'small'}
                    fullWidth
                    slotProps={{
                      ...params.slotProps,
                      input: {
                        ...params.slotProps?.input,
                        endAdornment: (
                          <React.Fragment>
                            {loading ? <CircularProgress color='inherit' size={16} /> : null}
                            {params.slotProps?.input?.endAdornment}
                          </React.Fragment>
                        )
                      }
                    }}
                  />
      }
    />
  )
}

export default SourceSearchAutocomplete;
