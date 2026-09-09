import React from 'react';
import { useTranslation } from 'react-i18next';
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import { debounce, get } from 'lodash'

import APIService from '../../services/APIService'
import AutocompleteLoading from './AutocompleteLoading'
import ConceptListItem from '../concepts/ConceptListItem'

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

  const options = React.useMemo(() => {
    const selectedURL = get(value, 'url')
    if(!selectedURL || concepts.some(concept => concept.url === selectedURL))
      return concepts
    return [value, ...concepts]
  }, [concepts, value])

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
      options={options}
      loading={loading}
      loadingText={<AutocompleteLoading text={input} />}
      noOptionsText={input ? t('common.no_results') : t('common.type_to_search')}
      getOptionLabel={option => {
        const id = get(option, 'id') || option || ''
        const name = get(option, 'display_name')
        return (!freeSolo && name) ? `${id} ${name}` : id
      }}
      fullWidth
      onInputChange={handleInputChange}
      onChange={(event, item) => onChange(fieldId, item)}
      renderOption={(props, option) => {
        const { key, ...listItemProps } = props
        return (
          <React.Fragment key={key || option.url}>
            <ConceptListItem {...listItemProps} concept={option} showSource={!parentURI} />
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
