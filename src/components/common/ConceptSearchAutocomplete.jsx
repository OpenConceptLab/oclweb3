import React from 'react';
import { useTranslation } from 'react-i18next';
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import { debounce, get } from 'lodash'

import APIService from '../../services/APIService'
import AutocompleteLoading from './AutocompleteLoading'

const MIN_LENGTH = 1

const ConceptSearchAutocomplete = ({ id, label, required, size, parentURI, disabled, value, freeSolo, onChange, onInputChange }) => {
  const { t } = useTranslation()
  const fieldId = id || 'concept'
  const [input, setInput] = React.useState('')
  const [concepts, setConcepts] = React.useState([])
  const [loading, setLoading] = React.useState(false)

  const fetchConcepts = searchStr => {
    setLoading(true)
    setConcepts([])
    const service = parentURI ? APIService.new().overrideURL(parentURI).appendToUrl('concepts/') : APIService.concepts()
    service.get(null, null, {limit: 10, q: searchStr}).then(response => {
      setConcepts(response.data || [])
      setLoading(false)
    })
  }

  const handleInputChange = React.useMemo(() => debounce((event, newInput, reason) => {
    setInput(newInput || '')
    if(reason !== 'reset' && newInput && newInput.length >= MIN_LENGTH)
      fetchConcepts(newInput)
    else
      setLoading(false)
    if(freeSolo && onInputChange)
      onInputChange(fieldId, newInput || '')
  }, 300), [parentURI])

  React.useEffect(() => () => handleInputChange.cancel(), [handleInputChange])

  React.useEffect(() => {
    if(!value) {
      setInput('')
      setConcepts([])
    }
  }, [value])

  return (
    <Autocomplete
      freeSolo={freeSolo}
      disabled={disabled}
      openOnFocus
      blurOnSelect
      filterOptions={options => options}
      isOptionEqualToValue={(option, val) => option.url === get(val, 'url')}
      value={value || null}
      id={fieldId}
      size={size || 'small'}
      options={concepts}
      loading={loading}
      loadingText={<AutocompleteLoading text={input} />}
      noOptionsText={t('common.no_results')}
      getOptionLabel={option => option?.id || option || ''}
      fullWidth
      onInputChange={handleInputChange}
      onChange={(event, item) => onChange(fieldId, item)}
      renderOption={(props, option) => {
        const { key, ...listItemProps } = props
        return (
          <React.Fragment key={key || option.url}>
            <ListItem {...listItemProps}>
              <ListItemText primary={option.display_name} secondary={`${option.id} • ${option.concept_class}`} />
            </ListItem>
            <Divider component='li' style={{listStyle: 'none'}} />
          </React.Fragment>
        )
      }}
      renderInput={
        params => <TextField
                    {...params}
                    required={required}
                    label={label || t('concept.concept')}
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

export default ConceptSearchAutocomplete;
