import React from 'react';
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'

import APIService from '../../services/APIService'
import { dropVersion } from '../../common/utils'
import AutocompleteLoading from '../common/AutocompleteLoading'
import ConceptListItem from './ConceptListItem'

export const conceptIdFromURL = url => {
  if(!url)
    return ''
  const parts = String(url).replace(/\/$/, '').split('/')
  return decodeURIComponent(parts[parts.length - 1] || '')
}

const isConceptURL = value => Boolean(value) && String(value).includes('/concepts/')

const ParentConceptsForm = ({ t, sourceURL, selfURL, value, onChange }) => {
  const headSourceURL = dropVersion(sourceURL)
  const selfHeadURL = dropVersion(selfURL)

  const [options, setOptions] = React.useState([])
  const [conceptsByURL, setConceptsByURL] = React.useState({})
  const [loading, setLoading] = React.useState(false)
  const [input, setInput] = React.useState('')
  const searchTimer = React.useRef(null)

  const urls = value || []

  const conceptFor = url => conceptsByURL[url] || {url: url, id: conceptIdFromURL(url)}

  const labelFor = url => {
    const id = conceptIdFromURL(url)
    const name = conceptsByURL[url]?.display_name
    return name ? `${id} - ${name}` : id
  }

  const fetchConcepts = query => {
    if(!headSourceURL)
      return
    setLoading(true)
    APIService.new().overrideURL(headSourceURL).appendToUrl('concepts/').get(null, null, {q: query || '', limit: 25})
      .then(response => {
        const concepts = Array.isArray(response?.data) ? response.data : []
        setOptions(concepts.map(concept => dropVersion(concept.url)).filter(url => url && url !== selfHeadURL))
        setConceptsByURL(prev => ({...prev, ...Object.fromEntries(concepts.map(c => [dropVersion(c.url), c]))}))
        setLoading(false)
      })
  }

  const onInputChange = (event, newInput, reason) => {
    if(reason === 'reset')
      return
    setInput(newInput || '')
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => fetchConcepts(newInput), 300)
  }

  React.useEffect(() => () => clearTimeout(searchTimer.current), [])

  return (
    <Autocomplete
      multiple
      freeSolo
      openOnFocus
      filterSelectedOptions
      options={options}
      loading={loading}
      value={urls}
      inputValue={input}
      getOptionLabel={labelFor}
      filterOptions={_options => _options}
      onOpen={() => { if(!options.length) fetchConcepts(input) }}
      onInputChange={onInputChange}
      onChange={(event, items) => { setInput(''); onChange(items.map(item => String(item).trim()).filter(isConceptURL)) }}
      renderOption={(props, option) => {
        const { key, ...listItemProps } = props
        return (
          <React.Fragment key={key || option}>
            <ConceptListItem {...listItemProps} concept={conceptFor(option)} />
            <Divider component='li' style={{listStyle: 'none'}} />
          </React.Fragment>
        )
      }}
      renderTags={(values, getTagProps) => values.map((url, index) => {
        const { key, ...tagProps } = getTagProps({index})
        return (
          <Tooltip key={key} title={url} arrow>
            <Chip size='small' label={labelFor(url)} {...tagProps} />
          </Tooltip>
        )
      })}
      loadingText={<AutocompleteLoading text={input} />}
      noOptionsText={t('common.no_results')}
      renderInput={
        params => <TextField
                    {...params}
                    size='small'
                    label={t('concept.form.parent_concepts')}
                    variant='outlined'
                    fullWidth
                    placeholder={t('concept.form.parent_concepts_placeholder')}
                    helperText={t('concept.form.parent_concepts_help')}
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

export default ParentConceptsForm;
