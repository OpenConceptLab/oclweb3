import React from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'
import { compact, filter, find, flatten, isArray, isObject, isString, map, reject, uniqBy } from 'lodash'
import APIService from '../../services/APIService'
import { ALL } from '../../common/constants'

const optionId = option => (isString(option) ? option : option?.id)

const ALL_OPTION = { id: ALL, name: 'ALL' }
const SAME_AS_OPTION = { id: 'SAME-AS', name: 'SAME-AS' }

const mapTypeRequests = new Map()

const fetchSourceMapTypes = url => {
  if (!mapTypeRequests.has(url)) {
    const request = APIService.new()
      .overrideURL(url)
      .appendToUrl('summary/')
      .get(null, null, { verbose: true, distribution: 'map_type' })
      .then(response => map(response?.data?.distribution?.map_type, item => ({ id: item.map_type, name: item.map_type })))
      .catch(error => {
        mapTypeRequests.delete(url)
        throw error
      })
    mapTypeRequests.set(url, request)
  }
  return mapTypeRequests.get(url)
}

const SourceMapTypeDropdown = ({ value, label, placeholder, sources, disabled, includeAll, includeSameAs, multiple, freeSolo, backgroundColor, onChange }) => {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [fetched, setFetched] = React.useState(false)
  const [fetchedMapTypes, setFetchedMapTypes] = React.useState([])

  const sourcesKeyRef = React.useRef('')
  const sourceURLs = compact(map(sources, 'url'))
  const sourcesKey = sourceURLs.join(',')
  const selectedIds = compact((value || '').split(','))

  React.useEffect(() => {
    sourcesKeyRef.current = sourcesKey
    setFetched(false)
    setFetchedMapTypes([])
    setLoading(false)
  }, [sourcesKey])

  React.useEffect(() => {
    if (!open || fetched || disabled || !sourceURLs.length) return
    const requestKey = sourcesKey
    setLoading(true)
    Promise.all(sourceURLs.map(fetchSourceMapTypes))
      .then(results => {
        if (sourcesKeyRef.current !== requestKey) return
        setFetchedMapTypes(uniqBy(compact(flatten(results)), 'id'))
        setFetched(true)
        setLoading(false)
      })
      .catch(() => {
        if (sourcesKeyRef.current === requestKey) setLoading(false)
      })
  }, [open, sourcesKey])

  const options = React.useMemo(() => {
    let result = reject(uniqBy([...fetchedMapTypes, ...selectedIds.map(id => ({ id, name: id }))], 'id'), { id: ALL })
    if (includeSameAs) result = [...result, SAME_AS_OPTION]
    if (includeAll || selectedIds.includes(ALL)) result = [...result, ALL_OPTION]
    return uniqBy(result, 'id')
  }, [fetchedMapTypes, value, includeAll, includeSameAs])

  const selected = multiple
    ? filter(options, option => selectedIds.includes(option.id))
    : find(options, { id: value }) || null

  const toStringValue = val => {
    if (isArray(val)) {
      let items = val
      if (find(items, { id: ALL }) && items.length > 1) items = reject(items, { id: ALL })
      return map(items, item => (isString(item) ? item : item.id)).join(',')
    }
    if (isObject(val)) return val.id
    return val || ''
  }

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      loading={loading}
      disabled={disabled}
      multiple={multiple}
      freeSolo={freeSolo}
      options={options}
      value={selected}
      size='small'
      getOptionLabel={option => (isString(option) ? option : option?.name || '')}
      isOptionEqualToValue={(option, item) => optionId(option) === optionId(item)}
      onChange={(event, val) => onChange(toStringValue(val))}
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          size='small'
          sx={{ backgroundColor: backgroundColor || 'primary.contrastText' }}
          slotProps={{
            ...params.slotProps,
            input: {
              ...params.slotProps?.input,
              endAdornment: (
                <React.Fragment>
                  {loading ? <CircularProgress color='inherit' size={16} /> : null}
                  {params.slotProps?.input?.endAdornment}
                </React.Fragment>
              ),
            },
          }}
        />
      )}
    />
  )
}

export default SourceMapTypeDropdown
