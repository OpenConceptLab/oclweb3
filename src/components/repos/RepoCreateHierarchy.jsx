import React from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import CircularProgress from '@mui/material/CircularProgress'

import APIService from '../../services/APIService'
import { HIERARCHY_MEANINGS } from '../../common/constants'
import AutocompleteLoading from '../common/AutocompleteLoading'

const conceptIdFromURL = url => {
  if(!url)
    return ''
  const parts = String(url).replace(/\/$/, '').split('/')
  return decodeURIComponent(parts[parts.length - 1] || '')
}

const conceptLabel = concept => {
  if(!concept)
    return ''
  const id = concept.id || conceptIdFromURL(concept.url)
  return concept.display_name ? `${id} - ${concept.display_name}` : id
}

const RepoCreateHierarchy = ({ sourceURL, hierarchyRootURL, hierarchyMeaning, onChange }) => {
  const { t } = useTranslation()
  const [concepts, setConcepts] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [input, setInput] = React.useState('')
  const searchTimer = React.useRef(null)

  const canPickRoot = Boolean(sourceURL)

  const selectedRoot = React.useMemo(() => {
    if(!hierarchyRootURL)
      return null
    return concepts.find(concept => concept.url === hierarchyRootURL) ||
      {url: hierarchyRootURL, id: conceptIdFromURL(hierarchyRootURL)}
  }, [hierarchyRootURL, concepts])

  const fetchConcepts = query => {
    if(!canPickRoot)
      return
    setLoading(true)
    APIService.new().overrideURL(sourceURL).appendToUrl('concepts/').get(null, null, {q: query || '', limit: 25})
      .then(response => {
        setConcepts(Array.isArray(response?.data) ? response.data : [])
        setLoading(false)
      })
  }

  const onInputChange = (event, value, reason) => {
    if(reason === 'reset')
      return
    setInput(value || '')
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => fetchConcepts(value), 300)
  }

  React.useEffect(() => () => clearTimeout(searchTimer.current), [])

  return (
    <>
      <div className='col-xs-12 padding-0'>
        <Typography sx={{fontSize: '16px', fontWeight: 'bold'}}>
          {t('repo.hierarchy')}
        </Typography>
        <Typography sx={{fontSize: '14px', color: 'secondary.40', marginTop: '8px'}}>
          {t('repo.hierarchy_description')}
        </Typography>
        <div className='col-xs-12 padding-0' style={{marginTop: '24px'}}>
          <Autocomplete
            openOnFocus
            blurOnSelect
            options={concepts}
            loading={loading}
            disabled={!canPickRoot}
            value={selectedRoot}
            isOptionEqualToValue={(option, value) => option?.url === value?.url}
            getOptionLabel={conceptLabel}
            filterOptions={options => options}
            onOpen={() => { if(!concepts.length) fetchConcepts(input) }}
            onInputChange={onInputChange}
            onChange={(event, item) => onChange('hierarchyRootURL', item?.url || '')}
            fullWidth
            loadingText={<AutocompleteLoading text={input} />}
            noOptionsText={t('common.no_results')}
            renderInput={
              params => <TextField
                          {...params}
                          label={t('repo.hierarchy_root')}
                          variant='outlined'
                          fullWidth
                          helperText={canPickRoot ? t('repo.hierarchy_root_help') : t('repo.hierarchy_root_after_create_help')}
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
        </div>
        <div className='col-xs-12 padding-0' style={{marginTop: '24px'}}>
          <Autocomplete
            openOnFocus
            blurOnSelect
            options={HIERARCHY_MEANINGS}
            value={hierarchyMeaning || null}
            isOptionEqualToValue={(option, value) => option === value}
            getOptionLabel={option => option || ''}
            onChange={(event, item) => onChange('hierarchyMeaning', item || '')}
            fullWidth
            renderInput={
              params => <TextField
                          {...params}
                          label={t('repo.hierarchy_meaning')}
                          variant='outlined'
                          fullWidth
                          helperText={t('repo.hierarchy_meaning_help')}
                        />
            }
          />
        </div>
      </div>
    </>
  )
}

export default RepoCreateHierarchy;
