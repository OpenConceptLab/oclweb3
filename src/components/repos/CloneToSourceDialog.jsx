import React from 'react'
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Autocomplete from '@mui/material/Autocomplete'
import CircularProgress from '@mui/material/CircularProgress'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import CodeIcon from '@mui/icons-material/CodeOutlined'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import BackIcon from '@mui/icons-material/ArrowBackOutlined'
import { compact, get, includes, isEmpty, map, toLower, uniqBy } from 'lodash'
import APIService from '../../services/APIService'
import { getCurrentUserSources, dropVersion, toParentURI } from '../../common/utils'
import Dialog from '../common/Dialog'
import DialogTitle from '../common/DialogTitle'
import CloseIconButton from '../common/CloseIconButton'
import GroupHeader from '../common/GroupHeader'
import GroupItems from '../common/GroupItems'
import AutocompleteLoading from '../common/AutocompleteLoading'
import CloneCascadeParams from './CloneCascadeParams'
import CloneConceptsTable from './CloneConceptsTable'
import CloneToSourcePreview from './CloneToSourcePreview'
import RepoChip from './RepoChip'
import RepoTooltip from './RepoTooltip'

const DEFAULT_CLONE_PARAMS = {
  mapTypes: 'Q-AND-A,CONCEPT-SET',
  excludeMapTypes: '',
  returnMapTypes: '*',
  cascadeLevels: '*',
  equivalencyMapType: 'SAME-AS',
}

const CloneToSourceDialog = ({ open, onClose, concept, concepts: conceptsProp }) => {
  const { t } = useTranslation()
  const selectedConcepts = React.useMemo(
    () => conceptsProp || (concept ? [concept] : []),
    [conceptsProp, concept]
  )

  const [sources, setSources] = React.useState([])
  const [loadingSources, setLoadingSources] = React.useState(false)
  const [selected, setSelected] = React.useState(null)
  const [input, setInput] = React.useState('')
  const [params, setParams] = React.useState(DEFAULT_CLONE_PARAMS)
  const [showAdvanced, setShowAdvanced] = React.useState(false)
  const [showPreview, setShowPreview] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [result, setResult] = React.useState(null)
  const [error, setError] = React.useState(null)
  const [previewConcept, setPreviewConcept] = React.useState(null)
  const [previewLoading, setPreviewLoading] = React.useState(false)
  const [previewResults, setPreviewResults] = React.useState({})

  React.useEffect(() => {
    if (!open) {
      setSources([])
      return
    }
    setLoadingSources(true)
    setSelected(null)
    setInput('')
    setParams(DEFAULT_CLONE_PARAMS)
    setShowAdvanced(false)
    setShowPreview(false)
    setResult(null)
    setError(null)
    setPreviewConcept(null)
    setPreviewResults({})
    const seen = new Set()
    getCurrentUserSources(batch => {
      setSources(prev => [
        ...prev,
        ...batch.filter(source => {
          if (seen.has(source.url)) return false
          seen.add(source.url)
          return true
        }),
      ])
      setLoadingSources(false)
    })
  }, [open])

  const conceptUrls = selectedConcepts.map(item => dropVersion(item.url) || item.url).filter(Boolean)
  const requestParams = { ...params, omitIfExistsIn: selected?.url || '' }
  const payload = { expressions: conceptUrls, parameters: requestParams }
  const requestURL = selected?.url ? `${selected.url}concepts/$clone/` : '/:owner/sources/:source/concepts/$clone/'

  const conceptSources = uniqBy(
    compact(selectedConcepts.map(item => (item.url ? { url: toParentURI(item.url) } : null))),
    'url'
  )

  const conceptRows = selectedConcepts.map(item => {
    const url = dropVersion(item.url) || item.url
    const response = result ? get(result, url) : null
    return {
      ...item,
      ...(response ? { status: response.status, total: response?.bundle?.total || 0, bundle: response?.bundle } : {}),
    }
  })

  const filterSourceOptions = (options, { inputValue }) => {
    if (!inputValue) return options
    const query = toLower(inputValue)
    return options.filter(option =>
      includes(toLower(option.name), query) ||
      includes(toLower(option.id), query) ||
      includes(toLower(option.short_code), query) ||
      includes(toLower(option.owner), query)
    )
  }

  const handleClose = () => {
    if (submitting) return
    onClose()
  }

  const handleSubmit = () => {
    if (!selected?.url || isEmpty(conceptUrls)) return
    setSubmitting(true)
    setError(null)
    setResult(null)
    APIService.new()
      .overrideURL(selected.url)
      .appendToUrl('concepts/$clone/')
      .post(payload)
      .then(response => {
        setSubmitting(false)
        if (response?.status === 200) setResult(response.data)
        else setError(response?.detail || response?.error || t('errors.generic'))
      })
  }

  const onPreviewClick = (previewTarget, isCloned) => {
    if (!previewTarget) return
    const cached = previewResults[previewTarget.url]
    if (cached) {
      setPreviewConcept({ ...previewTarget, previewBundle: cached })
      return
    }
    setPreviewConcept(previewTarget)
    setPreviewLoading(true)
    const query = isCloned
      ? { view: 'flat', listing: true }
      : {
        ...requestParams,
        includeSelf: false,
        uri: previewTarget.source_url || toParentURI(previewTarget.url || ''),
        view: 'flat',
        listing: true,
      }
    APIService.new()
      .overrideURL(previewTarget.url)
      .appendToUrl('$cascade/')
      .get(null, null, query)
      .then(response => {
        setPreviewLoading(false)
        const bundle = response?.data
        setPreviewResults(prev => ({ ...prev, [previewTarget.url]: bundle }))
        setPreviewConcept({ ...previewTarget, previewBundle: bundle })
      })
  }

  const done = Boolean(result)
  const sourceName = selected ? `${selected.owner}/${selected.short_code || selected.id}` : ''

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth='md'>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {Boolean(previewConcept) && (
              <Button
                size='small'
                startIcon={<BackIcon fontSize='inherit' />}
                onClick={() => setPreviewConcept(null)}
                sx={{ textTransform: 'none' }}
              >
                {t('cloneToSource.back')}
              </Button>
            )}
            {previewConcept ? t('cloneToSource.preview_title') : t('cloneToSource.title')}
          </Box>
          <CloseIconButton onClick={handleClose} disabled={submitting} size='small' />
        </Box>
      </DialogTitle>
      <DialogContent sx={{ padding: '16px 0 0 0 !important', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {previewConcept ? (
          <CloneToSourcePreview concept={previewConcept} isLoading={previewLoading} />
        ) : (
          <React.Fragment>
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              {t('cloneToSource.description')}
            </Typography>

            <Autocomplete
              filterOptions={filterSourceOptions}
              openOnFocus
              blurOnSelect
              options={sources}
              loading={loadingSources}
              value={selected}
              inputValue={input}
              isOptionEqualToValue={(option, value) => option.url === value.url}
              getOptionLabel={option => (option ? `${option.name || option.id} (${option.owner})` : '')}
              groupBy={option => option.owner}
              onInputChange={(_, value) => setInput(value || '')}
              onChange={(_, item) => setSelected(item)}
              disabled={submitting || done}
              renderInput={inputParams => (
                <TextField
                  {...inputParams}
                  label={t('cloneToSource.target_source')}
                  variant='outlined'
                  fullWidth
                  size='small'
                  sx={{ backgroundColor: 'surface.n92' }}
                  slotProps={{
                    ...inputParams.slotProps,
                    input: {
                      ...inputParams.slotProps?.input,
                      endAdornment: (
                        <React.Fragment>
                          {loadingSources ? <CircularProgress color='inherit' size={16} /> : null}
                          {inputParams.slotProps?.input?.endAdornment}
                        </React.Fragment>
                      ),
                    },
                  }}
                />
              )}
              loadingText={<AutocompleteLoading text={input} />}
              noOptionsText={t('cloneToSource.no_editable_sources')}
              renderGroup={groupParams => (
                <li style={{ listStyle: 'none' }} key={groupParams.group}>
                  <GroupHeader>{groupParams.group}</GroupHeader>
                  <GroupItems>{groupParams.children}</GroupItems>
                </li>
              )}
              renderOption={(optionProps, option) => (
                <React.Fragment key={option.url}>
                  <li
                    {...optionProps}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px' }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '8px' }}>
                      {option.name || option.id}
                    </span>
                    <RepoTooltip repo={option} enterDelay={1000} enterNextDelay={1000}>
                      <span>
                        <RepoChip noTooltip noLink size='small' repo={option} />
                      </span>
                    </RepoTooltip>
                  </li>
                  <Divider component='li' style={{ listStyle: 'none' }} />
                </React.Fragment>
              )}
            />

            <Box>
              <Button
                size='small'
                variant='text'
                endIcon={showAdvanced ? <ArrowDropUpIcon fontSize='inherit' /> : <ArrowDropDownIcon fontSize='inherit' />}
                onClick={() => setShowAdvanced(value => !value)}
                sx={{ textTransform: 'none', ml: '-4px' }}
              >
                {t('cloneToSource.advanced_settings')}
              </Button>
              <Collapse in={showAdvanced} unmountOnExit>
                <CloneCascadeParams
                  params={params}
                  onChange={newParams => {
                    setParams(newParams)
                    setPreviewResults({})
                  }}
                  disabled={submitting || done}
                  conceptSources={conceptSources}
                  toSource={selected}
                />
              </Collapse>
            </Box>

            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              {t('cloneToSource.summary', { count: selectedConcepts.length })}
              {selected ? <React.Fragment>: <strong>{sourceName}</strong></React.Fragment> : null}
            </Typography>

            <CloneConceptsTable
              concepts={conceptRows}
              toSourceUrl={selected?.url}
              showProgress={submitting}
              showStatus={submitting || done}
              onPreviewClick={onPreviewClick}
              equivalencyMapType={params.equivalencyMapType}
            />

            <Box>
              <Button
                size='small'
                variant='text'
                startIcon={<CodeIcon fontSize='inherit' />}
                onClick={() => setShowPreview(value => !value)}
                sx={{ textTransform: 'none', ml: '-4px' }}
              >
                {showPreview ? t('cloneToSource.hide_api_call') : t('cloneToSource.preview_api_call')}
              </Button>
              <Collapse in={showPreview} unmountOnExit>
                <Box
                  sx={{
                    mt: 1,
                    p: 1.25,
                    bgcolor: 'surface.n96',
                    borderRadius: 1,
                    fontFamily: 'monospace', // eslint-disable-line spellcheck/spell-checker
                    fontSize: '0.72rem',
                    wordBreak: 'break-all',
                    color: 'text.secondary',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {`POST ${requestURL}\n\n${JSON.stringify(payload, null, 2)}`}
                </Box>
              </Collapse>
            </Box>

            {submitting && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
                <CircularProgress size={20} />
                <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                  {t('cloneToSource.cloning')}
                </Typography>
              </Box>
            )}

            {error && <Alert severity='error'>{error}</Alert>}

            {done && (
              <Alert severity={map(conceptRows, 'status').every(status => status === 200) ? 'success' : 'warning'}>
                {t('cloneToSource.clone_finished')}
              </Alert>
            )}
          </React.Fragment>
        )}
      </DialogContent>
      {!previewConcept && (
        <DialogActions sx={{ pt: 2, px: 0 }}>
          {!done && (
            <Button
              variant='contained'
              onClick={handleSubmit}
              disabled={!selected || submitting || isEmpty(conceptUrls)}
              sx={{ textTransform: 'none' }}
            >
              {t('cloneToSource.clone_button')}
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  )
}

export default CloneToSourceDialog
